"""Static model preparation only. Never receives candidate images or text."""
import os
from pathlib import Path
MODEL_ID = 'microsoft/trocr-base-handwritten'
REVISION = 'eaacaf452b06415df8f10bb6fad3a4c11e609406'
MODEL_DIR = Path(os.environ.get('DRUG_OCR_MODEL_DIR', '/app/.cache/drug-name-model'))

def ready():
    return (MODEL_DIR / 'model.safetensors').is_file() and (MODEL_DIR / '.ready').is_file()

def prepare():
    if ready():
        return
    from huggingface_hub import snapshot_download
    os.environ['HF_HUB_DISABLE_TELEMETRY'] = '1'
    snapshot_download(MODEL_ID, revision=REVISION, local_dir=str(MODEL_DIR),
                      allow_patterns=['*.json', '*.txt', '*.model', 'model.safetensors'])
    (MODEL_DIR / '.ready').write_text(REVISION)
