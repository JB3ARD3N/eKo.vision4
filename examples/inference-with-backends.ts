/**
 * Inference Engine with Backend System - Complete Examples
 *
 * Shows how to use the new backend abstraction layer that bridges
 * the high-level InferenceEngine with low-level optimization kernels.
 */

import { InferenceEngine } from '@mikedrop/inference-engine';

async function example1_BasicUsageWithBackends() {
  console.log('=== Example 1: Basic Usage with Backend Initialization ===\n');

  // Create engine
  const engine = new InferenceEngine({
    modelSizePolicy: 'adaptive',
    precision: 'int4',
    optimizations: [
      'flash-attention-2',
      'quantization-4bit',
      'paged-kv-cache',
      'batching'
    ],
    latencyBudgetMs: 100,
    minQuality: 0.85
  });

  // Initialize backends (IMPORTANT: Call this before using infer!)
  console.log('Initializing backends...');
  await engine.initialize();
  console.log('Backends initialized!\n');

  // Run inference - automatically selects optimal backend
  const response = await engine.infer({
    prompt: 'Explain quantum computing in simple terms',
    maxTokens: 200,
    temperature: 0.7,
    priority: 'normal'
  });

  console.log('Response:', response.text);
  console.log('Backend used: (determined by available kernels)');
  console.log(`Model: ${response.modelUsed}, Precision: ${response.precision}`);
  console.log(`Latency: ${response.latencyMs.toFixed(2)}ms`);
  console.log(`Speedup: ${response.speedupVsBaseline.toFixed(1)}x vs baseline`);
  console.log(`Cost: $${response.cost.toFixed(4)}`);
  console.log(`Optimizations: ${response.optimizationsUsed.join(', ')}\n`);
}

async function example2_BackendInformation() {
  console.log('=== Example 2: Inspecting Available Backends ===\n');

  const engine = new InferenceEngine();
  await engine.initialize();

  // Get available backends
  const backends = engine.getAvailableBackends();
  console.log(`Available backends: ${backends.length}\n`);

  for (const backend of backends) {
    console.log(`Backend: ${backend.name}`);
    console.log(`  Supported optimizations: ${backend.supportedOptimizations.join(', ')}`);
    console.log();
  }

  // Get backend metrics
  const metrics = engine.getBackendMetrics();
  console.log('Backend Metrics:');
  for (const [name, metric] of Object.entries(metrics)) {
    console.log(`  ${name}:`);
    console.log(`    Total inferences: ${metric.totalInferences}`);
    console.log(`    Avg latency: ${metric.avgLatencyMs.toFixed(2)}ms`);
    console.log(`    Avg throughput: ${metric.avgThroughput.toFixed(0)} tokens/sec`);
    if (metric.lastError) {
      console.log(`    Last error: ${metric.lastError}`);
    }
  }
  console.log();
}

async function example3_DifferentWorkloads() {
  console.log('=== Example 3: Different Workloads with Backend Selection ===\n');

  const engine = new InferenceEngine();
  await engine.initialize();

  // Simple query - uses tiny model with SimulatedBackend
  console.log('Simple query (tight latency):');
  const simple = await engine.infer({
    prompt: 'What is 2+2?',
    maxTokens: 10,
    temperature: 0.3,
    latencySLA: 50,
    priority: 'normal'
  });
  console.log(`  Model: ${simple.modelUsed}, Latency: ${simple.latencyMs.toFixed(0)}ms\n`);

  // Complex query - uses large model
  console.log('Complex query (high quality):');
  const complex = await engine.infer({
    prompt: 'Analyze the geopolitical implications of AI advancement on global power dynamics',
    maxTokens: 500,
    temperature: 0.7,
    minQuality: 0.95,
    priority: 'high'
  });
  console.log(`  Model: ${complex.modelUsed}, Latency: ${complex.latencyMs.toFixed(0)}ms\n`);

  // Critical query - always gets best model
  console.log('Critical query (maximum quality):');
  const critical = await engine.infer({
    prompt: 'Provide medical advice for emergency situation',
    maxTokens: 300,
    temperature: 0.5,
    priority: 'critical'
  });
  console.log(`  Model: ${critical.modelUsed}, Quality: ${critical.estimatedQuality}\n`);
}

