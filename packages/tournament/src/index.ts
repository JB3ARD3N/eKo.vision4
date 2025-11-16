/**
 * TOURNAMENT BRAIN - 100-Agent Hierarchical Debates
 *
 * Tier 1: 100 agents → 20 winners
 * Tier 2: 20 winners → 4 champions
 * Tier 3: 4 champions → 1 best solution
 *
 * Quality: 0.96+ | Time: ~18s | Cost: ~$0.08
 */

export { TournamentBrain } from './tournament-brain.js';
export { DebateCluster } from './debate-cluster.js';
export { AgentPool } from './agent-pool.js';
export { QualityJudge } from './quality-judge.js';
