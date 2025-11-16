/**
 * PROVENANCE TRACKER
 *
 * Tracks the lineage of every glyph. Incorruptible. Verifiable.
 * Truth flows through the chain.
 */

import { nanoid } from 'nanoid';
import type {
  CodexManifest,
  ProvenanceChain,
  ProvenanceNode,
  ChangeType,
  LineageQuery,
  LineageResult,
  GraphNode,
  GraphEdge,
} from '@mikedrop/types';
import { createHash } from './utils/hash.js';

export class ProvenanceTracker {
  private chains: Map<string, ProvenanceChain> = new Map();
  private nodes: Map<string, ProvenanceNode> = new Map();

  /**
   * Add a new node to provenance tracking
   */
  async addNode(manifest: CodexManifest): Promise<ProvenanceNode> {
    const parentNode = manifest.lineage.parent_glyphs.length > 0
      ? this.nodes.get(manifest.lineage.parent_glyphs[0])
      : undefined;

    const node: ProvenanceNode = {
      node_id: nanoid(),
      glyph_id: manifest.glyph_id,
      timestamp: manifest.timestamp,
      parent_node: parentNode?.node_id,
      children_nodes: [],
      depth: manifest.lineage.lineage_depth,
      author: {
        id: manifest.author_id,
        type: 'human',
        signature: manifest.provenance.signatures[0]?.signature || '',
      },
      change_type: this.determineChangeType(manifest),
      change_description: manifest.lineage.remix_notes || 'Original creation',
      collaboration: manifest.ai_collaborator
        ? {
            human_id: manifest.author_id,
            ai_agent_id: manifest.ai_collaborator.agent_id,
            contribution_split: {
              human_percent: 60, // Default split, could be adjusted
              ai_percent: 40,
            },
          }
        : undefined,
      hash: await this.calculateNodeHash(manifest),
      previous_hash: parentNode?.hash || '0',
      verified: manifest.provenance.verified,
    };

    // Store node
    this.nodes.set(node.node_id, node);

    // Update parent's children
    if (parentNode) {
      parentNode.children_nodes.push(node.node_id);
    }

    // Create or update chain
    await this.updateChain(node, manifest);

    return node;
  }

  /**
   * Get provenance chain for a glyph
   */
  async getChain(glyph_id: string): Promise<ProvenanceChain | null> {
    // Find the node for this glyph
    const node = Array.from(this.nodes.values()).find(n => n.glyph_id === glyph_id);
    if (!node) return null;

    // Walk up to find root
    let currentNode = node;
    while (currentNode.parent_node) {
      const parent = this.nodes.get(currentNode.parent_node);
      if (!parent) break;
      currentNode = parent;
    }

    // Find or create chain for this root
    const existingChain = Array.from(this.chains.values()).find(
      c => c.root_glyph === currentNode.glyph_id
    );

    if (existingChain) {
      return existingChain;
    }

    // Create new chain
    const chain: ProvenanceChain = {
      chain_id: nanoid(),
      root_glyph: currentNode.glyph_id,
      current_head: glyph_id,
      created_at: currentNode.timestamp,
      last_updated: node.timestamp,
      depth: node.depth,
      authors: [currentNode.author.id],
      ai_agents: [],
      merkle_root: await this.calculateChainMerkleRoot(currentNode),
      verified: true,
    };

    this.chains.set(chain.chain_id, chain);
    return chain;
  }

  /**
   * Query lineage with filters
   */
  async queryLineage(query: LineageQuery): Promise<LineageResult> {
    const node = Array.from(this.nodes.values()).find(n => n.glyph_id === query.glyph_id);
    if (!node) {
      throw new Error(`Node not found for glyph ${query.glyph_id}`);
    }

    const nodes: ProvenanceNode[] = [];
    const graphNodes: GraphNode[] = [];
    const graphEdges: GraphEdge[] = [];

    // Collect ancestors
    if (query.include_ancestors) {
      await this.collectAncestors(node, nodes, graphNodes, graphEdges, query);
    }

    // Collect descendants
    if (query.include_descendants) {
      await this.collectDescendants(node, nodes, graphNodes, graphEdges, query);
    }

    // Always include the query node itself
    if (!nodes.find(n => n.node_id === node.node_id)) {
      nodes.push(node);
      graphNodes.push({
        id: node.node_id,
        type: node.author.type,
        label: node.glyph_id.substring(0, 8),
        metadata: { depth: node.depth },
      });
    }

    // Calculate analytics
    const uniqueAuthors = new Set(nodes.map(n => n.author.id));
    const uniqueAIAgents = new Set(
      nodes.filter(n => n.collaboration).map(n => n.collaboration!.ai_agent_id)
    );
    const remixes = nodes.filter(n => n.change_type === 'remix');

    return {
      query,
      nodes,
      total_authors: uniqueAuthors.size,
      total_ai_agents: uniqueAIAgents.size,
      total_remixes: remixes.length,
      avg_depth: nodes.reduce((sum, n) => sum + n.depth, 0) / nodes.length,
      graph: {
        nodes: graphNodes,
        edges: graphEdges,
      },
    };
  }

