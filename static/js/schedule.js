/* Nix Vegas schedule renderer — fetches the pretalx schedule export and renders it.
   Single classic script (no bundler/imports). Pure functions are exported for Node
   unit tests; browser bootstrap runs only when a document is present. */
(function () {
  'use strict';

  // ---- pure helpers ----

  function parseDurationMinutes(hhmm) {
    const parts = String(hhmm).split(':');
    const h = Number(parts[0]);
    const m = Number(parts[1]);
    return h * 60 + m;
  }

  function computeEnd(startISO, durationHHMM) {
    const start = new Date(startISO);
    return new Date(start.getTime() + parseDurationMinutes(durationHHMM) * 60000);
  }

  function formatTime(date, tz) {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).format(date);
  }

  function formatDayLabel(date, tz) {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: tz, weekday: 'long', month: 'long', day: 'numeric'
    }).format(date);
  }

  function dateKey(date, tz) {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(date);
  }

  // ---- Node export (browser leaves `module` undefined) ----
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { parseDurationMinutes, computeEnd, formatTime, formatDayLabel, dateKey };
  }
})();
