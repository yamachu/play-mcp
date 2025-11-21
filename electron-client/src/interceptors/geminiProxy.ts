import { type FetchInterceptor } from "../interceptor.js";

export const geminiProxyInterceptorAction: (
  proxyUrl: string
) => FetchInterceptor["action"] =
  (proxyUrl: string) =>
  async (resource, options = {}) => {
    let url = resource instanceof Request ? resource.url : resource.toString();
    let method = options.method || "GET";
    let body = options.body;
    let headers = new Headers(options.headers);

    if (resource instanceof Request) {
      url = resource.url;
      method = options.method || resource.method;
      body = options.body || resource.body;

      const mergedHeaders = new Headers(resource.headers);
      headers.forEach((value, key) => {
        mergedHeaders.set(key, value);
      });
      headers = mergedHeaders;
    }

    headers.set("X-ORIGINAL-GEMINI-REQUEST-URL", url);
    headers.set("X-ORIGINAL-GEMINI-REQUEST-METHOD", method);

    return [
      proxyUrl,
      {
        ...options,
        method: "POST",
        headers,
        body: body ?? null,
      },
    ];
  };
