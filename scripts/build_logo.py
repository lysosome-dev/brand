#!/usr/bin/env python3
"""Generate every logo SVG in logo/svg/ from the glyph geometry + outlined Bricolage Grotesque.

Requires: pip install fonttools brotli uharfbuzz
Usage:    python3 scripts/build_logo.py && scripts/export-png.sh

The wordmark is outlined from fonts/bricolage-grotesque-latin.woff2 at the site's wordmark
settings (wght 650, wdth 88, letter-spacing -0.03em), so no SVG depends on a web font.
"""
import io
import json
from pathlib import Path

import uharfbuzz as hb
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "logo" / "svg"
TOKENS = json.loads((ROOT / "tokens" / "tokens.json").read_text())
C = TOKENS["color"]


def dark(name):
    node = C
    for k in name.split("."):
        node = node[k]
    return node["$value"]


def light(name):
    node = C
    for k in name.split("."):
        node = node[k]
    return node["$extensions"]["dev.lysosome.modes"]["light"]


# ---------------------------------------------------------------- glyph
# The organelle: an irregular membrane (stain) holding three vesicles, one per safety tier.
MEMBRANE = "M16 3.2c6.4-.3 12.6 4.6 12.8 11.6.2 7.4-5.3 13.9-12.6 14-7.2.1-13.1-5.9-13-13C3.3 8.9 9.4 3.5 16 3.2Z"
VESICLES = [(12.4, 13, 3, "tier.regenerable"), (19.6, 11.6, 2.1, "tier.expensive"), (17.6, 20.2, 2.6, "tier.review")]
# membrane bbox is x 3.2..28.8, y 3.2..29.2 -> 25.6 x 26.0, optical centre ~ (16, 16.2)

PALETTES = {
    # name: (membrane stroke, membrane fill, fill-opacity, vesicle colors, ink)
    "on-dark": (dark("stain"), dark("stain"), 0.16, [dark(v[3]) for v in VESICLES], dark("ink")),
    "on-light": (light("stain"), light("stain"), 0.10, [light(v[3]) for v in VESICLES], light("ink")),
    "mono-black": ("#000000", "none", 1, ["#000000"] * 3, "#000000"),
    "mono-white": ("#ffffff", "none", 1, ["#ffffff"] * 3, "#ffffff"),
}


def glyph(pal, stroke_width=2.2, solid=False):
    stroke, fill, op, ves, _ = PALETTES[pal]
    if solid:  # badge: opaque cell body, reads on any background (favicon style)
        mem = f'<path d="{MEMBRANE}" fill="{dark("surface")}" stroke="{stroke}" stroke-width="{stroke_width}"/>'
    elif fill == "none":
        mem = f'<path d="{MEMBRANE}" fill="none" stroke="{stroke}" stroke-width="{stroke_width}"/>'
    else:
        mem = f'<path d="{MEMBRANE}" fill="{fill}" fill-opacity="{op}" stroke="{stroke}" stroke-width="{stroke_width}"/>'
    dots = "".join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{c}"/>' for (x, y, r, _), c in zip(VESICLES, ves))
    return mem + dots


# ---------------------------------------------------------------- wordmark outlines
def load_bricolage(opsz):
    font = TTFont(ROOT / "fonts" / "bricolage-grotesque-latin.woff2")
    font.flavor = None
    inst = instantiateVariableFont(font, {"wght": 650, "wdth": 88, "opsz": opsz})
    buf = io.BytesIO()
    inst.save(buf)
    return TTFont(io.BytesIO(buf.getvalue())), buf.getvalue()


def outline(text, size, opsz=24, tracking=-0.03):
    """Return (svg path d, advance width, x-height, cap metrics) for text at `size` px, baseline y=0."""
    font, data = load_bricolage(opsz)
    upem = font["head"].unitsPerEm
    face = hb.Face(data)
    hbfont = hb.Font(face)
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(hbfont, buf, {"kern": True, "liga": True})
    gs = font.getGlyphSet()
    order = font.getGlyphOrder()
    scale = size / upem
    pen = SVGPathPen(gs, ntos=lambda v: f"{v:.2f}".rstrip("0").rstrip("."))
    bp = BoundsPen(gs)
    x = 0.0
    track = tracking * upem
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        name = order[info.codepoint]
        tp = TransformPen(pen, (scale, 0, 0, -scale, (x + pos.x_offset) * scale, -pos.y_offset * scale))
        gs[name].draw(tp)
        gs[name].draw(TransformPen(bp, (scale, 0, 0, -scale, (x + pos.x_offset) * scale, -pos.y_offset * scale)))
        x += pos.x_advance + track
    width = (x - track) * scale
    os2 = font["OS/2"]
    # ink bounds (y down): xmin, ymin (top of ascender, negative), xmax, ymax (descender bottom)
    return pen.getCommands(), bp.bounds, os2.sxHeight * scale


