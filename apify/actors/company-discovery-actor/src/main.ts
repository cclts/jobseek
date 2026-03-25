/**
 * @actor company-discovery-actor
 *
 * Discovers companies with open positions by scraping top job aggregator sites:
 *   1. Indeed    — Company search directory
 *   2. LinkedIn  — Public guest job search API
 *   3. Glassdoor — Employer browse directory
 *   4. StepStone — DACH market job listings
 *   5. Xing      — DACH market professional network
 *
 * Output: CompanyDiscovery[] → { company_name, job_board_url, estimated_jobs, source }
 *
 * Each source runs independently with isolated error handling so one failure
 * doesn't block the others. Results are deduplicated by normalised company name.
 */

import { Actor, log } from 'apify';
import type { CompanyDiscovery } from './types.js';
import { discoverFromIndeed } from './sources/indeed.js';
import { discoverFromLinkedIn } from './sources/linkedin.js';
import { discoverFromGlassdoor } from './sources/glassdoor.js';
import { discoverFromStepstone } from './sources/stepstone.js';
import { discoverFromXing } from './sources/xing.js';

interface Input {
  maxCompaniesPerSource?: number;
  sources?: string[];
  searchQueries?: string[];
  useProxy?: boolean;
}

await Actor.init();

const input = (await Actor.getInput<Input>()) ?? {};
const {
  maxCompaniesPerSource = 400,
  sources = ['indeed', 'linkedin', 'glassdoor', 'stepstone', 'xing'],
  searchQueries = [],
  useProxy = true,
} = input;

log.info('Starting company-discovery-actor', {
  maxCompaniesPerSource,
  sources,
  customQueries: searchQueries.length,
  useProxy,
});

// Configure proxy
let proxyUrl: string | undefined;
if (useProxy) {
  try {
    const proxyConfig = await Actor.createProxyConfiguration({
      groups: ['RESIDENTIAL'],
    });
    proxyUrl = await proxyConfig.newUrl();
    log.info('Proxy configured successfully');
  } catch (err) {
    log.warning(`Proxy setup failed, running without proxy: ${err}`);
  }
}

const allCompanies: CompanyDiscovery[] = [];
const globalSeen = new Set<string>();

type SourceFn = (proxyUrl?: string, max?: number, queries?: string[]) => Promise<CompanyDiscovery[]>;

const sourceMap: Record<string, SourceFn> = {
  indeed: discoverFromIndeed,
  linkedin: discoverFromLinkedIn,
  glassdoor: (p, m) => discoverFromGlassdoor(p, m),
  stepstone: discoverFromStepstone,
  xing: discoverFromXing,
};

const sourceStats: Record<string, { total: number; unique: number; error?: string }> = {};

// Run each source sequentially to manage memory and rate limits
for (const source of sources) {
  const runner = sourceMap[source];
  if (!runner) {
    log.warning(`Unknown source "${source}", skipping`);
    continue;
  }

  log.info(`--- Running source: ${source} ---`);
  const startTime = Date.now();

  try {
    const companies = await runner(
      proxyUrl,
      maxCompaniesPerSource,
      searchQueries.length > 0 ? searchQueries : undefined,
    );

    let unique = 0;
    for (const company of companies) {
      const key = company.company_name.toLowerCase().trim();
      if (!globalSeen.has(key)) {
        globalSeen.add(key);
        allCompanies.push(company);
        unique++;
      }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    sourceStats[source] = { total: companies.length, unique };
    log.info(`${source}: ${companies.length} found, ${unique} unique new (${elapsed}s) — running total: ${allCompanies.length}`);
  } catch (err) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    sourceStats[source] = { total: 0, unique: 0, error: String(err) };
    log.error(`${source} failed after ${elapsed}s: ${err}`);
  }
}

// Push all results to default dataset
log.info(`Pushing ${allCompanies.length} unique companies to dataset...`);
await Actor.pushData(allCompanies);

// Summary
log.info('=== Discovery Summary ===');
log.info(`Total unique companies: ${allCompanies.length}`);
for (const [source, stats] of Object.entries(sourceStats)) {
  if (stats.error) {
    log.info(`  ${source}: FAILED — ${stats.error}`);
  } else {
    log.info(`  ${source}: ${stats.total} found, ${stats.unique} unique new`);
  }
}

// Source breakdown
const bySource = new Map<string, number>();
for (const c of allCompanies) {
  bySource.set(c.source, (bySource.get(c.source) || 0) + 1);
}
log.info('Breakdown by source:');
for (const [source, count] of bySource) {
  log.info(`  ${source}: ${count}`);
}

await Actor.exit();
