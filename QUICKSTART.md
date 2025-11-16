# Quick Start Guide: Building the AGI Foundation

This guide will get you from 70% complete codebase to production-ready AGI system in 4 weeks.

## Prerequisites

- Node.js 20+
- pnpm 9+
- Docker & Docker Compose
- 16GB+ RAM recommended
- OpenAI API key (for embeddings)
- Anthropic API key (for Claude routing)

## Day 1: Database Setup (2 hours)

### Step 1: Start Database Stack

```bash
# From project root
docker-compose up -d

# Verify all services are healthy
docker-compose ps

# Expected output:
# mikedrop-postgres   Up (healthy)
# mikedrop-memgraph   Up (healthy)
# mikedrop-qdrant     Up (healthy)
# mikedrop-redis      Up (healthy)
```

### Step 2: Verify Connections

```bash
# PostgreSQL
docker exec -it mikedrop-postgres psql -U mikedrop -d mikedrop -c "\dt"
# Should show all tables created by init-postgres.sql

# Memgraph Lab UI
open http://localhost:3000
# Should show Memgraph Lab interface with 7 Agent nodes

# Qdrant Dashboard
open http://localhost:6333/dashboard
# Should show empty collections (ready for vectors)

# Redis
docker exec -it mikedrop-redis redis-cli ping
# Should respond: PONG
```

### Step 3: Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your API keys
# POSTGRES_URL=postgresql://mikedrop:dev_password_change_in_production@localhost:5432/mikedrop
# MEMGRAPH_URL=bolt://localhost:7687
# QDRANT_URL=http://localhost:6333
# REDIS_URL=redis://localhost:6379
# OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=sk-ant-...
# GROQ_API_KEY=gsk_...
# GOOGLE_API_KEY=...
```

## Day 2: Storage Package Implementation (4 hours)

### Step 1: Create Storage Package

```bash
cd packages
mkdir storage
cd storage
pnpm init
```

### Step 2: Install Dependencies

```bash
pnpm add pg @qdrant/js-client-rest memgraph ioredis
pnpm add -D @types/pg vitest
```

### Step 3: Implement HybridStorage

See `packages/storage/src/hybrid-storage.ts` in the roadmap document.

Key interfaces to implement:

- `storeExperiment()` - Store with automatic multi-dimensional linking
- `storeGlyph()` - Store in PostgreSQL + Qdrant
- `storePattern()` - Store in PostgreSQL + Memgraph
- `autoLink()` - Semantic, temporal, causal, parameter-based linking
- `query()` - Unified query interface across all databases

### Step 4: Migration Script

```bash
# Create migration script
mkdir -p scripts
touch scripts/migrate-to-persistent.ts

# Run migration
pnpm tsx scripts/migrate-to-persistent.ts
```

This migrates all in-memory data (Codex, Grimoire) to persistent storage.

## Day 3: Benchmark Framework (4 hours)

### Step 1: Create Benchmarks Package

```bash
cd packages
mkdir benchmarks
cd benchmarks
pnpm init
pnpm add @mikedrop/types @mikedrop/tournament @mikedrop/storage
```

### Step 2: Download ARC-AGI Dataset

```bash
# ARC-AGI is publicly available
mkdir -p data
cd data

# Download training set
curl -O https://github.com/fchollet/ARC-AGI/raw/master/data/training.json

# Download evaluation set
curl -O https://github.com/fchollet/ARC-AGI/raw/master/data/evaluation.json

# Download test set
curl -O https://github.com/fchollet/ARC-AGI/raw/master/data/test.json
```

### Step 3: Implement ARC-AGI Benchmark

See `packages/benchmarks/src/arc-agi.ts` in the roadmap.

Key methods:
- `evaluate(sampleSize)` - Run N problems, return accuracy
- `trackProgress()` - Compare to historical results
- `formatProblemAsQuery()` - Convert ARC problem to Tournament Brain input

### Step 4: Run Baseline

```bash
# Run initial baseline (expect 5-15% without world models)
pnpm run benchmark:arcagi --samples 100

