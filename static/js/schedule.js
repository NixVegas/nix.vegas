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

  function speakerNames(persons) {
    return (persons || []).map(function (p) { return p.public_name || p.name; }).filter(Boolean);
  }

  function pickBody(talk) {
    if (talk.description && talk.description.trim()) return talk.description;
    return talk.abstract || '';
  }

  function trackColorMap(conference) {
    var map = {};
    (conference.tracks || []).forEach(function (t) { map[t.name] = t.color; });
    return map;
  }

  function buildViewModel(json, tz) {
    var conf = json.schedule.conference;
    var colors = trackColorMap(conf);
    var days = [];

    (conf.days || []).forEach(function (day) {
      var roomEntries = Object.keys(day.rooms || {})
        .map(function (name) { return [name, day.rooms[name]]; })
        .filter(function (e) { return e[1] && e[1].length > 0; });
      if (roomEntries.length === 0) return; // skip empty day

      var rooms = roomEntries.map(function (e) {
        var name = e[0];
        var talks = e[1].slice().sort(function (a, b) { return new Date(a.date) - new Date(b.date); });
        return {
          name: name,
          sessions: talks.map(function (t) {
            var startInstant = new Date(t.date);
            var endInstant = computeEnd(t.date, t.duration);
            return {
              code: t.code,
              title: t.title,
              url: t.url,
              room: t.room || name,
              track: t.track || null,
              trackColor: colors[t.track] || null,
              speakers: speakerNames(t.persons),
              body: pickBody(t),
              startInstant: startInstant,
              endInstant: endInstant,
              start: formatTime(startInstant, tz),
              end: formatTime(endInstant, tz),
              isLive: false,
              isNext: false
            };
          })
        };
      });

      var allSessions = rooms.reduce(function (acc, r) { return acc.concat(r.sessions); }, [])
        .sort(function (a, b) { return a.startInstant - b.startInstant; });

      days.push({
        label: formatDayLabel(allSessions[0].startInstant, tz),
        dateKey: dateKey(allSessions[0].startInstant, tz),
        multiRoom: rooms.length > 1,
        roomName: rooms.length === 1 ? rooms[0].name : null,
        rooms: rooms,
        sessions: allSessions
      });
    });

    var tracks = {};
    days.forEach(function (d) { d.sessions.forEach(function (s) { if (s.track) tracks[s.track] = true; }); });

    // `tz` is carried on the view model so default-day selection (Task 5) keys `now`
    // into the same display zone the day labels were built in.
    return { showTrackChips: Object.keys(tracks).length > 1, days: days, tz: tz };
  }

  // ---- Node export (browser leaves `module` undefined) ----
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      parseDurationMinutes, computeEnd, formatTime, formatDayLabel, dateKey,
      speakerNames, pickBody, trackColorMap, buildViewModel
    };
  }
})();
