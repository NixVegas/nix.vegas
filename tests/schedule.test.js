'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const S = require('../static/js/schedule.js');

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