# Store results in database
# Track this as your starting point
```

## Day 4: Testing Infrastructure (4 hours)

### Step 1: Install Vitest

```bash
# In project root
pnpm add -D vitest @vitest/ui @vitest/coverage-v8
```

### Step 2: Configure Vitest

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/*.test.ts']
    }
  }
});
```

### Step 3: Write First Tests

```bash
# For each package, create __tests__ directory
mkdir -p packages/tournament/__tests__
mkdir -p packages/router/__tests__
mkdir -p packages/compression/__tests__

# Write tests following examples in IMPLEMENTATION_ROADMAP.md
```

### Step 4: Run Tests

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run in watch mode during development
pnpm test:watch

# Target: 80% coverage before moving forward
```

## Week 2: World Model Integration (20 hours)

### Step 1: Create World Model Package

```bash
cd packages
mkdir world-model
cd world-model
pnpm init
pnpm add onnxruntime-node @xenova/transformers
```

### Step 2: Options for V-JEPA Integration

**Option A: ONNX Runtime (Recommended for TS)**

```typescript
// Use V-JEPA exported to ONNX format
// Inference in TypeScript via onnxruntime-node
// Pros: Native TS, fast inference
// Cons: Requires ONNX conversion (Meta provides PyTorch only)
```

**Option B: Python Bridge**

```typescript
// Call Python subprocess for V-JEPA inference
// Pros: Direct use of Meta's model
// Cons: Slower, requires Python environment
```

**Option C: Embedding Layer First (MVP)**

```typescript
// Start with just the embedding layer
// Use world model embeddings to ground existing agents
// Full V-JEPA integration in Phase 2
// Pros: Faster to implement, immediate value
// Cons: Not full world model capabilities yet
```

**Recommended: Start with Option C (MVP), migrate to Option A later**

### Step 3: Implement Grounding Layer

```typescript
// packages/world-model/src/grounding-layer.ts
export class GroundingLayer {
  /**
   * Convert text/image to grounded representation
   * Uses pre-trained embeddings + domain-specific fine-tuning
   */
  async generateGroundedRepresentation(
    input: string | Buffer
  ): Promise<GroundedRepresentation> {
    // 1. Generate embedding (OpenAI, Cohere, or local)
    // 2. Add physics/causality validators
    // 3. Return grounded representation
  }
}
```

### Step 4: Integrate with Tournament Brain

```typescript
// Modify packages/tournament/src/debate-cluster.ts
// Add grounding to proposal generation
// Agents now have common sense checks via world model
```

### Step 5: Measure Improvement

```bash
# Run ARC-AGI benchmark again
pnpm run benchmark:arcagi --samples 100

# Expected improvement: 5-15% → 20-30%
# This validates world model grounding is working
```

## Week 3: LLM API Integration (20 hours)

### Step 1: Create LLM Client Package

```bash
cd packages
mkdir llm-client
cd llm-client
pnpm init
pnpm add openai @anthropic-ai/sdk @google/generative-ai groq-sdk
```

### Step 2: Implement Multi-Provider Client

See `packages/router/src/llm-client.ts` in roadmap.

Implement methods for:
- `callGroq()` - Free tier (Llama 3.3 70B)
- `callGoogle()` - Free tier (Gemini Flash)
- `callDeepSeek()` - Cheap tier ($0.14/$0.28 per 1M)
- `callOpenAI()` - Premium tier (GPT-4o)
- `callAnthropic()` - Premium tier (Claude)

### Step 3: Wire Router

```typescript
// Modify packages/router/src/smart-router.ts
import { LLMClient } from '@mikedrop/llm-client';

export class SmartRouter {
  async route(query: string): Promise<string> {
    // 1. Analyze complexity
    const complexity = this.analyzer.analyze(query);

    // 2. Select provider/model
    const decision = this.optimizer.findOptimalRoute(complexity);

    // 3. Execute via LLM client (NOW ACTUALLY CALLS APIs!)
    const response = await this.llmClient.execute(decision, query);

    // 4. Record outcome for learning
    await this.learner.recordOutcome(decision, response);

    return response;
  }
}
```

### Step 4: Test Routing Economics

```bash
# Run 100 test queries with complexity distribution
pnpm run test:routing --queries 100

