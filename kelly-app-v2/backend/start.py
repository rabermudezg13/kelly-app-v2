import os
import sys

if __name__ == "__main__":
    port = os.environ.get("PORT", "8000")
    os.system(f"uvicorn main:app --host 0.0.0.0 --port {port}")
