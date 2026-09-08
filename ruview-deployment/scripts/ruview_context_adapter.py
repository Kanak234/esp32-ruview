#!/usr/bin/env python3
"""
RuView Context Adapter
Transforms raw backend telemetry into structured, sanitized JSON for Local LLM reasoning.
"""

import json, time

class RuViewContextAdapter:
    def __init__(self):
        pass

    def adapt(self, raw_telemetry):
        if not isinstance(raw_telemetry, dict):
            raw_telemetry = {}

        occupancy = raw_telemetry.get("occupancy", raw_telemetry.get("occupancy_count", 0))
        activity = raw_telemetry.get("activity", "IDLE")

        structured_context = {
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "sensing_system": "RuView WiFi CSI Spatial Intelligence",
            "room": raw_telemetry.get("room_name", "Living Room"),
            "presence_detected": occupancy > 0,
            "occupancy_count": occupancy,
            "room_activity_state": activity,
            "vital_signs": {
                "heart_rate_bpm": raw_telemetry.get("heart_rate_bpm", None),
                "respiration_rate_rpm": raw_telemetry.get("respiration_rate_bpm", None)
            },
            "semantic_states": {
                "someone_sleeping": raw_telemetry.get("someone_sleeping", False),
                "fall_risk_elevated": raw_telemetry.get("fall_risk_elevated", False),
                "possible_distress": raw_telemetry.get("possible_distress", False),
                "bed_exit": raw_telemetry.get("bed_exit", False),
                "no_movement": raw_telemetry.get("no_movement", False)
            },
            "rf_signal_quality": {
                "active_nodes_count": raw_telemetry.get("nodes_count", 1),
                "csi_frame_rate_fps": raw_telemetry.get("frame_rate_fps", 128),
                "snr_db": raw_telemetry.get("snr_db", 24.5)
            }
        }
        return structured_context

    def format_prompt(self, context, user_query="What is the current spatial status?"):
        system_instructions = (
            "You are the local reasoning assistant for RuView WiFi CSI Spatial Intelligence System.\n"
            "PRIVACY & PHYSICS DIRECTIVES:\n"
            "1. You operate 100% locally on the user's host machine. Zero cloud APIs, zero remote telemetry.\n"
            "2. All sensor inputs come from WiFi Channel State Information (CSI) subcarrier perturbation analysis.\n"
            "3. Do NOT describe WiFi CSI as an optical camera or photographic feed.\n"
            "4. Do NOT invent or hallucinate people, names, facial details, or unprovided sensor values.\n"
            "5. Do NOT provide medical diagnosis. Treat all vital signs and fall risks as probabilistic inferences.\n"
            "6. Answer user questions concisely and clearly using only the provided structured context."
        )

        prompt = (
            f"{system_instructions}\n\n"
            f"--- RUVIEW STRUCTURED SENSING CONTEXT ---\n"
            f"{json.dumps(context, indent=2)}\n"
            f"-----------------------------------------\n\n"
            f"USER QUERY: {user_query}\n\n"
            f"ASSISTANT RESPONSE:"
        )
        return prompt

if __name__ == "__main__":
    adapter = RuViewContextAdapter()
    sample = adapter.adapt({"occupancy": 1, "activity": "ACTIVE", "heart_rate_bpm": 74})
    print(adapter.format_prompt(sample, "Check current room safety."))
