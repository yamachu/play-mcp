import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import type {
  Transport,
  TransportSendOptions,
} from "@modelcontextprotocol/sdk/shared/transport.js";
import {
  JSONRPCMessageSchema,
  type JSONRPCMessage,
} from "@modelcontextprotocol/sdk/types.js";
import { WebSocket as WsWebSocket } from "ws";

export class WebSocketTransport implements Transport {
  #ws: WsWebSocket;
  #_started = false;

  #onMessageBound: (data: WsWebSocket.RawData, isBinary: boolean) => void;
  #onErrorBound: (error: Error) => void;

  constructor(ws: WsWebSocket) {
    this.#ws = ws;
    this.#onMessageBound = this.#_onMessage.bind(this);
    this.#onErrorBound = this.#_onError.bind(this);
  }

  async start(): Promise<void> {
    if (this.#_started) {
      return;
    }
    this.#_started = true;

    this.#ws.on("message", this.#onMessageBound);
    this.#ws.on("error", this.#onErrorBound);
  }

  send(
    message: JSONRPCMessage,
    _options?: TransportSendOptions
  ): Promise<void> {
    const messageJsonStringify = JSON.stringify(message);
    return new Promise((resolve, reject) => {
      this.#ws.send(messageJsonStringify, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  close(): Promise<void> {
    this.#ws.removeListener("message", this.#onMessageBound);
    this.#ws.removeListener("error", this.#onErrorBound);

    return new Promise((resolve) => {
      this.#ws.on("close", () => {
        this.onclose?.();

        resolve();
      });

      this.#ws.close();
    });
  }

  #_onMessage(data: WsWebSocket.RawData, _isBinary: boolean) {
    const message = JSONRPCMessageSchema.parse(
      JSON.parse(data.toString("utf-8"))
    );
    this.onmessage?.(message);
  }
  #_onError(error: Error) {
    this.onerror?.(error);
  }

  onclose?: () => void;
  onerror?: (error: Error) => void;
  onmessage?: (
    message: JSONRPCMessage,
    extra?: { authInfo?: AuthInfo }
  ) => void;
  sessionId?: string;
}
