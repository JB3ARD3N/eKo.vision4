// Memgraph Initialization Script for PROJECT MIKEDROP
// Creates graph schema for causal relationships and knowledge graph

// ============================================
// INDEXES FOR PERFORMANCE
// ============================================

CREATE INDEX ON :Experiment(id);
CREATE INDEX ON :Experiment(timestamp);
CREATE INDEX ON :Experiment(agent_type);
CREATE INDEX ON :Experiment(importance_score);

CREATE INDEX ON :Pattern(id);
CREATE INDEX ON :Pattern(category);
CREATE INDEX ON :Pattern(status);

CREATE INDEX ON :Agent(id);
CREATE INDEX ON :Agent(type);
CREATE INDEX ON :Agent(elo_rating);

CREATE INDEX ON :Glyph(id);
CREATE INDEX ON :Glyph(content_hash);

CREATE INDEX ON :Concept(name);
CREATE INDEX ON :Concept(domain);

// ============================================
// CONSTRAINTS
// ============================================

CREATE CONSTRAINT ON (e:Experiment) ASSERT e.id IS UNIQUE;
CREATE CONSTRAINT ON (p:Pattern) ASSERT p.id IS UNIQUE;
CREATE CONSTRAINT ON (a:Agent) ASSERT a.id IS UNIQUE;
CREATE CONSTRAINT ON (g:Glyph) ASSERT g.id IS UNIQUE;
CREATE CONSTRAINT ON (c:Concept) ASSERT c.name IS UNIQUE;

// ============================================
// SAMPLE INITIAL NODES
// ============================================

// Create avatar agent archetypes
MERGE (apollo:Agent {
    id: 'apollo',
    type: 'apollo',
    archetype: 'strategic_visionary',
    elo_rating: 1300,
    created_at: timestamp()
});

MERGE (athena:Agent {
    id: 'athena',
    type: 'athena',
    archetype: 'wisdom_logic',
    elo_rating: 1300,
    created_at: timestamp()
});

MERGE (ares:Agent {
    id: 'ares',
    type: 'ares',
    archetype: 'execution_action',
    elo_rating: 1300,
    created_at: timestamp()
});

MERGE (mercury:Agent {
    id: 'mercury',
    type: 'mercury',
    archetype: 'communication_clarity',
    elo_rating: 1300,
    created_at: timestamp()
});

MERGE (hermes:Agent {
    id: 'hermes',
    type: 'hermes',
    archetype: 'speed_optimization',
    elo_rating: 1300,
    created_at: timestamp()
});

MERGE (hephaestus:Agent {
    id: 'hephaestus',
    type: 'hephaestus',
    archetype: 'building_crafting',
    elo_rating: 1300,
    created_at: timestamp()
});

MERGE (artemis:Agent {
    id: 'artemis',
    type: 'artemis',
    archetype: 'protection_validation',
    elo_rating: 1300,
    created_at: timestamp()
});

// Create agent synergy relationships
MATCH (apollo:Agent {id: 'apollo'})
MATCH (athena:Agent {id: 'athena'})
MERGE (apollo)-[:SYNERGIZES_WITH {strength: 0.85, reason: 'strategy + logic = robust plans'}]->(athena);

MATCH (athena:Agent {id: 'athena'})
MATCH (ares:Agent {id: 'ares'})
MERGE (athena)-[:SYNERGIZES_WITH {strength: 0.80, reason: 'logic + execution = effective action'}]->(ares);

MATCH (apollo:Agent {id: 'apollo'})
MATCH (mercury:Agent {id: 'mercury'})
MERGE (apollo)-[:SYNERGIZES_WITH {strength: 0.75, reason: 'vision + communication = clear strategy'}]->(mercury);

MATCH (hermes:Agent {id: 'hermes'})
MATCH (hephaestus:Agent {id: 'hephaestus'})
MERGE (hermes)-[:SYNERGIZES_WITH {strength: 0.90, reason: 'optimization + building = efficient creation'}]->(hephaestus);

MATCH (hephaestus:Agent {id: 'hephaestus'})
MATCH (artemis:Agent {id: 'artemis'})
MERGE (hephaestus)-[:SYNERGIZES_WITH {strength: 0.88, reason: 'building + validation = quality assurance'}]->(artemis);

