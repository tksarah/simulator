"""
Badge（教育的）アイコン生成スクリプト

このスクリプトはシンプルなバッジ風アイコンを複数サイズのPNGとWindows用ICOで出力します。
実行:
  python generate_badge.py

出力:
  - badge-32.png, badge-64.png, badge-128.png, badge-256.png, badge-512.png
  - badge.ico
"""

from PIL import Image, ImageDraw
import os


def draw_badge(size):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    cx = size / 2.0
    cy = size / 2.0

    # 外側の円（緑）
    outer_r = size * 0.48
    green = (26, 188, 156)
    draw.ellipse([cx - outer_r, cy - outer_r, cx + outer_r, cy + outer_r], fill=green)

    # 内側の白いリング
    inner_r = size * 0.36
    draw.ellipse([cx - inner_r, cy - inner_r, cx + inner_r, cy + inner_r], fill=(255, 255, 255, 255))

    # ペンギンの胴体（黒）
    body_rx = size * 0.18
    body_ry = size * 0.24
    body_cy = cy + size * 0.04
    draw.ellipse([cx - body_rx, body_cy - body_ry, cx + body_rx, body_cy + body_ry], fill=(12, 12, 12))

    # ベリー（白）
    belly_rx = body_rx * 0.6
    belly_ry = body_ry * 0.72
    draw.ellipse([cx - belly_rx, body_cy - belly_ry, cx + belly_rx, body_cy + belly_ry], fill=(255, 255, 255))

    # 頭（黒）
    head_r = body_rx * 0.9
    head_cy = body_cy - body_ry * 0.65
    draw.ellipse([cx - head_r, head_cy - head_r, cx + head_r, head_cy + head_r], fill=(12, 12, 12))

    # 目
    eye_offset_x = body_rx * 0.4
    eye_y = head_cy - head_r * 0.08
    eye_r = max(1, int(size * 0.03))
    for sx in (-1, 1):
        ex = cx + sx * eye_offset_x
        draw.ellipse([ex - eye_r, eye_y - eye_r, ex + eye_r, eye_y + eye_r], fill=(255, 255, 255))
        pupil_r = max(1, int(eye_r * 0.45))
        draw.ellipse([ex - pupil_r, eye_y - pupil_r, ex + pupil_r, eye_y + pupil_r], fill=(16, 16, 16))

    # くちばし
    beak_top = (cx, head_cy + head_r * 0.05)
    beak_left = (cx - body_rx * 0.18, head_cy + head_r * 0.22)
    beak_right = (cx + body_rx * 0.18, head_cy + head_r * 0.22)
    draw.polygon([beak_top, beak_left, beak_right], fill=(252, 186, 3))

    return img


def main():
    out_dir = os.path.dirname(__file__)
    sizes = [32, 64, 128, 256, 512]
    images = {}

    for s in sizes:
        images[s] = draw_badge(s)

    for s, img in images.items():
        path = os.path.join(out_dir, f'badge-{s}.png')
        print('Saving', path)
        img.save(path)

    # ICO を生成（複数サイズを含める）
    ico_path = os.path.join(out_dir, 'badge.ico')
    print('Saving', ico_path)
    images[256].save(ico_path, format='ICO', sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])

    print('Done. Files written to', out_dir)


if __name__ == '__main__':
    main()
