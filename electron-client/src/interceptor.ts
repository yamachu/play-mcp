export type FetchInterceptor = {
  urlPattern: string;
  action: (
    ...args: Parameters<typeof fetch>
  ) => Promise<Parameters<typeof fetch>>;
};

const originalFetch = global.fetch;
const _interceptors: FetchInterceptor[] = [];

export const registerFetchInterceptor = (interceptors: FetchInterceptor[]) => {
  _interceptors.splice(0);
  _interceptors.push(...interceptors);

  global.fetch = async function (resource, options = {}) {
    const url =
      resource instanceof Request ? resource.url : resource.toString();

    const interceptor = _interceptors.find(
      (interceptor) => url.match(interceptor.urlPattern) !== null
    );
    if (interceptor === undefined) {
      return originalFetch(resource, options);
    }

    const [r, o] = await interceptor.action(resource, options);

    return originalFetch(r, o);
  };

  return () => {
    _interceptors.splice(0);
    global.fetch = originalFetch;
  };
};
