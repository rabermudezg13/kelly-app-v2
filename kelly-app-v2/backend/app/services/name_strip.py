"""Clean an OCR-only copy of a name strip; never alter the user's document."""


def clean_name_strip(image):
    import numpy as np
    from PIL import Image, ImageOps

    gray = np.asarray(ImageOps.grayscale(image))
    ink = gray < 145
    height, width = ink.shape
    columns = np.arange(width)
    best = (0, 0, 0)
    # Only a long rule across the lower half qualifies, never a text baseline.
    for slope in np.linspace(-.1, .1, 81):
        for intercept in range(height):
            if intercept + slope * width / 2 < height * .5:
                continue
            rows = np.rint(intercept + slope * columns).astype(int)
            valid = (rows >= 0) & (rows < height)
            coverage = ink[rows[valid], columns[valid]].sum() / width
            if coverage > best[0]:
                best = (coverage, slope, intercept)
    if best[0] < .65:
        return image
    _, slope, intercept = best
    original_ink = ink.copy()
    for x in range(width):
        y = round(intercept + slope * x)
        if not 0 <= y < height:
            continue
        # Retain strokes crossing the rule so a letter's foot is not erased.
        above = original_ink[max(0, y - 8):max(0, y - 3), x].any()
        below = original_ink[min(height, y + 4):min(height, y + 9), x].any()
        if not above and not below:
            ink[max(0, y - 3):min(height, y + 4), x] = False
    ink[:, ink.sum(axis=0) > height * .65] = False
    seen = np.zeros_like(ink)
    kept = np.zeros_like(ink)
    for y, x in zip(*np.where(ink)):
        if seen[y, x]:
            continue
        pending, component = [(y, x)], []
        seen[y, x] = True
        while pending:
            yy, xx = pending.pop()
            component.append((yy, xx))
            for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0)):
                ny, nx = yy + dy, xx + dx
                if 0 <= ny < height and 0 <= nx < width and ink[ny, nx] and not seen[ny, nx]:
                    seen[ny, nx] = True
                    pending.append((ny, nx))
        ys, xs = zip(*component)
        if len(component) >= 8 and max(xs) - min(xs) >= 3 and min(ys) > 0 and max(ys) < height - 2:
            kept[tuple(zip(*component))] = True
    ys, xs = np.where(kept)
    if len(xs) < 30 or max(xs) - min(xs) < 20:
        return image
    cleaned = np.full_like(gray, 255)
    cleaned[kept] = gray[kept]
    return Image.fromarray(cleaned).crop((max(0, min(xs) - 6), max(0, min(ys) - 6),
                                        min(width, max(xs) + 7), min(height, max(ys) + 7))).convert('RGB')
