/**
 * World Model Types
 * Based on V-JEPA 2 architecture and nested learning principles
 */

export interface WorldModelConfig {
  /** Model type: 'vjepa' (future), 'embedding' (MVP), 'hybrid' */
  modelType: 'vjepa' | 'embedding' | 'hybrid';

  /** Embedding dimensions (768 for OpenAI, 384 for MiniLM, 1024 for V-JEPA) */
  embeddingDim: number;

  /** Enable nested multi-timescale learning */
  enableNestedLearning: boolean;

  /** Fast adapter learning rate (for quick updates) */
  fastLearningRate: number;

  /** Slow adapter learning rate (for stable priors) */
  slowLearningRate: number;

  /** Enable physics validation */
  enablePhysicsValidation: boolean;

  /** Enable causality checking */
  enableCausalityValidation: boolean;

  /** Cache size for embeddings (LRU) */
  cacheSize: number;
}

export interface GroundedRepresentation {
  /** Abstract embedding vector */
  embedding: Float32Array;

  /** Confidence in grounding (0.0-1.0) */
  confidence: number;

  /** Physics plausibility check result */
  physicsValidation: PhysicsValidation;

  /** Causal consistency check result */
  causalValidation: CausalValidation;

  /** Practical feasibility assessment */
  feasibilityValidation: FeasibilityValidation;

  /** Which timescale this representation lives at */
  timescale: 'fast' | 'slow' | 'mixed';

  /** Metadata for debugging */
  metadata: {
    inputType: 'text' | 'image' | 'multimodal';
    processingTimeMs: number;
    cacheHit: boolean;
  };
}

export interface PhysicsValidation {
  /** Is this physically plausible? */
  plausible: boolean;

  /** Confidence in physics check (0.0-1.0) */
  confidence: number;

  /** Specific violations detected */
  violations: string[];

  /** Common sense physics rules checked */
  rulesChecked: string[];
}

export interface CausalValidation {
  /** Is this causally consistent? */
  consistent: boolean;

  /** Confidence in causal check (0.0-1.0) */
  confidence: number;

  /** Causal chain identified */
  causalChain: CausalLink[];

  /** Counterfactual scenarios considered */
  counterfactuals: Counterfactual[];
}

export interface FeasibilityValidation {
  /** Is this practically feasible? */
  feasible: boolean;

  /** Confidence in feasibility (0.0-1.0) */
  confidence: number;

  /** Constraints that might block execution */
  constraints: string[];

  /** Estimated resources required */
  resourceEstimate: {
    timeMinutes?: number;
    computeCost?: number;
    humanEffort?: number;
  };
}

export interface CausalLink {
  cause: string;
  effect: string;
  strength: number; // 0.0-1.0
  mechanism?: string;
}

export interface Counterfactual {
  /** What if we changed this? */
  intervention: string;

  /** Predicted outcome */
  predictedOutcome: string;

  /** Confidence in prediction (0.0-1.0) */
  confidence: number;
}

export interface Context {
  /** Previous conversation/interaction history */
  history?: string[];

  /** Domain-specific context */
  domain?: string;

  /** User/agent preferences */
  preferences?: Record<string, unknown>;

  /** Temporal context (when is this happening?) */
  timestamp?: number;
}

export interface State {
  /** Current state description */
  description: string;

  /** State features (embedded) */
  features: Float32Array;

  /** Observed facts */
  facts: string[];

  /** Uncertainty in state */
  uncertainty: number;
}

export interface Intervention {
  /** What action to take */
  action: string;

  /** Parameters for action */
  parameters: Record<string, unknown>;

  /** Expected side effects */
  sideEffects?: string[];
}

export interface PredictedOutcome {
  /** Predicted future state */
  futureState: State;

  /** Confidence in prediction (0.0-1.0) */
  confidence: number;

  /** Alternative outcomes (probability distribution) */
  alternatives: Array<{
    state: State;
    probability: number;
  }>;

  /** Causal explanation for prediction */
  explanation: string;
}

export interface Goal {
  /** What to achieve */
  description: string;

  /** Success criteria */
  successCriteria: string[];

  /** Deadline (optional) */
  deadline?: number;
}

export interface Constraint {
  /** Constraint type */
  type: 'resource' | 'time' | 'safety' | 'ethical' | 'physical';

  /** Constraint description */
  description: string;

  /** Hard constraint (must satisfy) vs soft (nice to have) */
  hard: boolean;
}

export interface ActionSequence {
  /** Ordered list of actions */
  actions: Action[];

  /** Expected final state */
  expectedOutcome: State;

  /** Confidence in plan (0.0-1.0) */
  confidence: number;

  /** Risk assessment */
  risks: Risk[];
}

export interface Action {
  /** Action description */
  description: string;

  /** When to execute (relative to start) */
  timingMs: number;

  /** Parameters */
  parameters: Record<string, unknown>;

  /** Expected state after this action */
  expectedStateAfter: State;
}

export interface Risk {
  /** Risk description */
  description: string;

  /** Probability (0.0-1.0) */
  probability: number;

  /** Impact severity (0.0-1.0) */
  severity: number;

  /** Mitigation strategy */
  mitigation?: string;
}

/**
 * Nested Learning State
 * Implements HOPE architecture for continual learning without forgetting
 */
export interface NestedLearningState {
  /** Fast adapter weights (quickly updated) */
  fastWeights: Float32Array[];

  /** Slow adapter weights (stable priors) */
  slowWeights: Float32Array[];

  /** Gating parameters (how to combine fast + slow) */
  gateWeights: Float32Array;

  /** Importance scores for each weight (EWC-style) */
  importanceScores: Float32Array[];

  /** Number of updates at each timescale */
  fastUpdates: number;
  slowUpdates: number;

  /** Performance on recent tasks (for detecting forgetting) */
  recentPerformance: number[];
}
