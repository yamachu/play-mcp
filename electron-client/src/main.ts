import {
  FunctionCallingConfigMode,
  GoogleGenAI,
  mcpToTool,
} from "@google/genai";
import { app, BrowserWindow } from "electron";

import { registerFetchInterceptor } from "./interceptor.js";
import { geminiProxyInterceptorAction } from "./interceptors/geminiProxy.js";
import { setupWeatherMCPServer } from "./mcp/weatherServer.js";

const ai = new GoogleGenAI({
  apiKey: "__DUMMY__" /* RemoteのAPI_KEYを参照するので */,
});

const _cleanup = registerFetchInterceptor([
  {
    urlPattern: "https://generativelanguage.googleapis.com/*",
    // TODO: sessionからJWTとかを取得して、適切な認証を行えるように
    action: geminiProxyInterceptorAction("REPLACE_WITH_YOUR_GEMINI_PROXY_URL"),
  },
]);

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    title: "Main window",
  });

  const weatherClient = await setupWeatherMCPServer();

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents:
      "weatherを使って天気を教えて。東京は130010です。結果を日本語で答えて、その天気についての感想をユーモアたっぷりに述べて。",
    config: {
      maxOutputTokens: 10000,
      tools: [mcpToTool(weatherClient)],
      toolConfig: {
        functionCallingConfig: {
          mode: FunctionCallingConfigMode.AUTO,
        },
      },
    },
  });

  console.log(response.text);

  win.show();
});