async function example4_CachingWithBackends() {
  console.log('=== Example 4: Caching Across Backend Calls ===\n');

  const engine = new InferenceEngine({
    cacheStrategy: 'paged-attention',
    maxCacheSize: 5 * 1024 * 1024 * 1024 // 5GB
  });
  await engine.initialize();

  // First request (no cache)
  console.log('First request (cold):');
  const first = await engine.infer({
    prompt: 'What is machine learning?',
    maxTokens: 100,
    temperature: 0.7,
    sessionId: 'user123',
    priority: 'normal'
  });
  console.log(`  Latency: ${first.latencyMs.toFixed(0)}ms, From cache: ${first.fromCache}\n`);

  // Second request (cache hit!)
  console.log('Second request (warm - same prompt):');
  const second = await engine.infer({
    prompt: 'What is machine learning?',
    maxTokens: 100,
    temperature: 0.7,
    sessionId: 'user123',
    priority: 'normal'
  });
  console.log(`  Latency: ${second.latencyMs.toFixed(0)}ms, From cache: ${second.fromCache}`);
  console.log(`  Speedup: ${(first.latencyMs / second.latencyMs).toFixed(1)}x faster!\n`);
}

async function example5_ProgressiveDeployment() {
  console.log('=== Example 5: Progressive Backend Deployment ===\n');

  console.log('Week 1: SimulatedBackend only (baseline)');
  const engineWeek1 = new InferenceEngine();
  await engineWeek1.initialize();

  const week1Result = await engineWeek1.infer({
    prompt: 'Test query',
    maxTokens: 100,
    temperature: 0.7,
    priority: 'normal'
  });
  console.log(`  Backend: ${engineWeek1.getAvailableBackends()[0].name}`);
  console.log(`  Latency: ${week1Result.latencyMs.toFixed(0)}ms\n`);

  // Week 2: FlashAttention backend becomes available (when installed)
  console.log('Week 2: FlashAttention backend (after pip install flash-attn)');
  console.log('  Backend priority: FlashAttention > Simulated');
  console.log('  Expected speedup: 2-4x over baseline\n');

  // Week 5: TensorRT backend added
  console.log('Week 5: TensorRT backend (after TensorRT installation)');
  console.log('  Backend priority: TensorRT > FlashAttention > Simulated');
  console.log('  Expected speedup: 5-10x over baseline\n');

  // Week 7: vLLM backend added (best throughput)
  console.log('Week 7: vLLM backend (after pip install vllm)');
  console.log('  Backend priority: vLLM > TensorRT > FlashAttention > Simulated');
  console.log('  Expected speedup: 10-20x throughput improvement\n');
}

async function example6_IntegrationWithWorldModel() {
  console.log('=== Example 6: Integration with World Model (Future) ===\n');

  // This shows how world models will integrate with optimized inference
  const engine = new InferenceEngine();
  await engine.initialize();

  // Simulate world model grounding
  const grounding = {
    feasibility: 0.95,
    physicsValid: true,
    causalChain: ['A', 'B', 'C'],
    confidence: 0.88
  };

  console.log('Using world model grounding to inform routing:');
  const response = await engine.infer({
    prompt: 'Can I pour water uphill?',
    grounding, // World model detects this is physics-based
    maxTokens: 150,
    temperature: 0.5,
    priority: 'normal'
  });

  console.log('Response:', response.text);
  console.log(`Model selected: ${response.modelUsed} (informed by grounding)`);
  console.log();
}