// ============================================
// SAMPLE KNOWLEDGE GRAPH STRUCTURE
// ============================================

// Core AGI concepts
MERGE (agi:Concept {
    name: 'AGI',
    domain: 'artificial_intelligence',
    description: 'Artificial General Intelligence',
    importance: 1.0,
    created_at: timestamp()
});

MERGE (world_models:Concept {
    name: 'World Models',
    domain: 'agi_foundation',
    description: 'Grounded understanding of reality through sensorimotor learning',
    importance: 0.95,
    created_at: timestamp()
});

MERGE (common_sense:Concept {
    name: 'Common Sense Reasoning',
    domain: 'agi_foundation',
    description: 'Intuitive understanding of everyday physics and causality',
    importance: 0.95,
    created_at: timestamp()
});

MERGE (meta_reasoning:Concept {
    name: 'Meta-Reasoning',
    domain: 'agi_capability',
    description: 'Reasoning about reasoning, multi-perspective synthesis',
    importance: 0.85,
    created_at: timestamp()
});

MERGE (continual_learning:Concept {
    name: 'Continual Learning',
    domain: 'agi_capability',
    description: 'Learning without catastrophic forgetting',
    importance: 0.90,
    created_at: timestamp()
});

// Create dependency relationships
MATCH (agi:Concept {name: 'AGI'})
MATCH (world_models:Concept {name: 'World Models'})
MERGE (agi)-[:DEPENDS_ON {strength: 0.95, criticality: 'critical'}]->(world_models);

MATCH (agi:Concept {name: 'AGI'})
MATCH (common_sense:Concept {name: 'Common Sense Reasoning'})
MERGE (agi)-[:DEPENDS_ON {strength: 0.90, criticality: 'critical'}]->(common_sense);

MATCH (common_sense:Concept {name: 'Common Sense Reasoning'})
MATCH (world_models:Concept {name: 'World Models'})
MERGE (common_sense)-[:ENABLED_BY {strength: 0.95}]->(world_models);

MATCH (agi:Concept {name: 'AGI'})
MATCH (meta_reasoning:Concept {name: 'Meta-Reasoning'})
MERGE (agi)-[:DEPENDS_ON {strength: 0.80, criticality: 'important'}]->(meta_reasoning);

MATCH (meta_reasoning:Concept {name: 'Meta-Reasoning'})
MATCH (world_models:Concept {name: 'World Models'})
MERGE (meta_reasoning)-[:DEPENDS_ON {strength: 0.85}]->(world_models);

// ============================================
// GRAPH QUERIES (STORED AS PROCEDURES)
// ============================================

// Note: Memgraph supports custom procedures via Python API
// These are example queries that would be wrapped in procedures

// Query 1: Find all experiments related to a concept (with depth)
// MATCH path = (e:Experiment)-[:RELATED_TO*1..3]->(c:Concept {name: $concept_name})
// RETURN e, path, length(path) as depth
// ORDER BY depth ASC, e.importance_score DESC;

// Query 2: Find synergistic agent pairs
// MATCH (a1:Agent)-[s:SYNERGIZES_WITH]->(a2:Agent)
// WHERE s.strength > $threshold
// RETURN a1.type, a2.type, s.strength, s.reason
// ORDER BY s.strength DESC;

// Query 3: Trace experiment lineage (provenance)
// MATCH path = (e:Experiment {id: $experiment_id})-[:DERIVED_FROM*]->(ancestor:Experiment)
// RETURN path, ancestor
// ORDER BY length(path) DESC;

// Query 4: Find missing links (inference candidates)
// MATCH (e1:Experiment), (e2:Experiment)
// WHERE NOT (e1)-[:SEMANTICALLY_SIMILAR]-(e2)
// AND e1.agent_type = e2.agent_type
// AND abs(e1.timestamp - e2.timestamp) < 7*24*60*60*1000
// RETURN e1.id, e2.id, 'temporal_proximity' as suggested_link
// LIMIT 100;

// ============================================
// ANALYTICS QUERIES
// ============================================

// Create sample analytics node
MERGE (analytics:System {
    name: 'Analytics Dashboard',
    last_updated: timestamp(),
    total_experiments: 0,
    total_patterns: 0,
    total_agents: 7,
    graph_density: 0.0
});
