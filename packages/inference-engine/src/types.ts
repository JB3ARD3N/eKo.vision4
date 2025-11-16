/**
 * Inference Engine Types
 * High-performance model serving with 100x optimization
 */

export type ModelSize = 'tiny' | 'small' | 'medium' | 'large' | 'xlarge';

export type PrecisionMode =
  | 'fp32'      // Full precision (baseline)
  | 'fp16'      // Half precision (2x memory savings)
  | 'int8'      // 8-bit quantization (4x memory savings)
  | 'int4'      // 4-bit quantization (8x memory savings, GPTQ/AWQ)
  | 'mixed';    // Adaptive per-layer

export type CacheStrategy =
  | 'none'
  | 'kv-cache'        // Cache key-value attention states
  | 'paged-attention' // Paged KV cache (vLLM style)
  | 'full-activation' // Cache all activations
  | 'smart-reuse';    // Intelligent partial reuse

export type OptimizationTechnique =
  | 'flash-attention-2'
  | 'quantization-4bit'
  | 'kernel-fusion'
  | 'sparse-moe'
  | 'distillation'
  | 'paged-kv-cache'
  | 'batching'
  | 'speculative-decoding';

export interface InferenceConfig {
  /** Model selection policy */
  modelSizePolicy: 'adaptive' | 'fixed' | 'cascade';

  /** Default model size if fixed */
  defaultModelSize?: ModelSize;

  /** Precision mode */
  precision: PrecisionMode;

  /** Cache strategy */
  cacheStrategy: CacheStrategy;

  /** Max cache size in bytes */
  maxCacheSize: number;

  /** Enabled optimizations */
  optimizations: OptimizationTechnique[];

  /** Batch size for throughput mode */
  batchSize: number;

  /** Max latency budget (ms) */
  latencyBudgetMs: number;

  /** Quality threshold (0-1) */
  minQuality: number;

  /** Enable speculative execution */
  enableSpeculative: boolean;

  /** Hardware target */
  hardware: {
    gpus: number;
    gpuMemoryMB: number;
    nvmeAvailable: boolean;
    rdmaAvailable: boolean;
  };
}

export interface ModelSpec {
  /** Model size category */
  size: ModelSize;

  /** Number of parameters */
  parameters: number;

  /** Precision mode */
  precision: PrecisionMode;

  /** Memory footprint in MB */
  memoryMB: number;

  /** Tokens per second (throughput) */
  tokensPerSecond: number;

  /** Latency for first token (ms) */
  firstTokenLatencyMs: number;

  /** Quality score (0-1) */
  quality: number;

  /** Cost per 1k tokens ($) */
  costPer1kTokens: number;

  /** Model path or identifier */
  modelPath: string;

  /** Quantization method if applicable */
  quantizationMethod?: 'gptq' | 'awq' | 'bitsandbytes';

  /** Whether MoE (Mixture of Experts) */
  isMoE: boolean;

  /** Active parameters per token (for MoE) */
  activeParameters?: number;
}

export interface InferenceRequest {
  /** Input prompt/query */
  prompt: string;

  /** Optional grounding from world model */
  grounding?: any;

  /** Maximum tokens to generate */
  maxTokens: number;

  /** Temperature for sampling */
  temperature: number;

  /** Stop sequences */
  stopSequences?: string[];

  /** Latency SLA (ms) */
  latencySLA?: number;

  /** Quality requirement (0-1) */
  minQuality?: number;

  /** Session ID for KV cache reuse */
  sessionId?: string;

  /** Priority level */
  priority: 'low' | 'normal' | 'high' | 'critical';

  /** Metadata */
  metadata?: Record<string, any>;
}

export interface InferenceResponse {
  /** Generated text */
  text: string;

  /** Model used */
  modelUsed: ModelSize;

  /** Precision used */
  precision: PrecisionMode;

  /** Total latency (ms) */
  latencyMs: number;

  /** Time to first token (ms) */
  firstTokenMs: number;

  /** Tokens generated */
  tokensGenerated: number;

  /** Tokens per second */
  tokensPerSecond: number;

  /** Cache hit rate */
  cacheHitRate: number;

  /** Optimizations applied */
  optimizationsUsed: OptimizationTechnique[];

  /** Estimated quality */
  estimatedQuality: number;

  /** Cost in $ */
  cost: number;

  /** Speedup vs baseline */
  speedupVsBaseline: number;

  /** Whether from cache */
  fromCache: boolean;

  /** Performance breakdown */
  breakdown: {
    routing: number;
    kvCacheLookup: number;
    modelForward: number;
    decoding: number;
    postprocessing: number;
  };
}

export interface OptimizationMetrics {
  /** Technique name */
  technique: OptimizationTechnique;

  /** Speedup factor */
  speedup: number;

  /** Memory savings (%) */
  memorySavings: number;

  /** Quality impact (delta from baseline) */
  qualityDelta: number;

  /** Cost savings (%) */
  costSavings: number;

  /** Enabled */
  enabled: boolean;
}

export interface InferenceStats {
  /** Total requests */
  totalRequests: number;

  /** Requests by model size */
  requestsByModel: Record<ModelSize, number>;

  /** Average latency by model */
  avgLatencyByModel: Record<ModelSize, number>;

  /** Cache hit rate */
  cacheHitRate: number;

  /** Total cost saved */
  totalCostSaved: number;

  /** Average speedup */
  avgSpeedup: number;

  /** Optimization effectiveness */
  optimizationMetrics: OptimizationMetrics[];

  /** Quality distribution */
  qualityDistribution: {
    excellent: number; // >0.9
    good: number;      // 0.7-0.9
    acceptable: number; // 0.5-0.7
    poor: number;      // <0.5
  };
}

export interface CacheEntry {
  /** Cache key (hash of prompt) */
  key: string;

  /** Cached response */
  response: string;

  /** KV cache states (binary) */
  kvStates?: Buffer;

  /** Activation states */
  activations?: Float32Array[];

  /** Created timestamp */
  createdAt: number;

  /** Last accessed timestamp */
  lastAccessed: number;

  /** Access count */
  accessCount: number;

  /** Session ID */
  sessionId?: string;

  /** Size in bytes */
  sizeBytes: number;

  /** Quality score */
  quality: number;
}

export interface RoutingDecision {
  /** Selected model size */
  modelSize: ModelSize;

  /** Selected precision */
  precision: PrecisionMode;

  /** Cache strategy to use */
  cacheStrategy: CacheStrategy;

  /** Optimizations to apply */
  optimizations: OptimizationTechnique[];

  /** Estimated latency (ms) */
  estimatedLatency: number;

  /** Estimated quality */
  estimatedQuality: number;

  /** Estimated cost */
  estimatedCost: number;

  /** Confidence in routing */
  confidence: number;

  /** Reasoning */
  reasoning: string;
}

export interface KernelOptimization {
  /** Kernel name */
  name: string;

  /** Optimization type */
  type: 'fusion' | 'quantization' | 'attention' | 'memory';

  /** Speedup factor */
  speedup: number;

  /** Implementation */
  implementation: 'flash-attention' | 'triton' | 'tensorrt' | 'custom';

  /** GPU compatibility */
  gpuSupport: string[];
}
