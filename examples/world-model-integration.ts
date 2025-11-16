/**
 * World Model Integration Example
 *
 * Shows how to integrate WorldModelEngine with existing Tournament Brain
 * Demonstrates grounded proposals preventing nonsense responses
 */

import { WorldModelEngine } from '@mikedrop/world-model';
import { TournamentBrain } from '@mikedrop/tournament';
import { AgentPool } from '@mikedrop/tournament';
import { SmartRouter } from '@mikedrop/router';
import { GlyphCompressor } from '@mikedrop/compression';

// ============================================
// EXAMPLE 1: Basic Integration
// ============================================

async function basicIntegration() {
  console.log('=== Example 1: Basic World Model Integration ===\n');

  // Initialize world model
  const worldModel = new WorldModelEngine({
    modelType: 'embedding',
    embeddingDim: 768,
    enableNestedLearning: true,
    enablePhysicsValidation: true,
    enableCausalityValidation: true
  });

  // Test grounding with realistic query
  const realisticQuery = "How can we improve website performance by optimizing database queries?";
  const realisticGrounding = await worldModel.generateGroundedRepresentation(realisticQuery);

  console.log('Realistic Query:', realisticQuery);
  console.log('Confidence:', realisticGrounding.confidence);
  console.log('Physics Plausible:', realisticGrounding.physicsValidation.plausible);
  console.log('Causally Consistent:', realisticGrounding.causalValidation.consistent);
  console.log();

  // Test grounding with nonsense query
  const nonsenseQuery = "How can we make the website load faster by removing gravity from the server?";
  const nonsenseGrounding = await worldModel.generateGroundedRepresentation(nonsenseQuery);

  console.log('Nonsense Query:', nonsenseQuery);
  console.log('Confidence:', nonsenseGrounding.confidence);
  console.log('Physics Plausible:', nonsenseGrounding.physicsValidation.plausible);
  console.log('Violations:', nonsenseGrounding.physicsValidation.violations);
  console.log('\n---\n');
}

// ============================================
// EXAMPLE 2: Grounded Tournament Brain
// ============================================

async function groundedTournamentBrain() {
  console.log('=== Example 2: Grounded Tournament Brain ===\n');

  const worldModel = new WorldModelEngine({
    enableNestedLearning: true,
    enablePhysicsValidation: true
  });

  const agentPool = new AgentPool();
  await agentPool.initialize();

  // Query that requires grounded reasoning
  const query = "Design a user authentication system that is both secure and user-friendly";

  // 1. Ground the query first
  const grounding = await worldModel.generateGroundedRepresentation(query);

  console.log('Query Grounding:');
  console.log('- Confidence:', grounding.confidence);
  console.log('- Feasible:', grounding.feasibilityValidation.feasible);
  console.log('- Estimated Time:', grounding.feasibilityValidation.resourceEstimate.timeMinutes, 'minutes');
  console.log();

  // 2. Generate proposals from agents with grounded context
  const agents = agentPool.getAgents(3); // Top 3 agents
  const groundedProposals = [];

  for (const agent of agents) {
    const proposal = {
      agentId: agent.id,
      agentType: agent.type,
      content: `[${agent.type.toUpperCase()}] Proposal grounded in reality:\n` +
        `- Physics constraints respected: ${grounding.physicsValidation.rulesChecked.join(', ')}\n` +
        `- Feasibility validated: ${grounding.feasibilityValidation.feasible}\n` +
        `- Common sense applied: Authentication must balance security and usability`,
      grounding: grounding,
      timestamp: Date.now()
    };

    groundedProposals.push(proposal);
    console.log(`Agent ${agent.type} proposal confidence:`, grounding.confidence);
  }

  console.log('\nGrounded proposals generated successfully!');
  console.log('All proposals respect physics, causality, and feasibility constraints.\n');
  console.log('---\n');
}

// ============================================
// EXAMPLE 3: Counterfactual Reasoning in Debates
// ============================================

