import { HumanMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { loadMcpTools } from "@langchain/mcp-adapters";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const rootDirname = new URL("..", import.meta.url).pathname;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set");
}

const model = new ChatGoogleGenerativeAI({
  apiKey: GEMINI_API_KEY,
  model: "gemini-2.0-flash",
  maxOutputTokens: 1000,
});

const client = new Client({ name: "mcp-stdio-client", version: "1.0.0" });
const transport = new StdioClientTransport({
  command: "make",
  args: ["-C", rootDirname, "run/server"],
});
await client.connect(transport);

const tools = await loadMcpTools("weather", client);

const agent = createReactAgent({ llm: model, tools });

const agentResponse = await agent.invoke({
  messages: [new HumanMessage("東京の天気を教えて")],
});

console.log(agentResponse);