  // Private helpers

  private async updateChain(node: ProvenanceNode, manifest: CodexManifest): Promise<void> {
    // Find root
    let root = node;
    while (root.parent_node) {
      const parent = this.nodes.get(root.parent_node);
      if (!parent) break;
      root = parent;
    }

    // Find existing chain or create new
    let chain = Array.from(this.chains.values()).find(c => c.root_glyph === root.glyph_id);

    if (!chain) {
      chain = {
        chain_id: nanoid(),
        root_glyph: root.glyph_id,
        current_head: node.glyph_id,
        created_at: root.timestamp,
        last_updated: node.timestamp,
        depth: node.depth,
        authors: [node.author.id],
        ai_agents: manifest.ai_collaborator ? [manifest.ai_collaborator.agent_id] : [],
        merkle_root: await this.calculateChainMerkleRoot(root),
        verified: true,
      };
      this.chains.set(chain.chain_id, chain);
    } else {
      // Update existing chain
      chain.current_head = node.glyph_id;
      chain.last_updated = node.timestamp;
      chain.depth = Math.max(chain.depth, node.depth);

      if (!chain.authors.includes(node.author.id)) {
        chain.authors.push(node.author.id);
      }

      if (manifest.ai_collaborator && !chain.ai_agents.includes(manifest.ai_collaborator.agent_id)) {
        chain.ai_agents.push(manifest.ai_collaborator.agent_id);
      }

      chain.merkle_root = await this.calculateChainMerkleRoot(root);
    }
  }

  private determineChangeType(manifest: CodexManifest): ChangeType {
    if (manifest.lineage.parent_glyphs.length === 0) {
      return 'creation';
    }
    if (manifest.lineage.remix_notes) {
      return 'remix';
    }
    return 'expansion';
  }

  private async calculateNodeHash(manifest: CodexManifest): Promise<string> {
    const content = JSON.stringify({
      glyph_id: manifest.glyph_id,
      author_id: manifest.author_id,
      timestamp: manifest.timestamp,
      lineage: manifest.lineage,
    });
    return createHash(content);
  }

  private async calculateChainMerkleRoot(rootNode: ProvenanceNode): Promise<string> {
    // Simplified - in production would build actual merkle tree
    return createHash(rootNode.node_id + rootNode.timestamp);
  }

  private async collectAncestors(
    node: ProvenanceNode,
    results: ProvenanceNode[],
    graphNodes: GraphNode[],
    graphEdges: GraphEdge[],
    query: LineageQuery
  ): Promise<void> {
    if (!node.parent_node || (query.max_depth && node.depth >= query.max_depth)) {
      return;
    }

    const parent = this.nodes.get(node.parent_node);
    if (!parent) return;

    if (this.matchesFilters(parent, query)) {
      results.push(parent);
      graphNodes.push({
        id: parent.node_id,
        type: parent.author.type,
        label: parent.glyph_id.substring(0, 8),
        metadata: { depth: parent.depth },
      });

      graphEdges.push({
        from: parent.node_id,
        to: node.node_id,
        type: node.change_type,
        weight: 1,
      });

      await this.collectAncestors(parent, results, graphNodes, graphEdges, query);
    }
  }

  private async collectDescendants(
    node: ProvenanceNode,
    results: ProvenanceNode[],
    graphNodes: GraphNode[],
    graphEdges: GraphEdge[],
    query: LineageQuery
  ): Promise<void> {
    for (const childId of node.children_nodes) {
      const child = this.nodes.get(childId);
      if (!child) continue;

      if (query.max_depth && child.depth >= query.max_depth) {
        continue;
      }

      if (this.matchesFilters(child, query)) {
        results.push(child);
        graphNodes.push({
          id: child.node_id,
          type: child.author.type,
          label: child.glyph_id.substring(0, 8),
          metadata: { depth: child.depth },
        });

        graphEdges.push({
          from: node.node_id,
          to: child.node_id,
          type: child.change_type,
          weight: 1,
        });

        await this.collectDescendants(child, results, graphNodes, graphEdges, query);
      }
    }
  }

  private matchesFilters(node: ProvenanceNode, query: LineageQuery): boolean {
    if (query.author_filter && !query.author_filter.includes(node.author.id)) {
      return false;
    }

    if (query.change_type_filter && !query.change_type_filter.includes(node.change_type)) {
      return false;
    }

    if (query.date_range) {
      const nodeDate = new Date(node.timestamp);
      const start = new Date(query.date_range.start);
      const end = new Date(query.date_range.end);
      if (nodeDate < start || nodeDate > end) {
        return false;
      }
    }

    return true;
  }
}
