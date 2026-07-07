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

  // ---- browser-only rendering ----

  var MAX_PAGES = 10;

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

  function showLoading(root) {
    clear(root);
    root.appendChild(el('div', 'pspk-loading', 'Loading speakers…'));
  }

  function showEmpty(root) {
    clear(root);
    var box = el('div', 'pspk-empty');
    box.appendChild(el('h2', null, 'Coming soon'));
    box.appendChild(el('p', null, 'Speakers are still being announced. Check back closer to the conference.'));
    root.appendChild(box);
  }

  function showError(root, publicUrl) {
    clear(root);
    var box = el('div', 'pspk-error');
    box.appendChild(el('h2', null, 'Speakers unavailable'));
    var p = el('p', null, "We couldn't load the speaker list right now. ");
    var a = el('a', null, 'View the speaker list on pretalx ↗');
    a.setAttribute('href', publicUrl);
    a.setAttribute('rel', 'noopener');
    p.appendChild(a);
    box.appendChild(p);
    root.appendChild(box);
  }

  function renderCard(s, publicUrl) {
    var card = el('div', 'pspk-card');

    if (s.avatarUrl && safeCfpUrl(s.avatarUrl)) {
      var img = el('img', 'pspk-avatar');
      img.setAttribute('src', s.avatarUrl);
      img.setAttribute('alt', s.name);
      img.setAttribute('loading', 'lazy');
      card.appendChild(img);
    } else {
      var ph = el('div', 'pspk-avatar pspk-avatar-placeholder', initialLetter(s.name));
      ph.setAttribute('aria-hidden', 'true');
      card.appendChild(ph);
    }

    // Profile URL is constructed from the trusted base + the speaker code
    // (never taken from fetched data), per the spec's security rules.
    var name = el('a', 'pspk-name', s.name);
    name.setAttribute('href', publicUrl + encodeURIComponent(s.code) + '/');
    name.setAttribute('rel', 'noopener');
    card.appendChild(name);

    if (s.bio) card.appendChild(el('p', 'pspk-bio', s.bio));

    if (s.talks.length) {
      var list = el('ul', 'pspk-talks');
      s.talks.forEach(function (t) {
        var li = el('li', 'pspk-talk');
        if (safeCfpUrl(t.url)) {
          var a = el('a', null, t.title);
          a.setAttribute('href', t.url);
          a.setAttribute('rel', 'noopener');
          li.appendChild(a);
        } else {
          li.textContent = t.title;
        }
        list.appendChild(li);
      });
      card.appendChild(list);
    }

    return card;
  }

  function renderSpeakers(root, speakers, publicUrl) {
    clear(root);
    var grid = el('div', 'pspk-grid');
    speakers.forEach(function (s) { grid.appendChild(renderCard(s, publicUrl)); });
    root.appendChild(grid);
  }

  function init() {
    var root = document.querySelector('.pretalx-speakers[data-speakers-url]');
    if (!root) return;
    var speakersUrl = root.getAttribute('data-speakers-url');
    var scheduleUrl = root.getAttribute('data-schedule-url');
    var publicUrl = root.getAttribute('data-public-url');

    showLoading(root);
    var speakersP = fetchAllSpeakers(window.fetch.bind(window), speakersUrl, MAX_PAGES);
    var scheduleP = fetch(scheduleUrl, { credentials: 'omit' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .catch(function () { return null; }); // degrade: cards render without talk rows

    Promise.all([speakersP, scheduleP])
      .then(function (res) {
        var speakers = buildSpeakersViewModel(res[0], res[1]);
        if (!speakers.length) { showEmpty(root); return; }
        renderSpeakers(root, speakers, publicUrl);
      })
      .catch(function () { showError(root, publicUrl); });
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
  }

  // ---- Node export (browser leaves `module` undefined) ----
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      normalizeBio, talkMap, buildSpeakersViewModel,
      initialLetter, safeCfpUrl, fetchAllSpeakers
    };
  }
})();
