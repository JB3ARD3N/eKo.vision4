"""
Infinity Brain - Self-Improving AGI Foundation

Exports main classes for external use.
"""

from .infinity_brain import (
    InfinityBrain,
    InfinityBrainConfig,
    TournamentBrain,
    MetaLearningEngine,
    GrimoireStorage,
    Agent,
    AgentRole,
    Pattern,
    Improvement,
    KnowledgeGap,
    DebateResult,
    SystemMetrics
)

__all__ = [
    "InfinityBrain",
    "InfinityBrainConfig",
    "TournamentBrain",
    "MetaLearningEngine",
    "GrimoireStorage",
    "Agent",
    "AgentRole",
    "Pattern",
    "Improvement",
    "KnowledgeGap",
    "DebateResult",
    "SystemMetrics"
]

__version__ = "0.1.0"
