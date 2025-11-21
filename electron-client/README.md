# Electron MCP Client

このプロジェクトは、Electronアプリケーションとして動作するMCPクライアントのサンプルです。
ローカルにGeminiAPIキーを持たせずに、https://github.com/yamachu/play-n8n/tree/main/custom/n8n-nodes-gemini-repeater を利用して、n8n上でGemini APIキーを管理し、Electronクライアントからは当該Proxy経由でGemini APIを利用する形を取っています。

APIキーをクライアント側に持たせずに、非エンジニアでも任意のMCPサーバーに接続できる状態を実現することを目的としています。

## 注意

必ずProxyへの認証を何かしら行うようにしてください。
このサンプルでは認証を行っていませんが、実際の運用ではProxyが不特定多数に利用されないように注意してください。
