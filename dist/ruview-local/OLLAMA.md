# RuView Ollama Auto-Integration Guide

## Local Ollama Setup & Discovery
- **Endpoint:** `http://127.0.0.1:11434`
- **Auto-Discovery:** Automatically scans installed Ollama models via `/api/tags`.
- **Hardware Acceleration:** Auto-detects NVIDIA CUDA GPUs (e.g. RTX 3050 Laptop GPU, 3.7 GiB VRAM) and configures VRAM allocation.

## Management CLI Subcommands
```bash
ruview llm-status
ruview llm-models
ruview llm-test
ruview llm-select <model_name>
ruview llm-reset
```
