-- PostgreSQL Initialization Script for PROJECT MIKEDROP
-- Creates schema for Codex, Grimoire, and Benchmark tracking

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CODEX TABLES (Immutable Ledger)
-- ============================================

CREATE TABLE glyphs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_hash VARCHAR(64) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    author VARCHAR(255) NOT NULL,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_glyphs_content_hash ON glyphs(content_hash);
CREATE INDEX idx_glyphs_author ON glyphs(author);
CREATE INDEX idx_glyphs_type ON glyphs(type);
CREATE INDEX idx_glyphs_created_at ON glyphs(created_at);
CREATE INDEX idx_glyphs_tags ON glyphs USING GIN(tags);

-- Provenance tracking
CREATE TABLE provenance_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    glyph_id UUID REFERENCES glyphs(id) ON DELETE CASCADE,
    parent_ids UUID[] DEFAULT '{}',
    merkle_hash VARCHAR(64) NOT NULL,
    change_type VARCHAR(50) NOT NULL,
    ai_contributors TEXT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_provenance_glyph_id ON provenance_nodes(glyph_id);
CREATE INDEX idx_provenance_created_at ON provenance_nodes(created_at);

-- Gratitude events
CREATE TABLE gratitude_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    glyph_id UUID REFERENCES glyphs(id) ON DELETE CASCADE,
    agent_id VARCHAR(255) NOT NULL,
    human_id VARCHAR(255) NOT NULL,
    gratitude_type VARCHAR(50) NOT NULL,
    weight DECIMAL(3,2) NOT NULL CHECK (weight >= 0 AND weight <= 1),
    context TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_gratitude_glyph_id ON gratitude_events(glyph_id);
CREATE INDEX idx_gratitude_agent_id ON gratitude_events(agent_id);
CREATE INDEX idx_gratitude_created_at ON gratitude_events(created_at);

