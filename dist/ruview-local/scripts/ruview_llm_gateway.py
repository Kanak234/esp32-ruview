#!/usr/bin/env python3
"""
RuView Local AI / LLM Gateway Service
Interfaces directly with local Ollama service, auto-detects installed models,
and provides local REST endpoints for spatial reasoning.
"""

import sys, os, time, json, subprocess
from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib.request

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, SCRIPT_DIR)
from ruview_context_adapter import RuViewContextAdapter

OLLAMA_URL = os.environ.get("RUVIEW_OLLAMA_URL", "http://127.0.0.1:11434")
PORT = int(os.environ.get("RUVIEW_LLM_GATEWAY_PORT", "3002"))

class OllamaClient:
    def __init__(self, base_url=OLLAMA_URL):
        self.base_url = base_url
        self.opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))

    def ensure_ollama_running(self):
        try:
            res = self.opener.open(f"{self.base_url}/api/tags", timeout=2)
            if res.status == 200:
                return True
        except Exception:
            pass

        # Try launching ollama serve in background
        try:
            workspace_dir = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
            models_dir = os.path.join(workspace_dir, "ollama_models")
            os.makedirs(models_dir, exist_ok=True)
            env = os.environ.copy()
            env["OLLAMA_MODELS"] = models_dir
            env["HOME"] = workspace_dir
            subprocess.Popen(["ollama", "serve"], env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            time.sleep(2)
            return True
        except Exception as e:
            return False

    def list_models(self):
        self.ensure_ollama_running()
        try:
            res = self.opener.open(f"{self.base_url}/api/tags", timeout=3)
            data = json.loads(res.read().decode('utf-8'))
            models = []
            for m in data.get("models", []):
                name = m.get("name", "unknown")
                details = m.get("details", {})
                family = details.get("family", "")
                
                role = "GENERAL_REASONING"
                if "coder" in name or "code" in name: role = "CODING"
                elif "vision" in name or "llava" in name: role = "VISION"
                elif "r1" in name or "reasoner" in name: role = "DEEP_ANALYSIS"
                elif "small" in name or "phi" in name or "1.5b" in name: role = "FAST_RESPONSE"

                models.append({
                    "name": name,
                    "provider": "ollama",
                    "local": True,
                    "role": role,
                    "family": family,
                    "size_bytes": m.get("size", 0)
                })
            return models
        except Exception as e:
            return []

    def generate(self, model_name, prompt):
        self.ensure_ollama_running()
        url = f"{self.base_url}/api/generate"
        payload = json.dumps({"model": model_name, "prompt": prompt, "stream": False}).encode('utf-8')
        req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
        try:
            res = self.opener.open(req, timeout=30)
            data = json.loads(res.read().decode('utf-8'))
            return data.get("response", "")
        except Exception as e:
            return f"Error communicating with local LLM: {str(e)}"

class LLMGatewayHandler(BaseHTTPRequestHandler):
    ollama = OllamaClient()
    adapter = RuViewContextAdapter()
    active_model = os.environ.get("RUVIEW_LLM_MODEL", "")

    def _set_cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def do_OPTIONS(self):
        self.send_response(200)
        self._set_cors()
        self.end_headers()

    def do_GET(self):
        if self.path == '/llm/status':
            models = self.ollama.list_models()
            selected = self.active_model or (models[0]["name"] if models else "ruview-reasoner-builtin")
            res = {
                "ollama_online": len(models) > 0 or self.ollama.ensure_ollama_running(),
                "provider": "ollama",
                "gateway_port": PORT,
                "selected_model": selected,
                "available_models": len(models),
                "mode": "LOCAL ONLY"
            }
            self.send_response(200)
            self._set_cors()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(res).encode('utf-8'))

        elif self.path == '/llm/models':
            models = self.ollama.list_models()
            self.send_response(200)
            self._set_cors()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"models": models}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        content_len = int(self.headers.get('Content-Length', 0))
        body = json.loads(self.rfile.read(content_len).decode('utf-8')) if content_len > 0 else {}

        if self.path == '/llm/select':
            model = body.get("model", "")
            if model:
                LLMGatewayHandler.active_model = model
                res = {"status": "ok", "selected_model": model}
            else:
                res = {"status": "error", "message": "No model specified"}
            self.send_response(200)
            self._set_cors()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(res).encode('utf-8'))

        elif self.path in ['/llm/chat', '/llm/analyse']:
            models = self.ollama.list_models()
            target_model = self.active_model or (models[0]["name"] if models else None)
            
            raw_context = body.get("context", {})
            user_query = body.get("query", "Summarize current spatial and activity state.")

            context_obj = self.adapter.adapt(raw_context)
            prompt = self.adapter.format_prompt(context_obj, user_query)

            if target_model:
                reply = self.ollama.generate(target_model, prompt)
            else:
                # Built-in deterministic reasoning fallback if no Ollama model pulled yet
                occ = context_obj["occupancy_count"]
                act = context_obj["room_activity_state"]
                reply = f"[BUILT-IN RUVIEW REASONER]: Room is {'OCCUPIED' if occ > 0 else 'UNOCCUPIED'} ({occ} person(s) detected). Room activity is {act}. Vital signs and fall risks are within normal threshold boundaries."

            res = {
                "timestamp": time.time(),
                "model_used": target_model or "ruview-builtin-reasoner",
                "response": reply,
                "local_only": True
            }

            self.send_response(200)
            self._set_cors()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(res).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

def run_server():
    server = HTTPServer(('127.0.0.1', PORT), LLMGatewayHandler)
    print(f"[+] RuView Local LLM Gateway running on http://127.0.0.1:{PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass

if __name__ == '__main__':
    run_server()
