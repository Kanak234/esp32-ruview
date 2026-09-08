# RuView Production Docker Integration Guide

## Container Stack (`docker-compose.yml`)
- `ruview_mqtt`: Mosquitto 2.0 broker bound to `127.0.0.1:1883`.
- `ruview_backend`: RuView sensing engine with `extra_hosts: ["host.docker.internal:host-gateway"]` to reach host Ollama service.
- `ruview_llm_gateway`: Local AI Gateway HTTP service (Port 3002).

## Verification Commands
```bash
docker compose config
docker compose ps
```
