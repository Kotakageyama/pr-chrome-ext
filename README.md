# GitHub PR Manager Chrome Extension

レビューすべきPRと作成したPRを一覧表示するChrome拡張機能です。

![image](https://github.com/user-attachments/assets/f04e390a-fe68-4b7e-876d-a2d22aa706eb)

## 機能

- **レビュー待ちPR一覧**: 自分がレビュワーとしてリクエストされているPRを表示
- **作成済みPR一覧**: 自分が作成したPRを表示
- **リアルタイム更新**: 手動更新ボタンで最新の情報を取得
- **自動更新**: 15分ごとの自動更新（オプション）
- **ダークモード対応**: システムのダークモード設定に自動対応
- **直感的なUI**: タブ形式で見やすく整理された情報表示

## セットアップ

### 1. Personal Access Tokenの取得

1. [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens) にアクセス
2. 「Generate new token (classic)」をクリック
3. Token名を入力（例: "PR Manager Chrome Extension"）
4. **「repo」スコープにチェック**を入れる
5. 「Generate token」をクリック
6. 生成されたトークンをコピーして保存

### 2. Chrome拡張機能のインストール

1. Chromeで `chrome://extensions/` を開く
2. 右上の「デベロッパーモード」をオンにする
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. このプロジェクトのフォルダを選択

### 3. 設定

1. 拡張機能アイコンを右クリック → 「オプション」を選択
2. Personal Access Tokenを入力
3. 「接続テスト」で正常に動作することを確認
4. 「保存」をクリック

## 使用方法

1. ブラウザツールバーの拡張機能アイコンをクリック
2. ポップアップでPR一覧を確認
3. 「レビュー待ち」タブ: 自分がレビューすべきPR
4. 「作成済み」タブ: 自分が作成したPR
5. PR項目をクリックするとGitHubページが開きます

## 表示情報

各PR項目には以下の情報が表示されます：

- PRタイトル
- リポジトリ名
- 作成者のアバター画像と名前
- 最終更新日時
- ステータス（Open、Draft、Merged）
- CI/CDステータス（実装予定）

## ファイル構成

```
pr-chrome-ext/
├── manifest.json       # 拡張機能の設定ファイル
├── popup.html         # ポップアップのHTML
├── popup.css          # ポップアップのスタイル
├── popup.js           # ポップアップの機能
├── options.html       # 設定ページのHTML
├── options.css        # 設定ページのスタイル
├── options.js         # 設定ページの機能
├── background.js      # バックグラウンドスクリプト
└── icons/            # アイコンファイル
```

## GitHub APIクエリ

### レビュー待ちPR
```
is:open is:pr review-requested:@me -author:@me archived:false
```

### 作成済みPR
```
is:open is:pr author:@me archived:false
```

## セキュリティ

- Personal Access Tokenはブラウザのローカルストレージに安全に保存されます
- GitHubとの通信はHTTPS経由で行われます
- トークンは他のサイトからアクセスできません

## トラブルシューティング

### 「認証に失敗しました」と表示される
- Personal Access Tokenが正しく入力されているか確認
- トークンに「repo」スコープが付与されているか確認
- トークンの有効期限が切れていないか確認

### PRが表示されない
- 対象のリポジトリにアクセス権限があるか確認
- Private リポジトリの場合、「repo」スコープが必要
- 「更新」ボタンを押して最新情報を取得

### 拡張機能が動作しない
- Chromeの開発者ツールでエラーログを確認
- 拡張機能を無効化→有効化を試す
- ブラウザの再起動を試す

## ライセンス

MIT License

## 貢献

バグ報告や機能追加の提案はIssueでお知らせください。
