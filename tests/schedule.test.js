'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const S = require('../static/js/schedule.js');
const FIXTURE = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/pretalx-schedule.json'), 'utf8'));
const TZ = 'America/Los_Angeles';

test('parseDurationMinutes parses HH:MM', () => {
  assert.strictEqual(S.parseDurationMinutes('00:30'), 30);
  assert.strictEqual(S.parseDurationMinutes('01:00'), 60);
  assert.strictEqual(S.parseDurationMinutes('00:45'), 45);
  assert.strictEqual(S.parseDurationMinutes('01:30'), 90);
});

test('computeEnd adds the duration to the start instant', () => {
  const end = S.computeEnd('2026-08-07T10:00:00-07:00', '00:30');
  assert.strictEqual(end.toISOString(), new Date('2026-08-07T10:30:00-07:00').toISOString());
  const end2 = S.computeEnd('2026-08-07T12:00:00-07:00', '01:00');
  assert.strictEqual(end2.toISOString(), new Date('2026-08-07T13:00:00-07:00').toISOString());
});

test('formatTime renders 24h time in the given zone', () => {
  assert.strictEqual(S.formatTime(new Date('2026-08-07T10:00:00-07:00'), 'America/Los_Angeles'), '10:00');
  // An instant given in UTC still renders in Pacific (the day-label/time pitfall):
  assert.strictEqual(S.formatTime(new Date('2026-08-07T17:00:00Z'), 'America/Los_Angeles'), '10:00');
});

test('formatDayLabel renders weekday/month/day in the given zone', () => {
  assert.strictEqual(S.formatDayLabel(new Date('2026-08-07T10:00:00-07:00'), 'America/Los_Angeles'), 'Friday, August 7');
  assert.strictEqual(S.formatDayLabel(new Date('2026-08-08T13:00:00-07:00'), 'America/Los_Angeles'), 'Saturday, August 8');
});

test('dateKey returns ISO-ordered Y-M-D in the given zone', () => {
  assert.strictEqual(S.dateKey(new Date('2026-08-07T10:00:00-07:00'), 'America/Los_Angeles'), '2026-08-07');
});

test('speakerNames prefers public_name, falls back to name, drops empties', () => {
  assert.deepStrictEqual(S.speakerNames([{ public_name: 'Jane Hacker', name: 'x' }, { name: 'Sam Builder' }]), ['Jane Hacker', 'Sam Builder']);
  assert.deepStrictEqual(S.speakerNames([]), []);
  assert.deepStrictEqual(S.speakerNames(undefined), []);
});

test('pickBody prefers description, falls back to abstract', () => {
  assert.strictEqual(S.pickBody({ description: 'D', abstract: 'A' }), 'D');
  assert.strictEqual(S.pickBody({ description: null, abstract: 'A' }), 'A');
  assert.strictEqual(S.pickBody({ description: '   ', abstract: 'A' }), 'A');
});

test('buildViewModel skips empty days and builds days/sessions', () => {
  const vm = S.buildViewModel(FIXTURE, TZ);
  assert.strictEqual(vm.days.length, 2);                 // Aug 6 (empty) skipped
  assert.strictEqual(vm.showTrackChips, true);           // Events + Talks + Projects

  const d0 = vm.days[0];
  assert.strictEqual(d0.label, 'Friday, August 7');
  assert.strictEqual(d0.multiRoom, false);
  assert.strictEqual(d0.roomName, 'Main Stage');
  assert.strictEqual(d0.sessions.length, 2);
  assert.strictEqual(d0.sessions[0].start, '10:00');
  assert.strictEqual(d0.sessions[0].end, '10:30');
  assert.strictEqual(d0.sessions[0].track, 'Events');
  assert.strictEqual(d0.sessions[0].trackColor, '#aa1d1d');
  assert.deepStrictEqual(d0.sessions[0].speakers, []);
  assert.strictEqual(d0.sessions[0].body, 'Kickoff and opening of the Nix Vegas space.');
  assert.strictEqual(d0.sessions[1].start, '12:00');
  assert.strictEqual(d0.sessions[1].end, '13:00');
  assert.strictEqual(d0.sessions[1].trackColor, '#426c76');
  assert.deepStrictEqual(d0.sessions[1].speakers, ['Jane Hacker', 'Alex Nixon']);
  assert.strictEqual(d0.sessions[1].body, 'Full description here.');

  const d1 = vm.days[1];
  assert.strictEqual(d1.label, 'Saturday, August 8');
  assert.strictEqual(d1.multiRoom, true);
  assert.strictEqual(d1.roomName, null);
  assert.strictEqual(d1.sessions.length, 2);
  assert.strictEqual(d1.sessions[0].room, 'Main Stage');
  assert.deepStrictEqual(d1.sessions[0].speakers, ['Sam Builder']);
  assert.strictEqual(d1.sessions[1].room, 'Community Stage');
  assert.strictEqual(d1.sessions[1].start, '13:30');
  assert.strictEqual(d1.sessions[1].end, '14:15');
});
