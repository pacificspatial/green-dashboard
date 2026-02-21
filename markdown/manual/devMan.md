# 環境構築手順書

# 1 本書について

本書では、樹木管理ダッシュボード（以下「本システム」という。）の利用環境構築手順について記載しています。本システムの構成や仕様の詳細については以下も参考にしてください。

[技術検証レポート](https://www.mlit.go.jp/plateau/file/libraries/doc/plateau_tech_doc_0030_ver01.pdf)

# 2 動作環境

本システムのサーバサイドの動作環境は以下のとおりです。

| 項目 | 最小動作環境 | 推奨動作環境 |
| --- | --- | --- |
| OS | Microsoft Windows 10 以上　または macOS 12 Monterey 以上 | 同左 |
| CPU | Pentium 4 以上 | 同左 |
| メモリ | 8GB以上 | 同左 |

クライアント（ブラウザ）の動作環境は以下のとおりです。

| 項目 | 動作環境 |
| --- | --- |
| ブラウザ | Google Chrome 最新版 |

本システムで使用するソフトウェアおよびサービスの一覧は以下のとおりです。

| 種別 | 名称 | バージョン | 内容 |
| --- | --- | --- | --- |
| オープンソースソフトウェア | [Apache HTTP Server](https://httpd.apache.org/) | 2.4.58 | Webアプリを配信するためのWebサーバ |
| オープンソースソフトウェア | [PostGIS](https://github.com/postgis/postgis) | 3.4.1 | PostgreSQL で位置情報を扱うための拡張機能 |
| オープンソースRDBMS | [PostgreSQL](https://github.com/postgres/postgres) | 16.2 | 樹木台帳データ等を格納するリレーショナルデータベース |
| オープンソースライブラリ | [React.js](https://github.com/facebook/react) | 19.x | UIを構築するためのJavaScriptライブラリ |
| オープンソースライブラリ | [MapLibre GL JS](https://github.com/maplibre/maplibre-gl-js) | 5.x | 地図表示ライブラリ |
| オープンソースライブラリ | [CesiumJS](https://github.com/CesiumGS/cesium) | 1.135.x | 3Dビューア用ライブラリ |
| 商用ライブラリ | [AG Grid](https://ag-grid.com/) | 34.x | テーブル表示・集計ライブラリ |
| クラウドサービス | [Firebase](https://firebase.google.com/) | - | 認証機能（Firebase Authentication）を提供 |
| 商用ソフトウェア | [FME Form](https://safe.com/) | 2025.1, 2025.2 | データ変換 |

#  3 事前準備

本システムで利用する下記のソフトウェア・サービスを準備します。

（1）データベースの準備

[こちら](https://github.com/postgres/postgres)を利用してPostgreSQLサーバを起動します。その上で、位置情報を扱うための拡張機能である [PostGIS](https://github.com/postgis/postgis) をインストールします。

（2）Webサーバの準備

[こちら](https://httpd.apache.org/)を利用してWebサーバを起動します。ビルド済みのフロントエンド資材を配信するためのドキュメントルートを設定してください。

（3）Node.js の準備

[こちら](https://nodejs.org/)からNode.js LTS版（v20以上）をインストールします。フロントエンドのビルドに使用します。

（4）Firebase プロジェクトの準備

[Firebase コンソール](https://console.firebase.google.com/)で新規プロジェクトを作成します。Authentication を有効化し、メール/パスワード認証プロバイダを有効にします。プロジェクトの設定画面から API キーや Auth ドメインなどの接続情報を控えてください。

# 4 インストール手順

（1）リポジトリの取得

[こちら](https://github.com/Project-PLATEAU/green-dashboard)から樹木管理ダッシュボードのソースコードをダウンロードします。

（2）環境変数の設定

プロジェクトルート直下に `.env` ファイルを作成し、以下の環境変数を設定します。

```
VITE_PROJECT_NAME=<アプリケーション名>
VITE_API_ENDPOINT=<バックエンドAPIのエンドポイント>
VITE_FIREBASE_API_KEY=<FirebaseのAPIキー>
VITE_FIREBASE_AUTH_DOMAIN=<FirebaseのAuthドメイン>
VITE_FIREBASE_PROJECT_ID=<FirebaseのプロジェクトID>
VITE_FIREBASE_STORAGE_BUCKET=<FirebaseのStorageバケット>
VITE_FIREBASE_APP_ID=<FirebaseのアプリID>
VITE_FIREBASE_MEASUREMENT_ID=<Firebaseの計測ID>
```

`.env` ファイルは `.gitignore` で管理対象外となっています。誤ってGitにコミットしないよう注意してください。

（3）依存ライブラリのインストールとビルド

依存パッケージをインストールし、本番用ビルドを実行します。

```bash
npm install
npm run build
```

ビルド成果物は `dist` ディレクトリに出力されます。

（4）Webサーバへの配置

`dist` ディレクトリの内容を、3（2）で準備したWebサーバのドキュメントルートに配置します。SPAのため、すべてのリクエストを `index.html` にフォールバックするよう `.htaccess` を設定してください。

# 5 バックエンドAPIの構築

PostgreSQLに接続し、本システム用のデータベースを作成します。PostGIS拡張を有効化した上で、バックエンドAPIの実装に合わせてテーブルを作成してください。

# 6 初期データの投入

本システムの稼働に必要なデータを投入します。

（1）樹木台帳データの登録

樹木台帳データを PostgreSQL に格納します。

（2）3D都市モデルデータの登録

3D都市モデル（建物モデル・樹木モデル等）を Amazon S3 に格納します。

（3）ユーザの登録

Firebase コンソールまたはバックエンドAPIのユーザ管理機能から初期ユーザを登録します。ユーザには用途に応じて閲覧・編集・管理などの権限を付与してください。

# 7 動作確認

WebサーバのURLにブラウザからアクセスし、ログイン画面が表示されることを確認します。登録したユーザのメールアドレスとパスワードでログインし、地図上に樹木ポイントが表示されることを確認します。