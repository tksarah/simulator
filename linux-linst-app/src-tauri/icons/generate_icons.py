"""
アイコン生成スクリプト

このスクリプトはシンプルな「ペンギン（Linuxを連想）」アイコンを描画し、
複数サイズの PNG と Windows 用の ICO を生成します。

使い方:
  python -m pip install -r requirements.txt
  python generate_icons.py

出力 (src-tauri/icons/):
  - 32x32.png
  - 128x128.png
  - 128x128@2x.png (256x256)
  - icon.ico (16/32/48/64/128/256 を含む)

注意: 高品質な商用アイコンが必要なら、デザイナーによるベクター作成を推奨します。
"""

from PIL import Image, ImageDraw
import math
import os

def lerp_color(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))

def draw_gradient_background(img, top_color, bottom_color):
    w, h = img.size
    draw = ImageDraw.Draw(img)
    for y in range(h):
        t = y / max(h - 1, 1)
        color = lerp_color(top_color, bottom_color, t)
        draw.line([(0, y), (w, y)], fill=color)

def polygon_rectangle(cx, cy, w, h, angle_deg):
    theta = math.radians(angle_deg)
    cos_t = math.cos(theta)
    sin_t = math.sin(theta)
    dx = w / 2.0
    dy = h / 2.0
    corners = [(-dx, -dy), (dx, -dy), (dx, dy), (-dx, dy)]
    pts = []
    for x, y in corners:
        xr = x * cos_t - y * sin_t
        yr = x * sin_t + y * cos_t
        pts.append((cx + xr, cy + yr))
    return pts


def draw_penguin(draw, size):
    cx = size * 0.5
    cy = size * 0.56
    body_rx = size * 0.26
    body_ry = size * 0.34

    # body
    body_box = [cx - body_rx, cy - body_ry, cx + body_rx, cy + body_ry]
    draw.ellipse(body_box, fill=(12, 12, 12))

    # belly
    belly_box = [cx - body_rx * 0.6, cy - body_ry * 0.05, cx + body_rx * 0.6, cy + body_ry * 0.9]
    draw.ellipse(belly_box, fill=(245, 245, 245))

    # head (subtle)
    head_cy = cy - body_ry * 0.6
    head_r = body_rx * 0.9
    head_box = [cx - head_r, head_cy - head_r, cx + head_r, head_cy + head_r]
    # already covered by body; ensure smooth look by drawing a darker overlay
    draw.ellipse(head_box, fill=(12, 12, 12))

    # eyes
    eye_offset_x = body_rx * 0.35
    eye_y = head_cy - head_r * 0.08
    eye_r = max(1, int(size * 0.03))
    for sx in (-1, 1):
        ex = cx + sx * eye_offset_x
        draw.ellipse([ex - eye_r, eye_y - eye_r, ex + eye_r, eye_y + eye_r], fill=(255,255,255))
        pupil_r = max(1, int(eye_r * 0.45))
        draw.ellipse([ex - pupil_r, eye_y - pupil_r, ex + pupil_r, eye_y + pupil_r], fill=(16,16,16))

    # beak
    beak_top = (cx, head_cy + head_r * 0.05)
    beak_left = (cx - body_rx * 0.18, head_cy + head_r * 0.22)
    beak_right = (cx + body_rx * 0.18, head_cy + head_r * 0.22)
    draw.polygon([beak_top, beak_left, beak_right], fill=(252, 186, 3))

    # feet
    foot_w = body_rx * 0.28
    foot_h = body_rx * 0.16
    foot_y = cy + body_ry * 0.72
    left_foot = [cx - body_rx * 0.45 - foot_w/2, foot_y, cx - body_rx * 0.45 + foot_w/2, foot_y + foot_h]
    right_foot = [cx + body_rx * 0.45 - foot_w/2, foot_y, cx + body_rx * 0.45 + foot_w/2, foot_y + foot_h]
    draw.ellipse(left_foot, fill=(252,186,3))
    draw.ellipse(right_foot, fill=(252,186,3))


def draw_gear(draw, size, cx, cy, outer_r, inner_r, teeth=8, color=(255,255,255,220)):
    # teeth as rotated rectangles
    for i in range(teeth):
        angle = i * 360.0 / teeth
        rad = math.radians(angle)
        mid_r = (inner_r + outer_r) / 2.0
        tx = cx + math.cos(rad) * mid_r
        ty = cy + math.sin(rad) * mid_r
        tooth_w = (outer_r - inner_r) * 0.9
        tooth_h = (outer_r - inner_r) * 1.8
        pts = polygon_rectangle(tx, ty, tooth_w, tooth_h, angle)
        draw.polygon(pts, fill=color)
    # outer ring
    draw.ellipse([cx - outer_r, cy - outer_r, cx + outer_r, cy + outer_r], outline=color, width=max(1, int(size*0.008)))
    # center
    draw.ellipse([cx - inner_r*0.55, cy - inner_r*0.55, cx + inner_r*0.55, cy + inner_r*0.55], fill=color)


def create_icon(size):
    img = Image.new('RGBA', (size, size), (0,0,0,0))
    top = (33, 97, 188)   # blue gradient top
    bottom = (36, 137, 199) # blue gradient bottom
    draw_gradient_background(img, top, bottom)
    draw = ImageDraw.Draw(img)
    draw_penguin(draw, size)
    # gear at top-right
    gear_cx = size * 0.78
    gear_cy = size * 0.18
    draw_gear(draw, size, gear_cx, gear_cy, outer_r=size*0.055, inner_r=size*0.032, teeth=8)
    return img


def main():
    out_dir = os.path.dirname(__file__)
    sizes = [16, 24, 32, 48, 64, 96, 128, 256, 512]
    images = {}
    print('Generating base images...')
    for s in sizes:
        img = create_icon(s)
        images[s] = img
    # Save specific filenames expected by tauri.conf.json
    mapping = {
        '32x32.png': 32,
        '128x128.png': 128,
        '128x128@2x.png': 256,
        'icon.png': 512
    }
    for name, s in mapping.items():
        path = os.path.join(out_dir, name)
        print('Saving', path)
        images[s].save(path)

    # Save all png sizes (optional)
    for s, img in images.items():
        path = os.path.join(out_dir, f'{s}x{s}.png')
        img.save(path)

    # Create ICO (Windows) from the largest image, include multiple sizes
    ico_path = os.path.join(out_dir, 'icon.ico')
    print('Saving ICO ->', ico_path)
    icon_source = images[256]
    icon_source.save(ico_path, format='ICO', sizes=[(16,16),(24,24),(32,32),(48,48),(64,64),(128,128),(256,256)])

    print('Done. Generated icons in', out_dir)

if __name__ == '__main__':
    main()
