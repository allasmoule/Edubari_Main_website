// In-Memory RAM Cache for Pricing Plans & AI Packages
let memoryPlansCache = null;
let memoryPlansTimestamp = 0;

let memoryAiPkgsCache = null;
let memoryAiPkgsTimestamp = 0;

// Cache TTL: 10 minutes (600,000 ms)
const CACHE_TTL_MS = 10 * 60 * 1000;

export function getCachedPlans() {
  if (memoryPlansCache && Date.now() - memoryPlansTimestamp < CACHE_TTL_MS) {
    return memoryPlansCache;
  }
  return null;
}

export function setCachedPlans(plans) {
  memoryPlansCache = plans;
  memoryPlansTimestamp = Date.now();
}

export function invalidatePlansCache() {
  memoryPlansCache = null;
  memoryPlansTimestamp = 0;
}

export function getCachedAiPackages() {
  if (memoryAiPkgsCache && Date.now() - memoryAiPkgsTimestamp < CACHE_TTL_MS) {
    return memoryAiPkgsCache;
  }
  return null;
}

export function setCachedAiPackages(packages) {
  memoryAiPkgsCache = packages;
  memoryAiPkgsTimestamp = Date.now();
}

export function invalidateAiPackagesCache() {
  memoryAiPkgsCache = null;
  memoryAiPkgsTimestamp = 0;
}
