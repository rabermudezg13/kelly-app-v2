"""One short-lived OCR process. Images enter stdin, never disk or logs."""
import os
os.environ.update(HF_HUB_OFFLINE='1', TRANSFORMERS_OFFLINE='1', HF_HUB_DISABLE_TELEMETRY='1', TOKENIZERS_PARALLELISM='false', OMP_NUM_THREADS='2', MKL_NUM_THREADS='2', OPENBLAS_NUM_THREADS='2')
import io
import json
import sys
import unicodedata
from app.services.handwriting_model import MODEL_DIR

def normalize_name(value):
    name = ' '.join(unicodedata.normalize('NFKC', value).split()).strip(' .,:;')
    if not 2 <= len(name) <= 100 or not all(c.isalpha() or c in " '-’" for c in name):
        return ''
    if len(name.split()) < 2:
        return ''
    return name

def main():
    from PIL import Image, ImageOps
    import torch
    from transformers import TrOCRProcessor, VisionEncoderDecoderModel
    torch.set_num_threads(2)
    raw = sys.stdin.buffer.read(262145)
    if len(raw) > 262144:
        raise ValueError('crop too large')
    with Image.open(io.BytesIO(raw)) as source:
        image = ImageOps.exif_transpose(source).convert('RGB')
    processor = TrOCRProcessor.from_pretrained(MODEL_DIR, local_files_only=True)
    model = VisionEncoderDecoderModel.from_pretrained(MODEL_DIR, local_files_only=True, use_safetensors=True).eval()
    with torch.inference_mode():
        ids = model.generate(processor(images=image, return_tensors='pt').pixel_values,
                             max_new_tokens=48, num_beams=3, max_time=20)
    text = normalize_name(processor.batch_decode(ids, skip_special_tokens=True)[0])
    sys.stdout.write(json.dumps({'name': text}))
    image.close()

if __name__ == '__main__':
    try:
        main()
    except Exception:
        sys.stdout.write('{"error":"recognition_failed"}')
        sys.exit(1)
