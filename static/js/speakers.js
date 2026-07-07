/* Nix Vegas speakers renderer — fetches the pretalx speakers API and renders a
   card grid. Single classic script (no bundler/imports). Pure functions are
   exported for Node unit tests; browser bootstrap runs only when a document is
   present. */
(function () {
  'use strict';

  // ---- pure helpers ----

  function normalizeBio(biography) {
    if (typeof biography !== 'string') return '';
    return biography.trim();
  }

  function talkMap(scheduleJson) {
    var map = {};
    var conf = scheduleJson && scheduleJson.schedule && scheduleJson.schedule.conference;
    ((conf && conf.days) || []).forEach(function (day) {
      var rooms = day.rooms || {};
      Object.keys(rooms).forEach(function (roomName) {
        (rooms[roomName] || []).forEach(function (t) {
          if (t.code) map[t.code] = { title: t.title, url: t.url };
        });
      });
    });
    return map;
  }

  function buildSpeakersViewModel(results, scheduleJson) {
    var talks = talkMap(scheduleJson);
    var speakers = (results || []).map(function (s) {
      return {
        code: s.code,
        name: s.name || '',
        bio: normalizeBio(s.biography),
        avatarUrl: typeof s.avatar_url === 'string' ? s.avatar_url : null,
        talks: (s.submissions || [])
          .map(function (c) { return talks[c]; })
          .filter(Boolean)
      };
    });
    speakers.sort(function (a, b) {
      return a.name.localeCompare(b.name, 'en', { sensitivity: 'base' });
    });
    return speakers;
  }

  function initialLetter(name) {
    var t = String(name || '').trim();
    return t ? t.charAt(0).toUpperCase() : '?';
  }

  function safeCfpUrl(url) {
    return typeof url === 'string' && url.indexOf('https://cfp.nix.vegas/') === 0;
  }

  // Follow the API's `next` links, hard-capped as a runaway guard; the page
  // renders whatever was fetched if the cap is ever hit. `fetchFn` is injected
  // so tests can stub the network.
  function fetchAllSpeakers(fetchFn, url, maxPages) {
    var results = [];
    var pages = 0;
    function step(u) {
      pages += 1;
      return fetchFn(u, { credentials: 'omit' })
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (json) {
          results = results.concat(json.results || []);
          if (json.next && pages < maxPages) return step(json.next);
          return results;
        });
    }
    return step(url);
  }

  // ---- Node export (browser leaves `module` undefined) ----
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      normalizeBio, talkMap, buildSpeakersViewModel,
      initialLetter, safeCfpUrl, fetchAllSpeakers
    };
  }
})();