async function example7_ProductionDeployment() {
  console.log('=== Example 7: Production Deployment Pattern ===\n');

  // Production-ready configuration
  const engine = new InferenceEngine({
    modelSizePolicy: 'adaptive',
    precision: 'int4',
    cacheStrategy: 'paged-attention',
    maxCacheSize: 20 * 1024 * 1024 * 1024, // 20GB cache
    optimizations: [
      'flash-attention-2',
      'quantization-4bit',
      'kernel-fusion',
      'paged-kv-cache',
      'batching'
    ],
    batchSize: 64, // High throughput
    latencyBudgetMs: 200, // Reasonable latency
    minQuality: 0.85,
    enableSpeculative: true,
    hardware: {
      gpus: 2, // Multi-GPU
      gpuMemoryMB: 80000, // A100 80GB
      nvmeAvailable: true,
      rdmaAvailable: true
    }
  });

  await engine.initialize();

  console.log('Production configuration:');
  console.log(`  Available backends: ${engine.getAvailableBackends().length}`);
  console.log('  Multi-GPU: enabled');
  console.log('  Cache size: 20GB');
  console.log('  Batch size: 64');
  console.log();

  // Simulate production workload
  console.log('Running production workload (10 queries)...');
  const startTime = Date.now();

  const queries = [
    'Simple question 1',
    'Simple question 2',
    'Complex analysis about AI',
    'Simple question 3',
    'Moderate reasoning task',
    'Simple question 4',
    'Complex synthesis task',
    'Simple question 5',
    'Moderate analysis',
    'Simple question 6'
  ];

  const results = await Promise.all(
    queries.map((prompt, i) =>
      engine.infer({
        prompt,
        maxTokens: i % 3 === 0 ? 300 : 100, // Varied token counts
        temperature: 0.7,
        priority: i % 5 === 0 ? 'high' : 'normal',
      })
    )
  );

  const totalTime = Date.now() - startTime;
  const avgLatency = results.reduce((sum, r) => sum + r.latencyMs, 0) / results.length;
  const totalCost = results.reduce((sum, r) => sum + r.cost, 0);
  const avgSpeedup = results.reduce((sum, r) => sum + r.speedupVsBaseline, 0) / results.length;

  console.log('Production metrics:');
  console.log(`  Total time: ${totalTime}ms`);
  console.log(`  Avg latency: ${avgLatency.toFixed(2)}ms`);
  console.log(`  Total cost: $${totalCost.toFixed(4)}`);
  console.log(`  Avg speedup: ${avgSpeedup.toFixed(1)}x`);
  console.log(`  Queries/second: ${(10 / (totalTime / 1000)).toFixed(2)}`);
  console.log();

  // Show stats
  const stats = engine.getStats();
  console.log('Engine statistics:');
  console.log(`  Total requests: ${stats.totalRequests}`);
  console.log(`  Model distribution:`);
  console.log(`    Tiny: ${stats.requestsByModel.tiny}`);
  console.log(`    Small: ${stats.requestsByModel.small}`);
  console.log(`    Medium: ${stats.requestsByModel.medium}`);
  console.log(`    Large: ${stats.requestsByModel.large}`);
  console.log(`  Cache hit rate: ${(stats.cacheHitRate * 100).toFixed(1)}%`);
  console.log(`  Total cost saved: $${stats.totalCostSaved.toFixed(2)}`);
  console.log();

  // Cleanup
  await engine.cleanup();
  console.log('Engine cleaned up successfully.');
}

// Run all examples
async function runAllExamples() {
  await example1_BasicUsageWithBackends();
  await example2_BackendInformation();
  await example3_DifferentWorkloads();
  await example4_CachingWithBackends();
  await example5_ProgressiveDeployment();
  await example6_IntegrationWithWorldModel();
  await example7_ProductionDeployment();
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples().catch(console.error);
}

export {
  example1_BasicUsageWithBackends,
  example2_BackendInformation,
  example3_DifferentWorkloads,
  example4_CachingWithBackends,
  example5_ProgressiveDeployment,
  example6_IntegrationWithWorldModel,
  example7_ProductionDeployment
};