# Expected cost breakdown:
# - 60% routed to free (Groq/Google)
# - 25% routed to cheap (DeepSeek)
# - 15% routed to premium (Claude)
# Total cost: ~90% savings vs all-premium
```

## Week 4: Validation & Launch Prep (20 hours)

### Step 1: Comprehensive Benchmark Suite

```bash
# Run all benchmarks
pnpm run benchmark:all

# Expected results:
# - ARC-AGI: 30-40% (vs 5-15% baseline)
# - WinoGrande: 75%+ (common sense improved via grounding)
# - MMLU: 85%+ (knowledge breadth maintained)
# - Tournament effectiveness: +15% over single agent
# - Cost: 90% savings maintained
```

### Step 2: Create Monitoring Dashboard

```typescript
// packages/monitoring/src/dashboard.ts
// Real-time visualization of:
// - Benchmark scores over time
// - Cost analytics (actual spend vs would-have-spent)
// - Agent Elo ratings
// - Storage usage (hot/warm/cold tiers)
// - System health (latency, errors)
```

### Step 3: Load Testing

```bash
# Install k6 for load testing
brew install k6  # or: curl https://get.k6.io | bash

# Create load test script
# scripts/load-test.js

# Run load test
k6 run scripts/load-test.js

# Target: 100 RPS sustained, <2s p95 latency
```

### Step 4: Security Audit

- [ ] SQL injection prevention (parameterized queries)
- [ ] API key rotation mechanism
- [ ] Rate limiting per user/IP
- [ ] Input validation and sanitization
- [ ] Secrets management (never commit .env)
- [ ] HTTPS only in production

### Step 5: Documentation

```bash
# Generate API docs from TypeScript types
pnpm add -D typedoc
pnpm typedoc

# Write user guides
# - API Reference
# - Integration Guide
# - Best Practices
# - Troubleshooting
```

### Step 6: Deployment

```bash
# Build for production
pnpm run build

# Deploy to staging
# Test with real users (private beta)

# Deploy to production (December 12, 2025)
# Monitor closely for first 48 hours
```

## Verification Checklist

Before considering Phase 1 complete, verify:

- [ ] All databases running and healthy
- [ ] In-memory data migrated to persistent storage
- [ ] ARC-AGI benchmark shows 20-30%+ accuracy
- [ ] Test coverage >80% across all packages
- [ ] No regressions in existing functionality
- [ ] Monitoring dashboard operational
- [ ] Cost tracking shows 85-90% savings
- [ ] World model grounding integrated with all agents

## Troubleshooting

### Database Connection Issues

```bash
# Check Docker logs
docker-compose logs postgres
docker-compose logs memgraph
docker-compose logs qdrant

# Restart services
docker-compose restart

# Reset databases (WARNING: deletes all data)
docker-compose down -v
docker-compose up -d
```

### Out of Memory

```bash
# Increase Docker memory limit
# Docker Desktop → Settings → Resources → Memory → 8GB+

# Or optimize batch sizes in code
# Reduce concurrent Tournament Brain debates
# Enable pagination in database queries
```

### Slow Benchmarks

```bash
# Use smaller sample sizes during development
pnpm run benchmark:arcagi --samples 10

# Run full evaluation only weekly
# Use CI/CD for automated nightly benchmarks
```

### API Rate Limits

```bash
# Groq: 30 RPM free tier → add delays between calls
# OpenAI: Tier-based limits → upgrade tier or add retry logic
# Implement exponential backoff for all API calls
```

## Next Steps After Quick Start

1. **Week 5-6**: Fine-tune world model on domain-specific data
2. **Week 7-8**: Implement continual learning (HOPE architecture)
3. **Week 9-10**: Add voice interface (Living Oval)
4. **Week 11-12**: Production hardening and scale testing

## Support

- GitHub Issues: Report bugs and feature requests
- Documentation: See `/docs` directory
- Architecture Questions: See `IMPLEMENTATION_ROADMAP.md`
- Research Context: See your AGI research document

---

**Remember**: Build bottom-up, test continuously, measure systematically.

The foundation (world models + storage + benchmarks) enables everything else.
