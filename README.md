
# Simulator

**バージョン**: 1.1.0

## 概要
このリポジトリは、HTML/CSS/JavaScript を使ったシンプルなブラウザ向けシミュレータを含みます。フロントエンドの主要なファイル群と、オフライン対応のための Service Worker (`sw.js`) を提供します。デスクトップ向けラッパーとして Tauri ベースのサブプロジェクトが `linux-linst-app/` に含まれます。

## 主要ファイル
- `index.html` — ルートおよびエントリポイント
- `app-main.html` — アプリ本体の HTML
- `app.js` — メインの JavaScript
- `style.css` — スタイルシート
- `sw.js` — Service Worker（オフライン機能）
- `linux-linst-app/` — Tauri デスクトップアプリ用ソース

## 簡単な使い方
1. このディレクトリで `index.html` をブラウザで開きます。
2. 開発中は `app.js` や `style.css` を編集してブラウザをリロードしてください。

## バージョン管理
現在のバージョンは `1.1.0` です。リリース時には Git タグ（例: `v1.1.0`）を付けてください。

## ライセンス
このプロジェクトは MIT ライセンスの下で配布されます。

---

MIT License

Copyright (c) 2026

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

