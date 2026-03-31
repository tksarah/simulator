このディレクトリにはアイコン生成スクリプトと出力イメージが入ります。

目的:
- Windows（ICO）とアプリバンドル用のPNGを自動生成します。

使い方:
1. Python 3 をインストールします。
2. 仮想環境を作ることを推奨します。

例（PowerShell / Windows）:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python generate_icons.py
```

生成されるファイル:
- `32x32.png`, `128x128.png`, `128x128@2x.png`, `icon.ico`, など

注意:
- 生成されるアイコンは学習用のシンプルなデザインです。商用やブランディング用途には、デザイナーによるベクターデータを推奨します。

バッジ（教育的）スタイル:
- `badge.svg` (SVG ソース)
- `badge-32.png`, `badge-64.png`, `badge-128.png`, `badge-256.png`, `badge-512.png`
- `badge.ico` (Windows 用 ICO、16/24/32/48/64/128/256 を含む)

生成方法:
```powershell
# 例: アイコンディレクトリで
python generate_badge.py
```

用途:
- チュートリアル / コースや学習用 UI に合うバッジ風アイコンです。色や比率はスクリプト内のパラメータで調整できます。
