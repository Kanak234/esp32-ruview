# RuView Local LLM Architecture & Context Adapter

## Reasoning Pipeline
```text
Raw Wi-Fi CSI → Signal Processing → RuView Inference → Structured Context → Context Adapter → LLM Gateway (3002) → Ollama (11434) → Local Model
```

## Safety & Non-Hallucination Directives
- **Zero Raw CSI:** LLMs process structured spatial state context (occupancy, room activity, semantic states), not raw high-frequency CSI packets.
- **Local Isolation:** 100% edge-only execution over `127.0.0.1`. No OpenAI, Gemini, or cloud APIs allowed.
- **Physics Honesty:** System prompt explicitly prohibits treating CSI as a camera or delivering medical diagnosis.
