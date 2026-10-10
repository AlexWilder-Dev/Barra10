"""Generates the site's fileteado-style ornaments as SVG (frame, divider, sun).

Usage: python3 tools/ornaments.py assets/img
"""
import math
import sys

GOLD = "#e9b13b"
RED = "#d3342a"
SKY = "#7cbbe6"
CREAM = "#f4e8d0"
GREEN = "#2f8a57"


def spiral(cx, cy, r0, r1, a0, turns, direction, steps=120):
    pts = []
    total = turns * 2 * math.pi
    for i in range(steps + 1):
        t = i / steps
        a = a0 + direction * total * t
        r = r0 + (r1 - r0) * (t ** 0.9)
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts


def poly(pts):
    return " ".join(f"L{x:.2f},{y:.2f}" for x, y in pts)


C = 120  # corner box


def corner():
    g = []
    # Outer gold line: enters along y=2, rolls into a big spiral.
    h = spiral(80, 28, 26, 3.5, -math.pi / 2, 1.55, -1)
    g.append(f'<path d="M{C},2 H80 {poly(h)}" fill="none" stroke="{GOLD}" stroke-width="3.5" stroke-linecap="round"/>')
    v = [(y, x) for x, y in h]
    g.append(f'<path d="M2,{C} V80 {poly(v)}" fill="none" stroke="{GOLD}" stroke-width="3.5" stroke-linecap="round"/>')
    # Inner red pinstripe: ends in a small reverse curl and a sky bead.
    rh = spiral(112, 19, 6, 1.5, -math.pi / 2, 1.1, -1, 60)
    g.append(f'<path d="M{C},13 H112 {poly(rh)}" fill="none" stroke="{RED}" stroke-width="2" stroke-linecap="round"/>')
    rv = [(y, x) for x, y in rh]
    g.append(f'<path d="M13,{C} V112 {poly(rv)}" fill="none" stroke="{RED}" stroke-width="2" stroke-linecap="round"/>')
    # Acanthus-style leaf pointing into the corner.
    leaf = "M58,58 C52,40 40,22 14,14 C22,40 40,52 58,58 Z"
    g.append(f'<path d="{leaf}" fill="{RED}" stroke="{GOLD}" stroke-width="1.6" stroke-linejoin="round"/>')
    g.append(f'<path d="M55,55 C44,42 32,28 18,18" fill="none" stroke="{GOLD}" stroke-width="1.2" stroke-linecap="round"/>')
    g.append(f'<path d="M50,44 C46,36 41,30 34,25" fill="none" stroke="{SKY}" stroke-width="1.4" stroke-linecap="round"/>')
    g.append(f'<path d="M44,50 C36,46 30,41 25,34" fill="none" stroke="{SKY}" stroke-width="1.4" stroke-linecap="round"/>')
    # Leaf tip curl.
    tip = spiral(17, 20, 5, 1, math.pi * 1.25, 1.0, 1, 40)
    g.append(f'<path d="M14,14 {poly(tip)}" fill="none" stroke="{GOLD}" stroke-width="1.4" stroke-linecap="round"/>')
    # Beads along the diagonal.
    for i, r in enumerate((3.2, 2.4, 1.6)):
        d = 66 + i * 8
        g.append(f'<circle cx="{d}" cy="{d}" r="{r}" fill="{GOLD}"/>')
    g.append(f'<circle cx="80" cy="28" r="2.6" fill="{SKY}"/>')
    g.append(f'<circle cx="28" cy="80" r="2.6" fill="{SKY}"/>')
    return "".join(g)


def frame(size=300):
    c = corner()
    s = size
    parts = []
    for rot in (0, 90, 180, 270):
        parts.append(
            f'<g transform="rotate({rot} {s/2} {s/2})">{c}'
            f'<path d="M{C},2 H{s-C}" stroke="{GOLD}" stroke-width="3.5"/>'
            f'<path d="M{C},13 H{s-C}" stroke="{RED}" stroke-width="2"/></g>'
        )
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{s}" height="{s}" viewBox="0 0 {s} {s}">{"".join(parts)}</svg>'


def divider(w=320, h=40):
    """Horizontal scroll: lines curling into spirals either side of a diamond."""
    cx, cy = w / 2, h / 2
    g = []
    right = spiral(cx + 34, cy - 7, 7, 1.5, math.pi / 2, 1.2, -1, 60)
    g.append(f'<path d="M{w-4},{cy} H{cx+34} {poly(right)}" fill="none" stroke="{GOLD}" stroke-width="2.4" stroke-linecap="round"/>')
    left = [(w - x, y) for x, y in right]
    g.append(f'<path d="M4,{cy} H{cx-34} {poly(left)}" fill="none" stroke="{GOLD}" stroke-width="2.4" stroke-linecap="round"/>')
    g.append(f'<path d="M{cx},{cy-11} L{cx+11},{cy} L{cx},{cy+11} L{cx-11},{cy} Z" fill="{RED}" stroke="{GOLD}" stroke-width="1.6"/>')
    g.append(f'<circle cx="{cx}" cy="{cy}" r="2.6" fill="{SKY}"/>')
    g.append(f'<circle cx="{cx-20}" cy="{cy+6}" r="2" fill="{SKY}"/><circle cx="{cx+20}" cy="{cy+6}" r="2" fill="{SKY}"/>')
    g.append(f'<circle cx="6" cy="{cy}" r="3" fill="{GOLD}"/><circle cx="{w-6}" cy="{cy}" r="3" fill="{GOLD}"/>')
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">{"".join(g)}</svg>'


def sun(rays=32, r_in=60, r_straight=98, r_wavy=90):
    """Sun with alternating straight and wavy rays (after the Sol de Mayo)."""
    straight, wavy = [], []
    for i in range(rays):
        a = i / rays * 2 * math.pi - math.pi / 2
        w = math.pi / rays * 0.55
        if i % 2 == 0:
            p = [(100 + r_in * math.cos(a - w), 100 + r_in * math.sin(a - w)),
                 (100 + r_straight * math.cos(a), 100 + r_straight * math.sin(a)),
                 (100 + r_in * math.cos(a + w), 100 + r_in * math.sin(a + w))]
            straight.append("M" + " L".join(f"{x:.2f},{y:.2f}" for x, y in p) + "Z")
        else:
            pts = []
            for k in range(25):
                t = k / 24
                r = r_in + (r_wavy - r_in) * t
                off = math.sin(t * math.pi * 3) * w * 0.9 * (1 - t * 0.6)
                pts.append((100 + r * math.cos(a + off), 100 + r * math.sin(a + off)))
            wavy.append("M" + " L".join(f"{x:.2f},{y:.2f}" for x, y in pts))
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">'
        f'<path d="{" ".join(straight)}" fill="{GOLD}"/>'
        f'<path d="{" ".join(wavy)}" fill="none" stroke="{GOLD}" stroke-width="3.4" stroke-linecap="round"/>'
        f'<circle cx="100" cy="100" r="{r_in}" fill="{GOLD}"/>'
        f'<circle cx="100" cy="100" r="{r_in - 6}" fill="{RED}"/>'
        f'<circle cx="100" cy="100" r="{r_in - 10}" fill="none" stroke="{CREAM}" stroke-width="1.6" stroke-dasharray="2 4"/>'
        "</svg>"
    )


if __name__ == "__main__":
    out = sys.argv[1]
    open(f"{out}/frame.svg", "w").write(frame())
    open(f"{out}/divider.svg", "w").write(divider())
    open(f"{out}/sun.svg", "w").write(sun())
    print("ok")
