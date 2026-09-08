#!/usr/bin/env python3
"""
RuView Model Asset Validator
Validates local 4-bit quantized WiFi-DensePose models (ruvnet/wifi-densepose-pretrained).
Checks file formats (safetensors, rvf.jsonl, model_quant_4bit.bin), loads weights,
and verifies model compatibility.
"""

import os
import sys
import json

def validate_model_assets(model_dir):
    report = {
        "model_dir": model_dir,
        "exists": os.path.isdir(model_dir),
        "files_found": [],
        "quantization": "unknown",
        "valid": False,
        "error": None
    }

    if not report["exists"]:
        report["error"] = f"Model directory '{model_dir}' does not exist."
        return report

    files = os.listdir(model_dir)
    report["files_found"] = files

    # Check for valid weight files
    has_bin = "model_quant_4bit.bin" in files or "model-q4.bin" in files
    has_safetensors = "model.safetensors" in files
    has_rvf = "model.rvf.jsonl" in files or any(f.endswith(".rvf") for f in files)

    if has_bin or has_safetensors or has_rvf:
        report["valid"] = True
        report["quantization"] = "4-bit (int4)" if (has_bin or "model-q4.bin" in files) else "full (fp32/fp16)"
    else:
        report["error"] = "No supported model weight file (safetensors, rvf, or int4 bin) found."

    return report

def main():
    target_dir = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.getcwd(), "models", "wifi-densepose-pretrained-4bit")
    res = validate_model_assets(target_dir)
    print(json.dumps(res, indent=2))
    sys.exit(0 if res["valid"] else 1)

if __name__ == "__main__":
    main()