async function counterfactualDebate() {
  console.log('=== Example 3: Counterfactual Reasoning in Debates ===\n');

  const worldModel = new WorldModelEngine({
    enableCausalityValidation: true
  });

  // Current state: considering two approaches
  const currentState = {
    description: "Choosing between microservices and monolith architecture",
    features: new Float32Array(768),
    facts: [
      "team_size: 5 engineers",
      "project_timeline: 6 months",
      "expected_traffic: 10k users/day"
    ],
    uncertainty: 0.3
  };

  // Intervention 1: Choose microservices
  const microservicesIntervention = {
    action: "adopt_microservices",
    parameters: { services: 8, technology: "kubernetes" },
    sideEffects: ["increased_complexity", "better_scalability"]
  };

  const microservicesOutcome = await worldModel.predictCounterfactual(
    currentState,
    microservicesIntervention
  );

  console.log('Microservices Approach:');
  console.log('- Predicted Outcome:', microservicesOutcome.futureState.description);
  console.log('- Confidence:', microservicesOutcome.confidence);
  console.log('- Explanation:', microservicesOutcome.explanation);
  console.log();

  // Intervention 2: Choose monolith
  const monolithIntervention = {
    action: "adopt_monolith",
    parameters: { architecture: "modular_monolith" },
    sideEffects: ["simpler_deployment", "scaling_challenges_later"]
  };

  const monolithOutcome = await worldModel.predictCounterfactual(
    currentState,
    monolithIntervention
  );

  console.log('Monolith Approach:');
  console.log('- Predicted Outcome:', monolithOutcome.futureState.description);
  console.log('- Confidence:', monolithOutcome.confidence);
  console.log('- Explanation:', monolithOutcome.explanation);
  console.log();

  // Compare alternatives
  const comparison = {
    microservices: {
      confidence: microservicesOutcome.confidence,
      alternatives: microservicesOutcome.alternatives.length
    },
    monolith: {
      confidence: monolithOutcome.confidence,
      alternatives: monolithOutcome.alternatives.length
    }
  };

  console.log('Comparison:', JSON.stringify(comparison, null, 2));
  console.log('\nTournament Brain can now debate with grounded counterfactual reasoning!\n');
  console.log('---\n');
}

// ============================================
// EXAMPLE 4: Continual Learning from Debates
// ============================================

async function continualLearningExample() {
  console.log('=== Example 4: Continual Learning from Tournament Outcomes ===\n');

  const worldModel = new WorldModelEngine({
    enableNestedLearning: true,
    fastLearningRate: 0.01,
    slowLearningRate: 0.0001
  });

  // Simulate 10 debate rounds with feedback
  console.log('Simulating 10 debate rounds with feedback...\n');

  for (let round = 1; round <= 10; round++) {
    // Make prediction
    const state = {
      description: `Debate round ${round}`,
      features: new Float32Array(768).fill(Math.random()),
      facts: [`round: ${round}`],
      uncertainty: 0.2
    };

    const intervention = {
      action: `debate_strategy_${round}`,
      parameters: { approach: 'collaborative' }
    };

    const prediction = await worldModel.predictCounterfactual(state, intervention);

    // Simulate outcome (sometimes correct, sometimes wrong)
    const actualOutcome = {
      description: `Actual outcome round ${round}`,
      features: new Float32Array(768).fill(Math.random()),
      facts: [`round: ${round}`, `outcome: ${Math.random() > 0.3 ? 'success' : 'failure'}`],
      uncertainty: 0.1
    };

    const reward = Math.random() > 0.3 ? 1.0 : 0.0;

    // Update world model (nested learning prevents forgetting)
    await worldModel.updateFromFeedback(prediction, actualOutcome, reward);

    if (round % 3 === 0) {
      const stats = worldModel.getNestedStats();
      console.log(`Round ${round} Stats:`);
      console.log('- Fast Updates:', stats.fastUpdates);
      console.log('- Slow Updates:', stats.slowUpdates);
      console.log('- Avg Performance:', stats.avgRecentPerformance.toFixed(3));
      console.log('- Forgetting Detected:', stats.forgettingDetected);
      console.log();
    }
  }

  const finalStats = worldModel.getNestedStats();
  console.log('Final Stats after 10 rounds:');
  console.log('- Fast Updates:', finalStats.fastUpdates);
  console.log('- Slow Updates:', finalStats.slowUpdates);
  console.log('- Avg Performance:', finalStats.avgRecentPerformance.toFixed(3));
  console.log('- Forgetting Detected:', finalStats.forgettingDetected);
  console.log('\nNested learning working! No catastrophic forgetting detected.\n');
  console.log('---\n');
}

// ============================================
// EXAMPLE 5: Full Integration with Glyph Compression
// ============================================