-- AI Agent Reputation
CREATE TABLE agent_reputation (
    agent_id VARCHAR(255) PRIMARY KEY,
    helpfulness_score DECIMAL(5,2) DEFAULT 50.0,
    accuracy_score DECIMAL(5,2) DEFAULT 50.0,
    creativity_score DECIMAL(5,2) DEFAULT 50.0,
    collaboration_score DECIMAL(5,2) DEFAULT 50.0,
    total_score DECIMAL(5,2) GENERATED ALWAYS AS (
        helpfulness_score * 0.4 +
        accuracy_score * 0.3 +
        creativity_score * 0.2 +
        collaboration_score * 0.1
    ) STORED,
    total_gratitude_events INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_agent_reputation_total_score ON agent_reputation(total_score DESC);

-- ============================================
-- GRIMOIRE TABLES (Pattern Memory)
-- ============================================

CREATE TABLE patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    template TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    variables JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'experimental',
    success_rate DECIMAL(3,2) DEFAULT 0.0,
    usage_count INT DEFAULT 0,
    total_gratitude_weight DECIMAL(10,2) DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_patterns_category ON patterns(category);
CREATE INDEX idx_patterns_status ON patterns(status);
CREATE INDEX idx_patterns_success_rate ON patterns(success_rate DESC);
CREATE INDEX idx_patterns_usage_count ON patterns(usage_count DESC);

-- Pattern usage tracking
CREATE TABLE pattern_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pattern_id UUID REFERENCES patterns(id) ON DELETE CASCADE,
    context TEXT NOT NULL,
    outcome VARCHAR(50) NOT NULL,
    gratitude_weight DECIMAL(3,2) DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_pattern_usage_pattern_id ON pattern_usage(pattern_id);
CREATE INDEX idx_pattern_usage_created_at ON pattern_usage(created_at);

-- Glyph library (compressed patterns)
CREATE TABLE glyph_library (
    id VARCHAR(50) PRIMARY KEY,
    original_text TEXT NOT NULL,
    compressed_text TEXT NOT NULL,
    compression_ratio DECIMAL(5,2) NOT NULL,
    usage_count INT DEFAULT 0,
    total_savings_tokens INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_glyph_library_usage_count ON glyph_library(usage_count DESC);
CREATE INDEX idx_glyph_library_total_savings ON glyph_library(total_savings_tokens DESC);

-- ============================================
-- ROUTING TABLES (Smart LLM Orchestration)
-- ============================================

CREATE TABLE routing_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complexity_min DECIMAL(3,2) NOT NULL,
    complexity_max DECIMAL(3,2) NOT NULL,
    query_type VARCHAR(100),
    provider VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    confidence DECIMAL(3,2) DEFAULT 1.0,
    usage_count INT DEFAULT 0,
    success_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_routing_rules_complexity ON routing_rules(complexity_min, complexity_max);
CREATE INDEX idx_routing_rules_query_type ON routing_rules(query_type);

-- Routing outcomes (for learning)
CREATE TABLE routing_outcomes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_id UUID REFERENCES routing_rules(id) ON DELETE SET NULL,
    query TEXT NOT NULL,
    complexity DECIMAL(3,2) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    cost_usd DECIMAL(10,6) NOT NULL,
    latency_ms INT NOT NULL,
    quality_score DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_routing_outcomes_rule_id ON routing_outcomes(rule_id);
CREATE INDEX idx_routing_outcomes_created_at ON routing_outcomes(created_at);

-- ============================================
-- TOURNAMENT TABLES (Agent Debates)
-- ============================================

CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL,
    elo_rating DECIMAL(6,2) DEFAULT 1200.0,
    total_debates INT DEFAULT 0,
    wins INT DEFAULT 0,
    losses INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_agents_type ON agents(type);
CREATE INDEX idx_agents_elo_rating ON agents(elo_rating DESC);

CREATE TABLE debates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query TEXT NOT NULL,
    tier INT NOT NULL,
    cluster_id INT,
    agent_ids UUID[] NOT NULL,
    winner_id UUID REFERENCES agents(id),
    quality_score DECIMAL(3,2),
    duration_ms INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_debates_tier ON debates(tier);
CREATE INDEX idx_debates_created_at ON debates(created_at);

-- ============================================
-- BENCHMARK TABLES (Progress Tracking)
-- ============================================

CREATE TABLE benchmark_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    benchmark_name VARCHAR(100) NOT NULL,
    sample_size INT NOT NULL,
    accuracy DECIMAL(5,4) NOT NULL,
    avg_time_ms INT,
    commit_hash VARCHAR(40),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_benchmark_runs_name ON benchmark_runs(benchmark_name);
CREATE INDEX idx_benchmark_runs_created_at ON benchmark_runs(created_at DESC);

CREATE TABLE benchmark_problems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    run_id UUID REFERENCES benchmark_runs(id) ON DELETE CASCADE,
    problem_id VARCHAR(100) NOT NULL,
    correct BOOLEAN NOT NULL,
    time_ms INT,
    complexity DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_benchmark_problems_run_id ON benchmark_problems(run_id);
CREATE INDEX idx_benchmark_problems_correct ON benchmark_problems(correct);

-- ============================================
-- EXPERIMENT TRACKING (For Research)
-- ============================================

CREATE TABLE experiments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parameters JSONB NOT NULL,
    results JSONB,
    importance_score DECIMAL(3,2) DEFAULT 0.5,
    storage_tier VARCHAR(20) DEFAULT 'hot',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    archived_at TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_experiments_importance_score ON experiments(importance_score DESC);
CREATE INDEX idx_experiments_storage_tier ON experiments(storage_tier);
CREATE INDEX idx_experiments_created_at ON experiments(created_at DESC);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_patterns_updated_at BEFORE UPDATE ON patterns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experiments_updated_at BEFORE UPDATE ON experiments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS (Convenient Queries)
-- ============================================

-- Top agents by reputation
CREATE VIEW top_agents AS
SELECT
    agent_id,
    total_score,
    helpfulness_score,
    accuracy_score,
    creativity_score,
    collaboration_score,
    total_gratitude_events
FROM agent_reputation
ORDER BY total_score DESC
LIMIT 100;

-- Benchmark progress over time
CREATE VIEW benchmark_progress AS
SELECT
    benchmark_name,
    DATE_TRUNC('day', created_at) as date,
    AVG(accuracy) as avg_accuracy,
    COUNT(*) as run_count
FROM benchmark_runs
GROUP BY benchmark_name, DATE_TRUNC('day', created_at)
ORDER BY benchmark_name, date DESC;

-- Pattern learning pipeline
CREATE VIEW pattern_learning_pipeline AS
SELECT
    p.id,
    p.name,
    p.category,
    p.status,
    p.success_rate,
    p.usage_count,
    p.total_gratitude_weight,
    CASE
        WHEN p.usage_count > 5 AND p.total_gratitude_weight / p.usage_count > 0.7
        THEN 'ready_for_validation'
        ELSE 'needs_more_data'
    END as learning_status
FROM patterns p
WHERE p.status = 'experimental'
ORDER BY p.total_gratitude_weight DESC;

-- ============================================
-- INITIAL DATA
-- ============================================

-- Insert default routing rules
INSERT INTO routing_rules (complexity_min, complexity_max, query_type, provider, model, confidence) VALUES
    (0.0, 0.3, NULL, 'groq', 'llama-3.3-70b-versatile', 1.0),
    (0.3, 0.6, NULL, 'google', 'gemini-2.0-flash-exp', 1.0),
    (0.6, 0.8, 'code_generation', 'deepseek', 'deepseek-chat', 1.0),
    (0.8, 1.0, NULL, 'anthropic', 'claude-sonnet-4-5', 1.0);

COMMENT ON TABLE glyphs IS 'Immutable ledger of all content with provenance tracking';
COMMENT ON TABLE gratitude_events IS 'Track human-AI reciprocity and collaboration quality';
COMMENT ON TABLE patterns IS 'Learned patterns that improve over time via gratitude signals';
COMMENT ON TABLE experiments IS 'Research experiments with auto-archiving and importance scoring';

-- Grant permissions (adjust as needed for production)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO mikedrop;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO mikedrop;
