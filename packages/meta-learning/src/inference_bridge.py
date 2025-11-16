"""
Inference Bridge - Connects Python Infinity Brain to TypeScript InferenceEngine

This bridge allows the Python meta-learning system to call the TypeScript
inference engine's backends (SimulatedBackend, FlashAttentionBackend, etc.)
for actual LLM inference.

Architecture:
Python InfinityBrain → InferenceBridge → HTTP → TypeScript InferenceEngine → KernelBackends
"""

import asyncio
import httpx
from typing import Dict, Any, Optional, List
from dataclasses import dataclass, asdict


@dataclass
class InferenceRequest:
    """Request to TypeScript InferenceEngine"""
    prompt: str
    maxTokens: int = 200
    temperature: float = 0.7
    priority: str = "normal"
    latencySLA: Optional[int] = None
    minQuality: Optional[float] = None
    sessionId: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

    def to_dict(self) -> Dict[str, Any]:
        return {k: v for k, v in asdict(self).items() if v is not None}


@dataclass
class InferenceResponse:
    """Response from TypeScript InferenceEngine"""
    text: str
    modelUsed: str
    precision: str
    latencyMs: float
    firstTokenMs: float
    tokensGenerated: int
    tokensPerSecond: float
    cacheHitRate: float
    optimizationsUsed: List[str]
    estimatedQuality: float
    cost: float
    speedupVsBaseline: float
    fromCache: bool
    breakdown: Dict[str, float]


class InferenceBridge:
    """
    Bridge between Python meta-learning and TypeScript inference engine

    Usage:
        bridge = InferenceBridge("http://localhost:3000")
        await bridge.initialize()
        response = await bridge.infer("What is quantum computing?")
    """

    def __init__(
        self,
        inference_url: str = "http://localhost:3000",
        timeout: float = 30.0,
        max_retries: int = 3
    ):
        self.inference_url = inference_url.rstrip("/")
        self.timeout = timeout
        self.max_retries = max_retries
        self.client: Optional[httpx.AsyncClient] = None
        self.initialized = False

        # Stats
        self.total_requests = 0
        self.total_cost = 0.0
        self.avg_latency = 0.0
        self.cache_hit_rate = 0.0

    async def initialize(self) -> bool:
        """
        Initialize connection to InferenceEngine

        Returns True if engine is available, False otherwise
        """
        if self.initialized:
            return True

        try:
            self.client = httpx.AsyncClient(timeout=self.timeout)

            # Health check
            response = await self.client.get(f"{self.inference_url}/health")
            if response.status_code == 200:
                self.initialized = True
                print(f"✓ Connected to InferenceEngine at {self.inference_url}")
                return True
            else:
                print(f"✗ InferenceEngine not available (status {response.status_code})")
                return False

        except Exception as e:
            print(f"✗ Failed to connect to InferenceEngine: {e}")
            print(f"  Make sure the TypeScript server is running on {self.inference_url}")
            return False

    async def infer(
        self,
        prompt: str,
        max_tokens: int = 200,
        temperature: float = 0.7,
        priority: str = "normal",
        **kwargs
    ) -> Optional[InferenceResponse]:
        """
        Call TypeScript InferenceEngine to generate a response

        Args:
            prompt: The input prompt
            max_tokens: Maximum tokens to generate
            temperature: Sampling temperature
            priority: 'low' | 'normal' | 'high' | 'critical'
            **kwargs: Additional parameters (latencySLA, minQuality, sessionId, etc.)

        Returns:
            InferenceResponse if successful, None if failed
        """
        if not self.initialized:
            print("⚠ InferenceBridge not initialized. Call initialize() first.")
            return None

        request = InferenceRequest(
            prompt=prompt,
            maxTokens=max_tokens,
            temperature=temperature,
            priority=priority,
            **kwargs
        )

        for attempt in range(self.max_retries):
            try:
                response = await self.client.post(
                    f"{self.inference_url}/api/infer",
                    json=request.to_dict()
                )

                if response.status_code == 200:
                    data = response.json()
                    result = InferenceResponse(**data)

                    # Update stats
                    self.total_requests += 1
                    self.total_cost += result.cost
                    self.avg_latency = (self.avg_latency * (self.total_requests - 1) + result.latencyMs) / self.total_requests
                    self.cache_hit_rate = (self.cache_hit_rate * (self.total_requests - 1) + result.cacheHitRate) / self.total_requests

                    return result
                else:
                    print(f"✗ Inference failed (status {response.status_code}): {response.text}")
                    if attempt < self.max_retries - 1:
                        await asyncio.sleep(2 ** attempt)  # Exponential backoff
                    continue

            except Exception as e:
                print(f"✗ Inference error: {e}")
                if attempt < self.max_retries - 1:
                    await asyncio.sleep(2 ** attempt)
                continue

        print(f"✗ Inference failed after {self.max_retries} attempts")
        return None

    async def batch_infer(
        self,
        prompts: List[str],
        max_tokens: int = 200,
        temperature: float = 0.7,
        priority: str = "normal"
    ) -> List[Optional[InferenceResponse]]:
        """
        Batch inference for multiple prompts

        Sends all requests concurrently for maximum throughput
        """
        tasks = [
            self.infer(prompt, max_tokens, temperature, priority)
            for prompt in prompts
        ]
        return await asyncio.gather(*tasks)

    def get_stats(self) -> Dict[str, Any]:
        """Get bridge statistics"""
        return {
            "total_requests": self.total_requests,
            "total_cost": self.total_cost,
            "avg_latency_ms": self.avg_latency,
            "cache_hit_rate": self.cache_hit_rate,
            "cost_per_request": self.total_cost / self.total_requests if self.total_requests > 0 else 0,
        }

    async def cleanup(self):
        """Close client connection"""
        if self.client:
            await self.client.aclose()
            self.initialized = False


