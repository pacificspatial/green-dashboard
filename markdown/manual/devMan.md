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

# 3 事前準備

本システムで利用する下記のソフトウェア・サービスを準備します。

## （1）データベースの準備

[PostgreSQL](https://github.com/postgres/postgres) を使ってPostgreSQLサーバを起動します。その上で、位置情報を扱うための拡張機能である [PostGIS](https://github.com/postgis/postgis) をインストールします。

```sql
-- PostGIS の有効化
CREATE EXTENSION IF NOT EXISTS postgis;
```

## （2）Webサーバの準備

[Apache HTTP Server](https://httpd.apache.org/) を使ってWebサーバを起動します。ビルド済みのフロントエンド資材を配信するためのドキュメントルートを設定してください。

## （3）Node.js の準備

フロントエンドのビルドには Node.js が必要です。[Node.js 公式サイト](https://nodejs.org/)より、LTS版（v20以上）をインストールしてください。

```bash
# バージョン確認
node -v   # v20.x.x 以上であることを確認
npm -v
```

## （4）Firebase プロジェクトの準備

1. [Firebase コンソール](https://console.firebase.google.com/)で新規プロジェクトを作成します。
2. **Authentication** を有効化し、**メール/パスワード** 認証プロバイダを有効にします。
3. プロジェクトの設定画面から以下の値を控えます。

| 環境変数名 | 説明 |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | Firebase API キー |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth ドメイン |
| `VITE_FIREBASE_PROJECT_ID` | Firebase プロジェクト ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage バケット |
| `VITE_FIREBASE_APP_ID` | Firebase アプリ ID |
| `VITE_FIREBASE_MEASUREMENT_ID` | Firebase 計測 ID |

# 4 インストール手順

## （1）リポジトリの取得

[こちら](https://github.com/Project-PLATEAU/green-dashboard)から樹木管理ダッシュボードのソースコードをダウンロードします。

```bash
git clone https://github.com/Project-PLATEAU/green-dashboard.git
cd green-dashboard
```

## （2）環境変数の設定

プロジェクトルート直下に `.env` ファイルを作成し、以下の環境変数を設定します。

```dotenv
# アプリケーション名（任意）
VITE_PROJECT_NAME=樹木管理ダッシュボード
VITE_PROJECT_SHORT_NAME=樹木管理

# バックエンドAPIのエンドポイント
VITE_API_ENDPOINT=https://<サーバのホスト名またはIPアドレス>/api

# Firebase 認証情報（3事前準備（4）で控えた値を設定）
VITE_FIREBASE_API_KEY=<Firebaseのapi_key>
VITE_FIREBASE_AUTH_DOMAIN=<Firebaseのauth_domain>
VITE_FIREBASE_PROJECT_ID=<FirebaseのprojectId>
VITE_FIREBASE_STORAGE_BUCKET=<FirebaseのstorageBucket>
VITE_FIREBASE_APP_ID=<FirebaseのappId>
VITE_FIREBASE_MEASUREMENT_ID=<FirebaseのmeasurementId>

# データ暗号化キー（任意。設定するとローカルストレージのデータを暗号化）
# VITE_ENCRYPTION_KEY=<任意の文字列>

# デバッグモード（開発時のみ true に設定）
# VITE_DEBUG=true
```

## （3）依存ライブラリのインストール

```bash
npm install
```

`postinstall` スクリプトにより、以下の処理が自動的に実行されます。

- `src/resources` を `public/resources` へコピー
- `node_modules/cesium/Build/Cesium` を `src/cesium` および `public/cesium` へコピー

## （4）ビルド（本番環境）

```bash
npm run build
```

ビルド成果物は `dist` ディレクトリに出力されます。

## （5）Webサーバへの配置

`dist` ディレクトリの内容を、3（2）で準備したWebサーバのドキュメントルートに配置します。

```bash
# 例：Apache のドキュメントルートへコピー
cp -r dist/* /var/www/html/
```

SPA（シングルページアプリケーション）のため、すべてのリクエストを `index.html` にフォールバックするよう Apache の設定を行います。

```apache
<Directory /var/www/html>
    Options -Indexes
    AllowOverride All
</Directory>
```

`.htaccess` をドキュメントルートに配置します。

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>
```

## （6）開発サーバの起動（開発時のみ）

本番環境へのデプロイではなく、ローカル開発環境での動作確認を行う場合は以下のコマンドを実行します。

```bash
npm run dev
```

デフォルトでは `http://localhost:5173` でアプリケーションが起動します。

# 5 バックエンドAPIの構築

本システムのフロントエンドは、バックエンドAPIと連携して動作します。バックエンドAPIはPostgreSQLデータベースに接続し、樹木台帳データや文書データ、ユーザ情報等を提供します。

## （1）データベースの作成

PostgreSQLに接続し、本システム用のデータベースを作成します。

```sql
CREATE DATABASE green_dashboard ENCODING 'UTF8';
\c green_dashboard
CREATE EXTENSION IF NOT EXISTS postgis;
```

## （2）テーブルの作成

樹木台帳の主要なデータ項目は以下のとおりです。バックエンドAPIの実装に合わせてテーブルを作成してください。

| 属性項目 | フィールド名 | データ型 | 備考 |
| --- | --- | --- | --- |
| 内部ID | id | integer | 主キー |
| 樹木UID | uid | text | ユニーク識別子 |
| 樹木ID | tree_id | text | 管理番号 |
| 路線樹木番号 | route_treenumber | text | |
| 座標（位置情報） | the_geom | geometry(Point, 4326) | PostGIS |
| 樹木タイプ | type | text | 高木 / 中木 など |
| 種名 | name | text | |
| 樹高 (m) | height | float | |
| 幅 (m) | width | float | |
| 延長 (m) | length | float | |
| 幹周 (cm) | circumference | integer | |
| 幹周（複数本） | circumferences | jsonb | |
| 低木種名 | teiboku_names | text[] | |
| 低木幅 (m) | teiboku_width | float | |
| 低木延長 (m) | teiboku_length | float | |
| 写真 | tree_photos | text[] | 画像ファイルパス |
| 外観診断 | ases_visual | text | |
| 腐朽診断 | ases_decay | text | |
| 根鉢診断 | ases_root | text | |
| 総合判定 | ases_comp | text | A / B1 / B2 / C |
| 枯れ状態 | is_dead | boolean | |
| 要プレート発注 | is_need_plate | boolean | |
| メモ | memo | text | |
| 初回登録日時 (UNIX) | date_unix | bigint | |
| 最終更新日時 (UNIX) | updated_at_unix | bigint | |
| 初回登録ユーザUID | registered_user_uid | text | |
| 初回登録ユーザ名 | registered_user_name | text | |
| 初回登録組織UID | registered_user_office_uid | text | |
| 初回登録組織名 | registered_user_office_name | text | |
| 最終更新ユーザUID | updated_user_uid | text | |
| 最終更新ユーザ名 | updated_user_name | text | |
| 最終更新組織UID | updated_user_office_uid | text | |
| 最終更新組織名 | updated_user_office_name | text | |
| 緯度 | latitude | float | |
| 経度 | longitude | float | |

# 6 初期データの投入

本システムの稼働に必要なデータを投入します。

## （1）樹木台帳データの登録

樹木台帳データを PostgreSQL に格納します。

## （2）3D都市モデルデータの登録（Cesium ion）

3D都市モデル（建物モデル・樹木モデル等）を Amazon S3 に格納します。

## （3）ユーザの登録

本システムはFirebase Authentication でユーザ認証を行います。初期ユーザの登録はバックエンドAPI のユーザ管理機能、またはFirebase コンソールから実施してください。

ユーザには以下の権限を付与できます。

| 権限 | 内容 |
| --- | --- |
| Web:Read | Webアプリへのログイン（閲覧のみ） |
| Web:Write | Webアプリへのログイン（編集可能） |
| App:Read | モバイルアプリへのログイン（閲覧のみ） |
| App:Write | モバイルアプリへのログイン（編集可能） |
| Data:Export | データのエクスポート権限 |
| User:Admin | ユーザ管理権限 |

# 7 動作確認

## （1）ブラウザからのアクセス

WebサーバのURLにブラウザからアクセスし、ログイン画面が表示されることを確認します。

```
https://<サーバのホスト名またはIPアドレス>/
```

## （2）ログイン確認

6（3）で登録したユーザのメールアドレスとパスワードでログインできることを確認します。

## （3）地図・樹木台帳の表示確認

ログイン後、地図上に樹木ポイントが表示され、リスト形式での一覧表示ができることを確認します。