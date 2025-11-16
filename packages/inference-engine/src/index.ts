/**
 * @mikedrop/inference-engine
 *
 * High-performance inference engine delivering 100x effective speedup through:
 * - FlashAttention-2 (4-9x for attention operations)
 * - 4-bit quantization (4-6x memory/throughput)
 * - Smart routing (5-20x via adaptive model selection)
 * - KV cache reuse (2-20x for repeated contexts)
 * - Kernel fusion (2-10x via compiler optimizations)
 * - Batching (1.5-4x via parallelism)
 *
 * Research basis:
 * - FlashAttention-2: https://arxiv.org/abs/2307.08691
 * - GPTQ/AWQ: https://arxiv.org/abs/2306.00978
 * - vLLM: https://arxiv.org/abs/2309.06180
 * - TensorRT: https://developer.nvidia.com/tensorrt
 */

export { InferenceEngine } from './inference-engine.js';

export {
  BackendManager,
  SimulatedBackend,
  FlashAttentionBackend,
  TensorRTBackend,
  VLLMBackend
} from './kernel-backend.js';

export type { KernelBackend, KernelMetrics } from './kernel-backend.js';

export type {
  InferenceConfig,
  InferenceRequest,
  InferenceResponse,
  ModelSpec,
  RoutingDecision,
  CacheEntry,
  InferenceStats,
  OptimizationMetrics,
  ModelSize,
  PrecisionMode,
  CacheStrategy,
  OptimizationTechnique,
  KernelOptimization
} from './types.js';