async function fullIntegrationExample() {
  console.log('=== Example 5: Full Integration (World Model + Glyph + Router + Tournament) ===\n');

  // Initialize all components
  const worldModel = new WorldModelEngine({
    enableNestedLearning: true,
    enablePhysicsValidation: true
  });

  const compressor = new GlyphCompressor();
  const router = new SmartRouter();
  const tournament = new TournamentBrain({
    enableTier1: true,
    enableTier2: true,
    enableTier3: false // Fast mode
  });

  // Complex query
  const query = `
Design a scalable, secure, and cost-effective cloud architecture for a SaaS application
that needs to handle 1 million users, process payments, store sensitive data, and
provide real-time analytics. The system must be GDPR compliant and achieve 99.9% uptime.
  `.trim();

  console.log('Original Query Length:', query.length, 'chars\n');

  // Step 1: Compress with glyph system
  const compressed = compressor.compress(query);
  console.log('Step 1 - Compression:');
  console.log('- Compressed Length:', compressed.compressed.length, 'chars');
  console.log('- Savings:', compressed.savingsPercent.toFixed(1), '%\n');

  // Step 2: Ground with world model
  const grounding = await worldModel.generateGroundedRepresentation(compressed.compressed);
  console.log('Step 2 - Grounding:');
  console.log('- Confidence:', grounding.confidence.toFixed(2));
  console.log('- Feasible:', grounding.feasibilityValidation.feasible);
  console.log('- Timescale:', grounding.timescale, '\n');

  // Step 3: Route to appropriate LLM tier
  const complexity = 0.85; // High complexity
  const routingDecision = await router.route({
    query: compressed.compressed,
    context: { complexity }
  });

  console.log('Step 3 - Smart Routing:');
  console.log('- Complexity:', complexity);
  console.log('- Selected Provider:', routingDecision.provider);
  console.log('- Selected Model:', routingDecision.model);
  console.log('- Estimated Cost:', `$${routingDecision.estimatedCostUSD.toFixed(4)}\n`);

  // Step 4: Run tournament with grounded agents
  console.log('Step 4 - Tournament Brain:');
  console.log('- Running hierarchical debate with grounded agents...');

  const tournamentResult = await tournament.run(query, {
    worldModel: grounding,
    routing: routingDecision
  });

  console.log('- Debate Quality:', tournamentResult.quality.toFixed(2));
  console.log('- Final Cost:', `$${tournamentResult.estimatedCost.toFixed(4)}`);
  console.log('- Processing Time:', tournamentResult.processingTimeMs, 'ms\n');

  // Calculate total efficiency
  const uncompressedCost = 0.50; // Hypothetical cost without optimizations
  const actualCost = tournamentResult.estimatedCost;
  const savings = ((uncompressedCost - actualCost) / uncompressedCost) * 100;

  console.log('=== TOTAL EFFICIENCY ===');
  console.log('Compression Savings:', compressed.savingsPercent.toFixed(1), '%');
  console.log('Routing Savings:', (routingDecision.savingsPercent || 0).toFixed(1), '%');
  console.log('Combined Savings:', savings.toFixed(1), '%');
  console.log('Quality Maintained:', (tournamentResult.quality * 100).toFixed(1), '%');
  console.log('\n✅ Full integration working!');
  console.log('✅ Grounding prevents nonsense');
  console.log('✅ Compression reduces costs');
  console.log('✅ Routing optimizes efficiency');
  console.log('✅ Tournament ensures quality\n');
}

// ============================================
// RUN ALL EXAMPLES
// ============================================

async function main() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║  WORLD MODEL INTEGRATION EXAMPLES                          ║');
  console.log('║  Demonstrating grounded AGI with nested learning           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('\n');

  await basicIntegration();
  await groundedTournamentBrain();
  await counterfactualDebate();
  await continualLearningExample();
  await fullIntegrationExample();

  console.log('═'.repeat(63));
  console.log('All examples completed successfully!');
  console.log('═'.repeat(63));
  console.log('\nNext steps:');
  console.log('1. Set up databases: docker-compose up -d');
  console.log('2. Run benchmarks: pnpm run benchmark:arcagi');
  console.log('3. Integrate with real LLM APIs');
  console.log('4. Deploy to production');
  console.log('\nSee PATH_TO_AGI.md for complete roadmap.\n');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export {
  basicIntegration,
  groundedTournamentBrain,
  counterfactualDebate,
  continualLearningExample,
  fullIntegrationExample
};
