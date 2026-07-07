'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const S = require('../static/js/speakers.js');
const PAGE = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/pretalx-speakers.json'), 'utf8'));

// Minimal schedule export: only the fields talkMap consumes.
const SCHEDULE = { schedule: { conference: { days: [
  { rooms: { 'Main Stage': [
    { code: 'VDYEYG', title: 'Nix Vegas Opening Ceremony', url: 'https://cfp.nix.vegas/2026/talk/VDYEYG/' },
    { code: 'AHEHMM', title: 'Running a homelab with NixOS', url: 'https://cfp.nix.vegas/2026/talk/AHEHMM/' }
  ] } },
  { rooms: {} }
] } } };

test('normalizeBio trims and blanks null/whitespace, keeps real text', () => {
  assert.strictEqual(S.normalizeBio(null), '');
  assert.strictEqual(S.normalizeBio(undefined), '');
  assert.strictEqual(S.normalizeBio('   '), '');
  assert.strictEqual(S.normalizeBio('  hi there '), 'hi there');
  assert.strictEqual(S.normalizeBio('.'), '.'); // no content filtering beyond empties
});

test('talkMap indexes scheduled talks by code and tolerates empty/missing input', () => {
  const map = S.talkMap(SCHEDULE);
  assert.deepStrictEqual(map.VDYEYG, { title: 'Nix Vegas Opening Ceremony', url: 'https://cfp.nix.vegas/2026/talk/VDYEYG/' });
  assert.deepStrictEqual(map.AHEHMM, { title: 'Running a homelab with NixOS', url: 'https://cfp.nix.vegas/2026/talk/AHEHMM/' });
  assert.strictEqual(Object.keys(map).length, 2);
  assert.deepStrictEqual(S.talkMap(null), {});
  assert.deepStrictEqual(S.talkMap({}), {});
});

test('buildSpeakersViewModel sorts case-insensitively and joins talks', () => {
  const vm = S.buildSpeakersViewModel(PAGE.results, SCHEDULE);
  assert.deepStrictEqual(vm.map(s => s.name),
    ['Aaron Honeycutt', 'Daniel Baker', 'morgan jones', 'zoe lastalpha']);

  const aaron = vm[0];
  assert.strictEqual(aaron.code, '9HRPTA');
  assert.strictEqual(aaron.bio, 'a computer nerd who happens to use Linux');
  assert.strictEqual(aaron.avatarUrl, 'https://cfp.nix.vegas/media/avatars/B97ED8_bgZVxIc.webp');
  assert.deepStrictEqual(aaron.talks.map(t => t.title), ['Running a homelab with NixOS']);

  const daniel = vm[1];
  assert.strictEqual(daniel.bio, '');            // whitespace bio blanked
  assert.strictEqual(daniel.avatarUrl, null);

  const morgan = vm[2];
  assert.strictEqual(morgan.bio, '.');
  // NOSCHED isn't on the schedule -> contributes no talk row
  assert.deepStrictEqual(morgan.talks.map(t => t.title), ['Nix Vegas Opening Ceremony']);

  assert.deepStrictEqual(vm[3].talks, []);       // only unscheduled submissions
});

test('buildSpeakersViewModel degrades without a schedule (no talk rows)', () => {
  const vm = S.buildSpeakersViewModel(PAGE.results, null);
  assert.strictEqual(vm.length, 4);
  vm.forEach(s => assert.deepStrictEqual(s.talks, []));
});

test('initialLetter uppercases the first character, ? fallback', () => {
  assert.strictEqual(S.initialLetter('aaron'), 'A');
  assert.strictEqual(S.initialLetter('  jb'), 'J');
  assert.strictEqual(S.initialLetter(''), '?');
  assert.strictEqual(S.initialLetter(null), '?');
});

test('safeCfpUrl only accepts https cfp.nix.vegas URLs', () => {
  assert.strictEqual(S.safeCfpUrl('https://cfp.nix.vegas/2026/talk/X/'), true);
  assert.strictEqual(S.safeCfpUrl('http://cfp.nix.vegas/2026/talk/X/'), false);
  assert.strictEqual(S.safeCfpUrl('https://evil.example/https://cfp.nix.vegas/'), false);
  assert.strictEqual(S.safeCfpUrl(null), false);
});

function stubFetch(pages) {
  return function (url) {
    const page = pages[url];
    if (!page) return Promise.resolve({ ok: false, status: 404 });
    return Promise.resolve({ ok: true, json: () => Promise.resolve(page) });
  };
}

test('fetchAllSpeakers follows next links and concatenates results', async () => {
  const pages = {
    'https://x/1': { count: 3, next: 'https://x/2', results: [{ code: 'A' }, { code: 'B' }] },
    'https://x/2': { count: 3, next: null, results: [{ code: 'C' }] }
  };
  const seenOpts = [];
  const stub = stubFetch(pages);
  const res = await S.fetchAllSpeakers(function (url, opts) {
    seenOpts.push(opts);
    return stub(url);
  }, 'https://x/1', 10);
  assert.deepStrictEqual(res.map(r => r.code), ['A', 'B', 'C']);
  seenOpts.forEach(opts => assert.deepStrictEqual(opts, { credentials: 'omit' }));
  assert.strictEqual(seenOpts.length, 2);
});

test('fetchAllSpeakers stops at the page cap and returns what it has', async () => {
  const pages = { 'https://x/loop': { next: 'https://x/loop', results: [{ code: 'X' }] } };
  const res = await S.fetchAllSpeakers(stubFetch(pages), 'https://x/loop', 3);
  assert.strictEqual(res.length, 3);
});

test('fetchAllSpeakers rejects on HTTP error', async () => {
  const f = () => Promise.resolve({ ok: false, status: 500 });
  await assert.rejects(S.fetchAllSpeakers(f, 'https://x/1', 10), /HTTP 500/);
});
