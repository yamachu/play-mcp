import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import type {
  Transport,
  TransportSendOptions,
} from "@modelcontextprotocol/sdk/shared/transport.js";
import {
  JSONRPCMessageSchema,
  type JSONRPCMessage,
} from "@modelcontextprotocol/sdk/types.js";

type ErrorEvent = Parameters<NonNullable<WebSocket["onerror"]>>[0];

export class WebSocketTransport implements Transport {
  #ws: WebSocket;
  #_started = false;

  #onMessageBound: (event: MessageEvent) => void;
  #onErrorBound: (error: ErrorEvent) => void;

  constructor(ws: WebSocket) {
    this.#ws = ws;
    this.#onMessageBound = this.#_onMessage.bind(this);
    this.#onErrorBound = this.#_onError.bind(this);
  }

  async start(): Promise<void> {
    if (this.#_started) {
      return;
    }
    this.#_started = true;

    this.#ws.addEventListener("message", this.#onMessageBound);
    this.#ws.addEventListener("error", this.#onErrorBound);
  }

  send(
    message: JSONRPCMessage,
    _options?: TransportSendOptions
  ): Promise<void> {
    const messageJsonStringify = JSON.stringify(message);
    return new Promise((resolve) => {
      this.#ws.send(messageJsonStringify);
      resolve();
    });
  }

  close(): Promise<void> {
    this.#ws.removeEventListener("message", this.#onMessageBound);
    this.#ws.removeEventListener("error", this.#onErrorBound);

    return new Promise((resolve) => {
      this.#ws.addEventListener(
        "close",
        () => {
          this.onclose?.();

          resolve();
        },
        { once: true }
      );

      this.#ws.close();
    });
  }

  #_onMessage(event: MessageEvent) {
    const message = JSONRPCMessageSchema.parse(
      JSON.parse(event.data.toString("utf-8"))
    );
    this.onmessage?.(message);
  }
  #_onError(event: ErrorEvent) {
    this.onerror?.(
      event.error !== undefined
        ? event.error
        : new Error(`WebSocket error: ${JSON.stringify(event)}`)
    );
  }

  onclose?: () => void;
  onerror?: (error: Error) => void;
  onmessage?: (
    message: JSONRPCMessage,
    extra?: { authInfo?: AuthInfo }
  ) => void;
  sessionId?: string;
}