def svg(w, h, body, title):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {fmt(w)} {fmt(h)}" width="{fmt(w)}" height="{fmt(h)}" '
        f'role="img" aria-label="{title}"><title>{title}</title>{body}</svg>\n'
    )


def fmt(v):
    return f"{v:.2f}".rstrip("0").rstrip(".")


def write(name, content):
    (OUT / name).write_text(content)
    print("wrote", f"logo/svg/{name}")


def main():
    OUT.mkdir(parents=True, exist_ok=True)

    # Marks (32-unit grid, 1-unit safe margin built into the geometry)
    for pal in PALETTES:
        write(f"mark-{pal}.svg", svg(32, 32, glyph(pal), "lysosome"))
    write("mark-solid.svg", svg(32, 32, glyph("on-dark", 2.4, solid=True), "lysosome"))

    # Wordmark: 100px font size master. Ink box measured from font metrics.
    size = 100
    d, (x0, y0, x1, y1), xh = outline("lysosome", size)
    # Tight ink box: shift so the outline starts at x=0; asc/desc are distances from the baseline.
    width = x1 - x0
    asc, desc = -y0, -y1  # asc > 0, desc < 0
    for pal in PALETTES:
        ink = PALETTES[pal][4]
        body = f'<path transform="translate({fmt(-x0)} {fmt(asc)})" fill="{ink}" d="{d}"/>'
        write(f"wordmark-{pal}.svg", svg(width, asc - desc, body, "lysosome"))

    # Horizontal lockup, site proportions: glyph 28px : text 21.12px, gap 10px.
    g = size * 28 / 21.12  # glyph box edge
    gap = size * 10 / 21.12
    # centre the glyph's optical centre on the x-height midline
    mid_y = -xh / 2
    top = min(-asc, mid_y - g / 2)
    bot = max(-desc, mid_y + g / 2)
    h = bot - top
    by = -top  # baseline y in lockup coords
    gy = by + mid_y - g / 2
    s = g / 32
    for pal in PALETTES:
        ink = PALETTES[pal][4]
        body = (
            f'<g transform="translate(0 {fmt(gy)}) scale({fmt(s)})">{glyph(pal)}</g>'
            f'<path transform="translate({fmt(g + gap - x0)} {fmt(by)})" fill="{ink}" d="{d}"/>'
        )
        write(f"lockup-horizontal-{pal}.svg", svg(g + gap + width, h, body, "lysosome"))

    # Stacked lockup: glyph above, centred, text below.
    gs_ = size * 2.1
    gap_v = size * 0.28
    W = max(width, gs_)
    for pal in PALETTES:
        ink = PALETTES[pal][4]
        body = (
            f'<g transform="translate({fmt((W - gs_) / 2)} 0) scale({fmt(gs_ / 32)})">{glyph(pal)}</g>'
            f'<path transform="translate({fmt((W - width) / 2 - x0)} {fmt(gs_ + gap_v + asc)})" fill="{ink}" d="{d}"/>'
        )
        write(f"lockup-stacked-{pal}.svg", svg(W, gs_ + gap_v + asc - desc, body, "lysosome"))

    # Avatar: full-bleed slide, mark sized to sit inside a circle crop with room to breathe.
    bg, deep, line, stain = dark("bg"), dark("bg-deep"), dark("line"), dark("stain")
    mark_size = 340  # of 500 -> membrane ~272px, inside the 500px inscribed circle
    off = (500 - mark_size) / 2
    avatar = (
        '<defs>'
        f'<radialGradient id="field" cx="50%" cy="50%" r="60%"><stop offset="0" stop-color="#1d1729"/>'
        f'<stop offset=".62" stop-color="{bg}"/><stop offset="1" stop-color="{deep}"/></radialGradient>'
        '<filter id="glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1"/></filter>'
        '</defs>'
        '<rect width="500" height="500" fill="url(#field)"/>'
        f'<g transform="translate({fmt(off)} {fmt(off)}) scale({fmt(mark_size / 32)})">'
        f'<path d="{MEMBRANE}" fill="none" stroke="{stain}" stroke-width="2.4" stroke-opacity=".55" filter="url(#glow)"/>'
        f'<path d="{MEMBRANE}" fill="{dark("surface")}" stroke="{stain}" stroke-width="2.4"/>'
        f'<path d="{MEMBRANE}" fill="{stain}" fill-opacity=".14"/>'
        + "".join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{dark(t)}"/>' for x, y, r, t in VESICLES)
        + "</g>"
    )
    write("avatar.svg", svg(500, 500, avatar, "lysosome"))


if __name__ == "__main__":
    main()