# ============================================================================
# DEMO / TESTING
# ============================================================================

async def demo_bridge():
    """Demonstrate InferenceBridge usage"""

    print("=" * 70)
    print("Inference Bridge Demo")
    print("=" * 70)
    print()

    # Initialize bridge
    bridge = InferenceBridge("http://localhost:3000")

    print("1. Initializing connection to InferenceEngine...")
    available = await bridge.initialize()

    if not available:
        print("\n⚠ InferenceEngine not available. Start the TypeScript server:")
        print("   cd packages/inference-engine && npm run dev")
        return

    print()

    # Single inference
    print("2. Single inference request...")
    print("-" * 70)

    response = await bridge.infer(
        prompt="What is the capital of France?",
        max_tokens=50,
        temperature=0.3,
        priority="normal"
    )

    if response:
        print(f"Response: {response.text}")
        print(f"Model: {response.modelUsed}, Precision: {response.precision}")
        print(f"Latency: {response.latencyMs:.2f}ms")
        print(f"Cost: ${response.cost:.4f}")
        print(f"Speedup: {response.speedupVsBaseline:.1f}x vs baseline")
        print()

    # Batch inference
    print("3. Batch inference (3 prompts)...")
    print("-" * 70)

    prompts = [
        "What is 2+2?",
        "Explain quantum computing briefly",
        "What is the meaning of life?"
    ]

    responses = await bridge.batch_infer(prompts, max_tokens=100)

    for i, resp in enumerate(responses):
        if resp:
            print(f"Prompt {i+1}: {prompts[i]}")
            print(f"Response: {resp.text[:100]}...")
            print(f"Latency: {resp.latencyMs:.2f}ms, Cost: ${resp.cost:.4f}")
            print()

    # Stats
    print("4. Bridge statistics...")
    print("-" * 70)

    stats = bridge.get_stats()
    print(f"Total requests: {stats['total_requests']}")
    print(f"Total cost: ${stats['total_cost']:.4f}")
    print(f"Avg latency: {stats['avg_latency_ms']:.2f}ms")
    print(f"Cache hit rate: {stats['cache_hit_rate']*100:.1f}%")
    print()

    # Cleanup
    await bridge.cleanup()
    print("Bridge closed.")


if __name__ == "__main__":
    asyncio.run(demo_bridge())
