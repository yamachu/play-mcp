import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";

// see: https://weather.tsukumijima.net/
const WEATHER_API = "https://weather.tsukumijima.net/api/forecast";
// > テストアプリや開発用途以外で利用される場合は独自のユーザーエージェント（例・WeatherApp/1.0）を設定してください。
// とのことなので、とりあえず何者であるか名乗る
const USER_AGENT =
  "weather-mcp-sample/1.0.0 (+https://github.com/yamachu/play-mcp)";

export async function setupWeatherMCPServer(): Promise<Client> {
  const server = new McpServer({
    name: "weather-server",
    version: "1.0.0",
  });

  server.registerTool(
    "fetch_weather",
    {
      inputSchema: {
        city: z
          .number()
          .describe("The number of the city_tag to fetch weather for."),
      },
      outputSchema: {
        temperatureMax: z.string().describe("Maximum temperature in Celsius."),
        temperatureMin: z.string().describe("Minimum temperature in Celsius."),
        condition: z
          .string()
          .describe("Weather condition (e.g., sunny, rainy)."),
      },
    },
    async ({ city }) => {
      const response = await fetch(`${WEATHER_API}?city=${city}`, {
        headers: {
          "User-Agent": USER_AGENT,
        },
      });
      const weatherJson = await response.json();

      const todayWeather = weatherJson.forecasts.find(
        (v: any) => v.dateLabel === "今日"
      );

      const weather = todayWeather.telop;
      const tempMax = todayWeather.temperature.max.celsius;
      const tempMin = todayWeather.temperature.min.celsius;

      return {
        content: [
          {
            type: "text",
            text: `The weather in city ${city} today is ${weather} with a high of ${tempMax}°C and a low of ${tempMin}°C.`,
          },
        ],
        structuredContent: {
          temperatureMax: tempMax ?? "N/A",
          temperatureMin: tempMin ?? "N/A",
          condition: weather,
        },
      };
    }
  );

  const transports = InMemoryTransport.createLinkedPair();
  await server.connect(transports[0]);

  const client = new Client({
    name: "weather",
    version: "1.0.0",
  });
  client.connect(transports[1]);

  return client;
}
