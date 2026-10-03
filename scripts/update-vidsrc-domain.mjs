#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const PAGE_URL = 'https://vidsrc-domains.me/';
const SOURCES_PATH = fileURLToPath(new URL('../config/sources.json', import.meta.url));
const USER_AGENT = 'Mozilla/5.0 (compatible; streaminal-sources-updater/1.0)';
const CHECK_ONLY = process.argv.includes('--check');

function extractJsonLd(html) {
  const docs = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  for (const match of html.matchAll(re)) {
    try {
      docs.push(JSON.parse(match[1].trim()));
    } catch {}
  }
  return docs;
}

function originOf(url) {
  const match = /^(https?:\/\/[^/]+)/i.exec(url);
  return match ? match[1] : null;
}

function hostOf(url) {
  const origin = originOf(url);
  if (!origin) return null;
  return origin.replace(/^https?:\/\//i, '').toLowerCase();
}

function parseActiveDomains(html) {
  const docs = extractJsonLd(html).flatMap((doc) => (Array.isArray(doc) ? doc : [doc]));
  const list = docs.find(
    (doc) => doc && doc['@type'] === 'ItemList' && /active/i.test(doc.name || '')
  );
  if (list && Array.isArray(list.itemListElement) && list.itemListElement.length > 0) {
    return list.itemListElement
      .slice()
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .map((item) => item.url || item.name)
      .filter(Boolean)
      .map((value) => (/^https?:/i.test(value) ? value : `https://${value}`));
  }

  const fallback = [
    ...html.matchAll(
      /<a[^>]*class=["'][^"']*\bdomain\b[^"']*["'][^>]*href=["'](https?:\/\/[^"']+)["']/gi
    ),
  ].map((match) => match[1]);
  return [...new Set(fallback)];
}

function parseRetiredDomains(html) {
  const spans = [
    ...html.matchAll(/<span[^>]*class=["'][^"']*\bdomain\b[^"']*["'][^>]*>([^<]+)<\/span>/gi),
  ].map((match) => `https://${match[1].trim()}`);
  const copies = [...html.matchAll(/data-copy=["'](https?:\/\/[^"']+)["']/gi)].map(
    (match) => match[1]
  );
  return [...new Set([...spans, ...copies])];
}

function isVidsrcHost(host, knownHosts) {
  return knownHosts.has(host) || /(^|\.)(vidsrc|vsrc)\b/i.test(host);
}

async function main() {
  let html;
  try {
    const response = await fetch(PAGE_URL, {
      headers: { 'user-agent': USER_AGENT },
      redirect: 'follow',
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }
    html = await response.text();
  } catch (error) {
    console.error(`Failed to fetch ${PAGE_URL}: ${error.message}`);
    process.exit(1);
  }

  const activeDomains = parseActiveDomains(html);
  if (activeDomains.length === 0) {
    console.error('Could not parse any active VidSrc domains from the page.');
    process.exit(1);
  }

  const activeHosts = activeDomains.map(hostOf).filter(Boolean);
  const knownHosts = new Set(
    [...activeDomains, ...parseRetiredDomains(html)].map(hostOf).filter(Boolean)
  );
  const topOrigin = originOf(activeDomains[0]);

  let sources;
  try {
    sources = JSON.parse(await readFile(SOURCES_PATH, 'utf8'));
  } catch (error) {
    console.error(`Failed to read ${SOURCES_PATH}: ${error.message}`);
    process.exit(1);
  }

  const changes = [];
  for (const type of ['movie', 'tv']) {
    const list = sources[type];
    if (!Array.isArray(list)) continue;
    for (const entry of list) {
      const host = hostOf(entry.url);
      if (!host || !isVidsrcHost(host, knownHosts)) continue;
      if (activeHosts.includes(host)) continue;
      entry.url = entry.url.replace(/^https?:\/\/[^/]+/i, topOrigin);
      changes.push(`${type}: ${host} -> ${hostOf(topOrigin)}`);
    }
  }

  if (changes.length === 0) {
    console.log(`All VidSrc domains are live (top: ${activeHosts[0]}). No changes.`);
    console.log(`Active domains: ${activeHosts.join(', ')}`);
    return;
  }

  if (CHECK_ONLY) {
    console.error('VidSrc domains are out of date:');
    for (const change of changes) console.error(`  ${change}`);
    process.exit(1);
  }

  await writeFile(SOURCES_PATH, `${JSON.stringify(sources, null, 2)}\n`);
  console.log(`Updated config/sources.json (${changes.length} change(s)):`);
  for (const change of changes) console.log(`  ${change}`);
}

await main();
