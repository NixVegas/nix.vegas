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

  function annotateLiveNext(vm, now) {
    var nowMs = now.getTime();
    vm.days.forEach(function (day) {
      day.sessions.forEach(function (s) {
        s.isLive = s.startInstant.getTime() <= nowMs && nowMs < s.endInstant.getTime();
        s.isNext = false;
      });
      for (var i = 0; i < day.sessions.length; i++) {
        if (day.sessions[i].startInstant.getTime() > nowMs) { day.sessions[i].isNext = true; break; }
      }
    });
    return vm;
  }

  function pickDefaultDayIndex(vm, now) {
    if (!vm.days.length) return 0;
    var nowKey = dateKey(now, vm.tz);
    for (var i = 0; i < vm.days.length; i++) {
      if (vm.days[i].dateKey === nowKey) return i;        // today matches a scheduled day
    }
    for (var j = 0; j < vm.days.length; j++) {
      if (vm.days[j].dateKey >= nowKey) return j;          // else first upcoming day
    }
    return 0;                                              // else (event passed) first day
  }

  // ---- browser-only rendering ----

  var CLAMP_CHARS = 120; // proxy for "abstract overflows ~2 lines" -> show Details link

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

  function safeTalkLink(url) {
    return typeof url === 'string' && url.indexOf('https://cfp.nix.vegas/') === 0;
  }

  function showLoading(root) {
    clear(root);
    root.appendChild(el('div', 'ps-loading', 'Loading schedule…'));
  }

  function showEmpty(root) {
    clear(root);
    var box = el('div', 'ps-empty');
    box.appendChild(el('h2', null, 'Coming soon'));
    box.appendChild(el('p', null, "The schedule isn't published yet. Check back closer to the conference."));
    root.appendChild(box);
  }

  function showError(root, publicUrl) {
    clear(root);
    var box = el('div', 'ps-error');
    box.appendChild(el('h2', null, 'Schedule unavailable'));
    var p = el('p', null, "We couldn't load the live schedule right now. ");
    var a = el('a', null, 'View the static schedule on pretalx ↗');
    a.setAttribute('href', publicUrl);
    a.setAttribute('rel', 'noopener');
    p.appendChild(a);
    box.appendChild(p);
    root.appendChild(box);
  }

  function renderCard(s, day, showTrackChips) {
    var card = el('div', 'ps-card' + (s.isLive ? ' is-live' : '') + (s.isNext ? ' is-next' : ''));

    var time = el('div', 'ps-time');
    time.appendChild(el('b', 'ps-start', s.start));
    time.appendChild(el('span', 'ps-end', '– ' + s.end));
    time.appendChild(el('span', 'ps-dur', durationLabel(s)));
    card.appendChild(time);

    var info = el('div', 'ps-info');

    var flags = el('div', 'ps-flags');
    if (s.isLive) flags.appendChild(el('span', 'ps-flag is-live', 'LIVE'));
    else if (s.isNext) flags.appendChild(el('span', 'ps-flag is-next', 'UP NEXT'));
    if (day.multiRoom) flags.appendChild(el('span', 'ps-room', s.room));
    if (showTrackChips && s.track) {
      var chip = el('span', 'ps-track', s.track);
      if (s.trackColor) chip.style.backgroundColor = s.trackColor;
      flags.appendChild(chip);
    }
    if (flags.childNodes.length) info.appendChild(flags);

    if (safeTalkLink(s.url)) {
      var title = el('a', 'ps-title', s.title);
      title.setAttribute('href', s.url);
      title.setAttribute('rel', 'noopener');
      info.appendChild(title);
    } else {
      info.appendChild(el('div', 'ps-title', s.title));
    }

    if (s.body) {
      info.appendChild(el('p', 'ps-abstract', s.body));
      if (s.body.length > CLAMP_CHARS && safeTalkLink(s.url)) {
        var det = el('a', 'ps-details', 'Details ↗');
        det.setAttribute('href', s.url);
        det.setAttribute('rel', 'noopener');
        info.appendChild(det);
      }
    }

    if (s.speakers.length) {
      info.appendChild(el('div', 'ps-speakers', s.speakers.join(', ')));
    }

    card.appendChild(info);
    return card;
  }

  function durationLabel(s) {
    var mins = Math.round((s.endInstant.getTime() - s.startInstant.getTime()) / 60000);
    return mins + ' min';
  }

  function renderSchedule(root, vm) {
    clear(root);
    var activeIndex = pickDefaultDayIndex(vm, new Date());

    var tabs = el('div', 'ps-tabs');
    tabs.setAttribute('role', 'tablist');
    var panels = [];

    vm.days.forEach(function (day, i) {
      var tab = el('button', 'ps-tab' + (i === activeIndex ? ' is-active' : ''));
      tab.setAttribute('type', 'button');
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', i === activeIndex ? 'true' : 'false');
      var parts = day.label.split(', ');
      tab.appendChild(el('b', null, parts[0]));        // weekday
      tab.appendChild(document.createTextNode(parts[1] || day.label)); // "Month D"
      tab.addEventListener('click', function () { activate(i); });
      tabs.appendChild(tab);

      var panel = el('section', 'ps-day' + (i === activeIndex ? ' is-active' : ''));
      panel.setAttribute('role', 'tabpanel');
      if (i !== activeIndex) panel.setAttribute('hidden', '');

      var metaText = day.sessions.length + (day.sessions.length === 1 ? ' session' : ' sessions');
      if (day.roomName) metaText += ' · ' + day.roomName;
      metaText += ' · all times Pacific';
      panel.appendChild(el('div', 'ps-daymeta', metaText));

      day.sessions.forEach(function (s) { panel.appendChild(renderCard(s, day, vm.showTrackChips)); });
      panels.push(panel);
    });

    function activate(idx) {
      var tabEls = tabs.querySelectorAll('.ps-tab');
      for (var i = 0; i < tabEls.length; i++) {
        var on = i === idx;
        tabEls[i].classList.toggle('is-active', on);
        tabEls[i].setAttribute('aria-selected', on ? 'true' : 'false');
        panels[i].classList.toggle('is-active', on);
        if (on) panels[i].removeAttribute('hidden'); else panels[i].setAttribute('hidden', '');
      }
    }

    root.appendChild(tabs);
    panels.forEach(function (p) { root.appendChild(p); });
  }

  function init() {
    var root = document.querySelector('.pretalx-schedule[data-schedule-url]');
    if (!root) return;
    var url = root.getAttribute('data-schedule-url');
    var tz = root.getAttribute('data-timezone') || 'America/Los_Angeles';
    var publicUrl = root.getAttribute('data-public-url') || url;

    showLoading(root);
    fetch(url, { credentials: 'omit' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (json) {
        var vm = annotateLiveNext(buildViewModel(json, tz), new Date());
        if (!vm.days.length) { showEmpty(root); return; }
        renderSchedule(root, vm);
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
      parseDurationMinutes, computeEnd, formatTime, formatDayLabel, dateKey,
      speakerNames, pickBody, trackColorMap, buildViewModel,
      annotateLiveNext, pickDefaultDayIndex
    };
  }
})();
