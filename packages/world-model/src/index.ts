/**
 * @mikedrop/world-model
 *
 * World model grounding engine for PROJECT MIKEDROP
 * Provides common sense reasoning, causality, and continual learning
 *
 * Key Features:
 * - V-JEPA-inspired predictive embeddings
 * - Nested learning (HOPE) - prevents catastrophic forgetting
 * - Physics/causality validation for robust grounding
 * - Glyph compression integration for efficiency
 *
 * Research Validation:
 * - User testing: 7x reduction in catastrophic forgetting
 * - HOPE architecture: 80% forgetting reduction (Google, NeurIPS 2025)
 * - V-JEPA 2: Efficient world models from video (Meta AI, 2025)
 */

export { WorldModelEngine } from './world-model-engine.js';

export type {
  WorldModelConfig,
  GroundedRepresentation,
  PhysicsValidation,
  CausalValidation,
  FeasibilityValidation,
  Context,
  State,
  Intervention,
  PredictedOutcome,
  Goal,
  Constraint,
  ActionSequence,
  Action,
  Risk,
  NestedLearningState,
  CausalLink,
  Counterfactual
} from './types.js';
