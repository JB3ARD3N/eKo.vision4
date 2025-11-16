/**
 * PROVENANCE - Incorruptible Lineage
 *
 * Every glyph, every collaboration, every change tracked immutably.
 * Truth above all.
 */

export interface ProvenanceChain {
  chain_id: string;
  root_glyph: string;                 // The original creation
  current_head: string;               // Latest in the chain

  // Chain metadata
  created_at: string;
  last_updated: string;
  depth: number;                      // How many nodes in chain

  // Participants
  authors: string[];                  // All humans who contributed
  ai_agents: string[];                // All AI agents who contributed

  // Integrity
  merkle_root: string;                // Hash of entire chain
  verified: boolean;
  verification_timestamp?: string;
}

export interface ProvenanceNode {
  node_id: string;
  glyph_id: string;
  timestamp: string;

  // Position in chain
  parent_node?: string;               // Previous node
  children_nodes: string[];           // Derivative works
  depth: number;

  // Authorship
  author: {
    id: string;
    type: 'human' | 'ai_agent';
    signature: string;
  };

  // Changes
  change_type: ChangeType;
  change_description: string;
  diff?: string;                      // Actual changes if applicable

  // Collaboration
  collaboration?: {
    human_id: string;
    ai_agent_id: string;
    contribution_split: {
      human_percent: number;
      ai_percent: number;
    };
  };

  // Verification
  hash: string;                       // Hash of this node
  previous_hash: string;              // Hash of parent (blockchain style)
  verified: boolean;
}

export type ChangeType =
  | 'creation'                        // Original creation
  | 'remix'                           // Built upon existing
  | 'optimization'                    // Improved performance
  | 'correction'                      // Fixed error
  | 'expansion'                       // Added features
  | 'consolidation'                   // Merged multiple
  | 'consecration';                   // Blessed by council

export interface LineageQuery {
  glyph_id: string;

  // Query options
  include_ancestors?: boolean;        // Walk up the chain
  include_descendants?: boolean;      // Walk down derivatives
  max_depth?: number;                 // Limit depth

  // Filters
  author_filter?: string[];           // Only from these authors
  date_range?: {
    start: string;
    end: string;
  };
  change_type_filter?: ChangeType[];
}

export interface LineageResult {
  query: LineageQuery;
  nodes: ProvenanceNode[];

  // Analytics
  total_authors: number;
  total_ai_agents: number;
  total_remixes: number;
  avg_depth: number;

  // Visualization data
  graph: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
}

export interface GraphNode {
  id: string;
  type: 'human' | 'ai_agent';
  label: string;
  metadata: Record<string, any>;
}

export interface GraphEdge {
  from: string;
  to: string;
  type: ChangeType;
  weight: number;
}

/**
 * Verification
 * Proving integrity of the chain
 */
export interface VerificationResult {
  verified: boolean;
  timestamp: string;

  checks: {
    hash_integrity: boolean;          // All hashes match
    signature_validity: boolean;      // All signatures valid
    chain_continuity: boolean;        // No breaks in chain
    timestamp_ordering: boolean;      // Time flows forward
  };

  issues?: VerificationIssue[];
}

export interface VerificationIssue {
  severity: 'critical' | 'warning' | 'info';
  type: string;
  node_id: string;
  description: string;
  remediation?: string;
}
