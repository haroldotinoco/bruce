# LLM Provider Routing Configuration

## Overview

BruceAI supports two LLM routing modes that determine how agents access language models. The routing mode can be configured globally, enabling flexible deployment patterns from early-stage prototyping to production-scale systems.

## Routing Modes

### 1. OpenRouter Mode (`openrouter`)

Routes all LLM calls through OpenRouter (https://openrouter.ai), a unified API gateway that provides access to all major language models through a single interface.

**Use when:**
- Building proofs-of-concept or MVPs
- You want a single API key across all model providers
- You need automatic fallback between providers
- Cost monitoring and dashboard visibility are important
- You want to experiment with different models quickly

**Configuration:**
```bash
LLM_PROVIDER_MODE=openrouter
OPENROUTER_API_KEY=sk-or-your-key-here
```

**Benefits:**
- Single API key for all models (Claude, GPT-4, Gemini, Llama, etc.)
- Built-in cost dashboard showing per-model and per-request costs
- Automatic failover between providers
- No additional infrastructure complexity
- Rate limiting and monitoring handled by OpenRouter

**Model ID Format:**
When using OpenRouter mode, always use the provider-prefixed format:
```
anthropic/claude-opus-4-6
anthropic/claude-sonnet-4-6
openai/gpt-4o
google/gemini-pro-1.5
meta-llama/llama-3.1-70b-instruct
```

### 2. Direct Mode (`direct`)

Routes requests directly to each provider's native API. Each provider requires its own API key and connection configuration.

**Use when:**
- Running at production scale with high volume
- You have direct agreements with providers
- Lower latency is critical
- You need direct SLAs and support contracts
- You're optimizing for cost at massive scale

**Configuration:**
```bash
LLM_PROVIDER_MODE=direct
ANTHROPIC_API_KEY=sk-ant-your-key-here
OPENAI_API_KEY=sk-your-key-here
GOOGLE_API_KEY=your-key-here
```

**Benefits:**
- Direct provider SLAs and support
- Lowest possible latency
- Direct cost agreements
- Provider-specific optimizations
- Full control over rate limiting and quotas

**Model ID Format:**
When using direct mode, use the native model identifiers:
```
claude-opus-4-6
claude-sonnet-4-6
gpt-4o
gemini-pro-1.5
```

## Agent Configuration

Each agent declares its preferred model in `capabilities.json`:

```json
{
  "name": "analysis-agent",
  "capabilities": {
    "llm": {
      "provider": "openai",
      "model": "gpt-4o"
    }
  }
}
```

The routing system resolves this declaration as follows:

### In OpenRouter Mode
1. Provider name from capabilities.json is looked up in the registry
2. Model is resolved with the OpenRouter provider prefix
3. Request is sent to `https://openrouter.ai/api/v1` with model ID `openai/gpt-4o`

### In Direct Mode
1. Provider name from capabilities.json is looked up in the registry
2. Model is resolved from that provider's native model list
3. Request is sent directly to that provider's API endpoint

## Global Configuration

The provider registry is defined in `/infrastructure/provider-registry.instance.json`:

```json
{
  "routing_mode": "openrouter",
  "providers": [...],
  "fallback_order": ["openrouter", "anthropic", "openai"],
  "global_timeout_seconds": 120,
  "retry_policy": {
    "max_retries": 3,
    "initial_delay_ms": 1000,
    "backoff_multiplier": 2.0
  }
}
```

### Key Fields

- **routing_mode**: Either `"direct"` or `"openrouter"` — determines how all calls are routed
- **providers**: Array of available provider configurations with models, rate limits, and capabilities
- **fallback_order**: Provider precedence if the primary is unavailable
- **global_timeout_seconds**: Maximum wait time for any LLM API call
- **retry_policy**: Exponential backoff configuration for failed requests

## Cost Monitoring

### With OpenRouter
OpenRouter provides a web dashboard showing:
- Real-time cost tracking per model
- Request volume by model
- Cost trends over time
- API usage patterns

Access the dashboard at: https://openrouter.ai/dashboard

### With Direct Mode
You must implement monitoring through each provider's native dashboard:
- Anthropic: https://console.anthropic.com
- OpenAI: https://platform.openai.com/account/usage/overview
- Google: https://aistudio.google.com

## Switching Routing Modes

To switch from OpenRouter to Direct (or vice versa):

1. Update the environment variable:
   ```bash
   # For OpenRouter
   export LLM_PROVIDER_MODE=openrouter
   export OPENROUTER_API_KEY=sk-or-...

   # For Direct
   export LLM_PROVIDER_MODE=direct
   export ANTHROPIC_API_KEY=sk-ant-...
   export OPENAI_API_KEY=sk-...
   ```

2. Restart the BruceAI runtime to reload the provider registry

3. Agents continue to work unchanged — model resolution happens automatically based on the active routing mode

## Recommended Model Assignments

### For Governance & Decision Tasks
- **OpenRouter**: `anthropic/claude-opus-4-6`
- **Direct**: `claude-opus-4-6`

### For General Analysis & Writing
- **OpenRouter**: `anthropic/claude-sonnet-4-6`
- **Direct**: `claude-sonnet-4-6`

### For Cost-Sensitive Bulk Processing
- **OpenRouter**: `meta-llama/llama-3.1-70b-instruct`
- **Direct**: (requires Llama provider integration)

### For Structured Outputs & Tool Use
- **OpenRouter**: `openai/gpt-4o`
- **Direct**: `gpt-4o`

### For Deep Reasoning Tasks
- **OpenRouter**: `openai/o1`
- **Direct**: `o1`

### For Long-Context Processing (2M tokens)
- **OpenRouter**: `google/gemini-pro-1.5`
- **Direct**: (requires Google provider integration)

## Pricing Reference

All prices are per 1 million tokens and sourced from OpenRouter (prices vary by provider).

| Model | Input | Output | Notes |
|-------|-------|--------|-------|
| Claude Opus 4.6 | $15 | $45 | Best for complex reasoning |
| Claude Sonnet 4.6 | $3 | $15 | Recommended general-purpose |
| Claude Haiku 4.5 | $0.80 | $4 | Fast, cost-effective |
| GPT-4o | $5 | $15 | Strong structured outputs |
| GPT-4o Mini | $0.15 | $0.60 | Fast, cheap |
| Gemini 1.5 Pro | $1.25 | $5 | 2M token context |
| Llama 3.1 70B | $0.71 | $0.89 | Most cost-effective |

## Migration Path

**Phase 1: Development (OpenRouter)**
- Start with `routing_mode=openrouter`
- Single API key simplifies development
- Experiment with different models

**Phase 2: Production Optimization (Direct)**
- Migrate critical agents to Direct mode
- Negotiate volume discounts with providers
- Monitor performance in native provider dashboards
- Keep OpenRouter as fallback for cost spike protection

**Phase 3: Multi-Provider Strategy (Hybrid)**
- Use Direct for high-volume workloads with providers
- Use OpenRouter for variable/experimental workloads
- Implement provider-specific SLAs per agent
