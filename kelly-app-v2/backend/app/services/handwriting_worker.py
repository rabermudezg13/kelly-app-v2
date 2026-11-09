"""Isolated offline OCR. Only model weights survive between framed requests."""
import os
os.environ.update(HF_HUB_OFFLINE='1', TRANSFORMERS_OFFLINE='1', HF_HUB_DISABLE_TELEMETRY='1', TOKENIZERS_PARALLELISM='false', OMP_NUM_THREADS='2', MKL_NUM_THREADS='2', OPENBLAS_NUM_THREADS='2')
import io
import json
import sys
import struct
import unicodedata
from app.services.handwriting_model import MODEL_DIR
from app.services.name_strip import clean_name_strip

def normalize_name(value):
    name = ' '.join(unicodedata.normalize('NFKC', value).split()).strip(' .,:;')
    if not 2 <= len(name) <= 100 or not all(c.isalpha() or c in " '-’" for c in name):
        return ''
    if len(name.split()) < 2:
        return ''
    return name

def load_reader():
    import torch
    from transformers import TrOCRProcessor, VisionEncoderDecoderModel
    torch.set_num_threads(2)
    processor = TrOCRProcessor.from_pretrained(MODEL_DIR, local_files_only=True)
    model = VisionEncoderDecoderModel.from_pretrained(MODEL_DIR, local_files_only=True, use_safetensors=True).eval()
    return processor, model, torch

def recognize_crop(raw, reader):
    from PIL import Image, ImageOps
    processor, model, torch = reader
    with Image.open(io.BytesIO(raw)) as source:
        image = ImageOps.exif_transpose(source).convert('RGB')
    try:
        cleaned = clean_name_strip(image)
        if cleaned is not image:
            image.close()
            image = cleaned
        with torch.inference_mode():
            pixels = processor(images=image, return_tensors='pt').pixel_values
            ids = model.generate(pixels, max_new_tokens=48, num_beams=3, max_time=20)
        return normalize_name(processor.batch_decode(ids, skip_special_tokens=True)[0])
    finally:
        image.close()

def read_frame(stream):
    prefix = stream.read(4)
    if not prefix:
        return None
    if len(prefix) != 4:
        raise ValueError('Invalid frame')
    size = struct.unpack('!I', prefix)[0]
    if not 0 < size <= 262144:
        raise ValueError('Invalid frame')
    raw = stream.read(size)
    if len(raw) != size:
        raise ValueError('Invalid frame')
    return raw

def serve(reader, source, target):
    while True:
        raw = read_frame(source)
        if raw is None:
            return
        try:
            name = recognize_crop(raw, reader)
            target.write(json.dumps({'name': name}) + '\n')
            target.flush()
        finally:
            # Do not hold candidate data in the idle frame between requests.
            raw = None
            name = None

def main():
    reader = load_reader()
    if '--serve' in sys.argv:
        serve(reader, sys.stdin.buffer, sys.stdout)
    else:
        raw = sys.stdin.buffer.read(262145)
        if len(raw) > 262144:
            raise ValueError('crop too large')
        sys.stdout.write(json.dumps({'name': recognize_crop(raw, reader)}))

if __name__ == '__main__':
    try:
        main()
    except Exception:
        sys.stdout.write('{"error":"recognition_failed"}')
        sys.exit(1)
