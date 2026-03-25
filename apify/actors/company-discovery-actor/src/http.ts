import { gotScraping } from 'got-scraping';

export interface FetchOptions {
  url: string;
  proxyUrl?: string;
  headers?: Record<string, string>;
}

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchPage(opts: FetchOptions, retries = 2): Promise<string | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await gotScraping({
        url: opts.url,
        proxyUrl: opts.proxyUrl,
        headers: opts.headers,
        headerGeneratorOptions: {
          browsers: ['chrome'],
          operatingSystems: ['macos', 'windows'],
          locales: ['en-US', 'de-DE'],
        },
        timeout: { request: 30_000 },
        followRedirect: true,
      });

      if (response.statusCode === 200) return response.body;

      if (response.statusCode === 429 || response.statusCode >= 500) {
        console.warn(`HTTP ${response.statusCode} for ${opts.url}, attempt ${attempt + 1}`);
        await sleep(5000 * (attempt + 1));
        continue;
      }

      console.warn(`HTTP ${response.statusCode} for ${opts.url}`);
      return null;
    } catch (err) {
      console.warn(`Fetch error (attempt ${attempt + 1}) for ${opts.url}: ${err}`);
      if (attempt < retries) await sleep(3000 * (attempt + 1));
    }
  }
  return null;
}
