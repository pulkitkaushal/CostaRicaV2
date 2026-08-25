/* ============================================================
   La Fortuna Trip Companion — v2
   Vanilla JS. No framework, no service worker, no backend.
   ============================================================ */

/* ---------- storage ---------- */
const KEY = 'lf2.';
const store = {
  get(k, d) { try { const v = localStorage.getItem(KEY + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(KEY + k, JSON.stringify(v)); } catch {} },
  clear() { Object.keys(localStorage).filter(k => k.startsWith(KEY)).forEach(k => localStorage.removeItem(k)); }
};
let DONE    = store.get('done', {});
let BOOKING = store.get('booking', {});
let PACKED  = store.get('packed', {});

/* ---------- time (always Costa Rica local) ---------- */
const TZ = 'America/Costa_Rica';
const DEBUG_TIME = new URLSearchParams(location.search).get('t'); // ?t=2026-08-28T07:00

function crParts(d = new Date()) {
  if (DEBUG_TIME) {
    const [ds, ts = '09:00'] = DEBUG_TIME.split('T');
    const [h, m] = ts.split(':').map(Number);
    return { date: ds, h, m };
  }
  const f = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false
  }).formatToParts(d).reduce((a, p) => (a[p.type] = p.value, a), {});
  return { date: `${f.year}-${f.month}-${f.day}`, h: +f.hour % 24, m: +f.minute };
}
const now = () => { const p = crParts(); return { ...p, mins: p.h * 60 + p.m }; };

const toMin  = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const fmt    = m => { m = ((m % 1440) + 1440) % 1440; const h = Math.floor(m / 60), x = m % 60;
                      return `${((h + 11) % 12) + 1}:${String(x).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`; };
const dayFor = d => TRIP.days.find(x => x.date === d);
const blockOf = m => m < 660 ? 'morning' : m < 840 ? 'midday' : m < 1050 ? 'afternoon' : 'evening';
const BLOCK_LABEL = { morning: 'Morning', midday: 'Midday', afternoon: 'Afternoon', evening: 'Evening' };
const prettyDate = d => new Date(d + 'T12:00:00').toLocaleDateString('en-US',
  { weekday: 'long', month: 'long', day: 'numeric' });

/* ---------- live data ---------- */
const LIVE = { wx: null, wxAt: null, wxErr: false, fx: null, fxAt: null, fxErr: false };

function timed(url, ms = 6000) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  return fetch(url, { signal: c.signal })
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .finally(() => clearTimeout(t));
}

async function loadWeather() {
  LIVE.wxErr = false; render();
  const u = `https://api.open-meteo.com/v1/forecast?latitude=${TRIP.coords.lat}&longitude=${TRIP.coords.lon}`
          + `&hourly=precipitation_probability,weathercode,temperature_2m`
          + `&current=temperature_2m,weathercode&temperature_unit=fahrenheit&timezone=${TZ}&forecast_days=7`;
  try {
    const j = await timed(u);
    const map = {};
    j.hourly.time.forEach((t, i) => {
      map[t.slice(0, 13)] = {
        p: j.hourly.precipitation_probability[i],
        c: j.hourly.weathercode[i],
        t: Math.round(j.hourly.temperature_2m[i])
      };
    });
    LIVE.wx = { map, current: j.current };
    LIVE.wxAt = now();
  } catch { LIVE.wx = null; LIVE.wxErr = true; }
  render();
}

async function loadFx() {
  LIVE.fxErr = false; render();
  try {
    const j = await timed('https://open.er-api.com/v6/latest/USD');
    const r = j && j.rates && j.rates.CRC;
    if (!r) throw new Error('no CRC');
    LIVE.fx = r; LIVE.fxAt = now();
  } catch { LIVE.fx = null; LIVE.fxErr = true; }
  render();
}

/* weathercode → short word + glyph */
function wxWord(c) {
  if (c === 0) return ['Clear', '☀️'];
  if (c <= 2) return ['Partly cloudy', '⛅'];
  if (c === 3) return ['Overcast', '☁️'];
  if (c <= 48) return ['Fog', '🌫️'];
  if (c <= 57) return ['Drizzle', '🌦️'];
  if (c <= 67) return ['Rain', '🌧️'];
  if (c <= 82) return ['Showers', '🌧️'];
  if (c >= 95) return ['Thunderstorms', '⛈️'];
  return ['Rain', '🌧️'];
}

/* peak precip probability across an hour window on a date */
function peakRain(date, [a, b]) {
  if (!LIVE.wx) return null;
  let peak = null, code = 0;
  for (let h = a; h <= b; h++) {
    const cell = LIVE.wx.map[`${date}T${String(h).padStart(2, '0')}`];
    if (!cell) continue;
    if (peak === null || cell.p > peak) { peak = cell.p; code = cell.c; }
  }
  return peak === null ? null : { p: peak, c: code };
}

/* per-activity go / reassess signal */
function signalFor(item) {
  const pl = PLACES[item.place];
  if (!pl || !pl.weather) return null;
  if (!LIVE.wx) return { level: 'unknown', text: 'Weather unavailable — check the sky before you commit.' };
  const d = TRIP.days.find(x => x.n === item.day);
  const r = peakRain(d.date, pl.weather.window);
  if (!r) return { level: 'unknown', text: 'No forecast for this window yet.' };
  if (pl.conditional === 'visibility') {
    if (r.p >= 55 || (r.c >= 45 && r.c <= 48))
      return { level: 'stop', text: `${r.p}% rain in the view window → poor Arenal visibility. Skip the scenic dinner.`, ico: '🌧️' };
    if (r.p >= 30) return { level: 'watch', text: `${r.p}% rain → visibility is a coin flip. Decide by 3 PM.`, ico: '⛅' };
    return { level: 'go', text: `${r.p}% rain → good odds on the volcano. Book it, sit down by 4:45.`, ico: '🌋' };
  }
  if (r.p >= 65) return { level: 'stop', text: pl.weather.reassess, ico: '🌧️' };
  if (r.p >= 35) return { level: 'watch', text: `${r.p}% rain in this window. ${pl.weather.go}`, ico: '🌦️' };
  return { level: 'go', text: `${r.p}% rain — clear enough. ${pl.weather.go.replace(/^Light rain → /, '')}`, ico: '🌿' };
}

/* ---------- derived state ---------- */
const leaveBy = item => toMin(item.start) - (PLACES[item.place]?.drive || 0) - 15;

function bookingOf(id, place) {
  if (BOOKING[id]) return BOOKING[id];
  const t = PLACES[place]?.tags || [];
  if (t.includes('resRequired')) return 'needs';
  if (t.includes('resRec')) return 'rec';
  return 'none';
}
const BOOK_LABEL = { needs: 'Needs booking', rec: 'Reservation recommended', booked: 'Booked', none: 'No reservation needed' };
const BOOK_NEXT  = { needs: 'booked', rec: 'booked', booked: 'none', none: 'needs' };

const mapUrl = q => `https://www.google.com/maps/dir/?api=1&travelmode=driving&origin=${encodeURIComponent(TRIP.baseQuery)}&destination=${encodeURIComponent(q)}`;

function driveText(pl) {
  if (pl.driveNote) return pl.driveNote;
  return `~${pl.drive} min`;
}

/* ---------- rendering helpers ---------- */
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function tagHtml(keys, max = 4) {
  return keys.slice(0, max).map(k => {
    const t = TAGS[k]; if (!t) return '';
    const label = t.stars ? '★'.repeat(t.stars) + ' ' + t.label : t.label;
    return `<span class="tag ${t.tone}">${label}</span>`;
  }).join('');
}

function cardHtml(item, opts = {}) {
  const pl = PLACES[item.place]; if (!pl) return '';
  const done = !!DONE[item.id];
  const bk = bookingOf(item.id, item.place);
  const sig = signalFor(item);
  const why = item.why || pl.why;
  const lb = leaveBy(item);
  const soon = !opts.past && pl.drive > 0 && !pl.isDrive && (lb - now().mins) <= 45 && (lb - now().mins) >= -30;

  return `
  <article class="card ${opts.hero ? 'hero' : ''} ${done ? 'done' : ''}" data-item="${item.id}">
    <div class="plate-wrap">
      ${ART(pl.art)}
      ${opts.badge ? `<span class="plate-badge">${esc(opts.badge)}</span>` : ''}
      <span class="plate-drive">${esc(driveText(pl))}</span>
    </div>
    <div class="body">
      <div class="row-top">
        <span class="time">${fmt(toMin(item.start))}</span>
        <h3 class="name">${esc(item.title)}</h3>
      </div>
      ${why ? `<p class="why">${esc(why)}</p>` : ''}
      <div class="tags">${tagHtml(pl.tags)}</div>

      ${(pl.drive > 0 && !pl.isDrive) ? `
      <div class="strip ${soon ? 'soon' : ''}">
        ${soon ? '<span class="pulse"></span>' : ''}
        <span class="k">Leave by</span>
        <span class="v">${fmt(lb)}</span>
        <span class="approx">approx. — ${esc(driveText(pl))} drive + 15 min buffer, no live traffic</span>
      </div>` : ''}

      ${sig ? `<div class="signal ${sig.level}"><span class="ico">${sig.ico || 'ℹ️'}</span><span>${esc(sig.text)}</span></div>` : ''}

      <div class="bookrow">
        <button class="book" data-book="${item.id}" data-s="${bk}">${BOOK_LABEL[bk]}</button>
        <span class="book-hint">tap to change</span>
      </div>

      ${item.alternates ? `<p class="fallback"><b>If not:</b> ${item.alternates.map(a =>
        `${esc(PLACES[a].short)} <i>${esc(driveText(PLACES[a]))}</i>`).join(' · ')}</p>` : ''}

      <div class="actions">
        <a class="btn primary" href="${mapUrl(pl.query)}" target="_blank" rel="noopener">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
          Directions
        </a>
        <button class="btn ghost" data-toggle="${item.id}">Details</button>
      </div>

      <div class="details" id="d-${item.id}">
        <dl>${(pl.details || []).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
        ${pl.confirm ? `<p class="confirm-flag">Confirm before you go — hours and status here come from search and review data, not a live business feed.</p>` : ''}
      </div>

      <div class="cardfoot">
        <button class="complete" data-done="${item.id}" aria-pressed="${done}">
          <span class="tick">${done ? '✓' : ''}</span>${done ? 'Completed' : 'Mark completed'}
        </button>
        ${opts.collapsible ? `<button class="collapse" data-jump="${item.id}">Close</button>` : ''}
      </div>
    </div>
  </article>`;
}

function miniHtml(item, kicker) {
  const pl = PLACES[item.place]; if (!pl) return '';
  const done = !!DONE[item.id];
  const bk = bookingOf(item.id, item.place);
  return `
  <button class="mini ${done ? 'done' : ''}" data-jump="${item.id}">
    <span class="thumb">${ART(pl.art)}</span>
    <span>
      <span class="t">${kicker ? kicker + ' · ' : ''}${fmt(toMin(item.start))}</span>
      <span class="n">${esc(item.title.replace(/^(Dinner|Lunch|Brunch) — /, ''))}</span>
      <span class="m">${esc(driveText(pl))}${bk !== 'none' ? ' · ' + BOOK_LABEL[bk] : ''}</span>
    </span>
    <span class="go">›</span>
  </button>`;
}

/* ---------- TODAY ---------- */
function renderToday() {
  const n = now();
  const today = dayFor(n.date);
  const el = document.getElementById('today');

  /* before / after the trip */
  if (!today) {
    const first = TRIP.days[0], last = TRIP.days[TRIP.days.length - 1];
    if (n.date < first.date) {
      const days = Math.round((new Date(first.date) - new Date(n.date)) / 864e5);
      el.innerHTML = `
        <div class="daymark"><span class="kicker">Not there yet</span></div>
        <h1 class="title">${days} day${days === 1 ? '' : 's'} out</h1>
        <p class="lede">La Fortuna starts ${prettyDate(first.date)}. Here's day one so you can pre-book what needs booking.</p>
        ${bookingAlert(true)}
        ${ITINERARY.filter(i => i.day === 1).map(i => cardHtml(i, { badge: 'Day 1' })).join('')}`;
      return;
    }
    el.innerHTML = `
      <div class="daymark"><span class="kicker">Trip complete</span></div>
      <h1 class="title">That was La Fortuna</h1>
      <p class="lede">Everything is still here — Plan, Food and your journal notes.</p>`;
    return;
  }

  const items = ITINERARY.filter(i => i.day === today.n).sort((a, b) => toMin(a.start) - toMin(b.start));
  const block = blockOf(n.mins);

  /* next = first incomplete item still ahead; else first incomplete at all */
  const ahead = items.filter(i => toMin(i.start) >= n.mins - 45 && !DONE[i.id]);
  const next = ahead[0] || items.filter(i => !DONE[i.id]).pop() || items[items.length - 1];
  const after = ahead[1];
  const dinner = items.find(i => i.block === 'evening');
  const past = items.filter(i => toMin(i.start) < n.mins && i !== next);

  let html = `
    <div class="daymark">
      <span class="kicker">Day ${today.n} of 4 · ${today.label}</span>
      <span class="when">${BLOCK_LABEL[block]}</span>
    </div>
    <h1 class="title">${esc(today.title)}</h1>
    <p class="lede">${esc(ledeFor(today, block, next))}</p>
    ${bookingAlert()}`;

  const nextIsSlow = next && next.kind === 'slow';
  if (nextIsSlow) {
    const sig = signalFor({ ...next, place: 'mistico' });
    html += `<div class="sect">Right now</div>
    <div class="slow">
      <div class="kicker">Slow ${BLOCK_LABEL[next.block].toLowerCase()}</div>
      <h3>${esc(next.title.replace(/^Slow \w+ — /, ''))}</h3>
      <p>${esc(next.why || PLACES[next.place].why)}</p>
      <div class="slow-actions">
        <button class="complete" data-done="${next.id}" aria-pressed="${!!DONE[next.id]}">
          <span class="tick">${DONE[next.id] ? '✓' : ''}</span>${DONE[next.id] ? 'Done' : 'Mark done'}
        </button>
      </div>
    </div>`;
  } else {
    html += `<div class="sect">Next</div>${cardHtml(next, { hero: true, badge: BLOCK_LABEL[next.block] })}`;
  }

  if (after) html += `<div class="sect">After this</div>${miniHtml(after, BLOCK_LABEL[after.block])}`;

  if (dinner && dinner !== next && dinner !== after) {
    html += `<div class="sect">Dinner tonight</div>${miniHtml(dinner)}`;
    const sig = signalFor(dinner);
    const alt = dinner.alternates && dinner.alternates.find(a => PLACES[a].intents?.includes('toddler'));
    if (sig && sig.level === 'stop') {
      html += `<div class="signal stop" style="margin:-4px 0 10px">${sig.ico} ${esc(sig.text)}</div>`;
    }
    if (alt) html += `<p class="foot" style="padding-top:2px">Easiest backup: <b>${esc(PLACES[alt].short)}</b> · ${esc(driveText(PLACES[alt]))} · ${BOOK_LABEL[bookingOf('alt-' + alt, alt)].toLowerCase()}</p>`;
  }

  if (past.length) {
    html += `<div class="sect">Earlier today</div>` + past.map(i => miniHtml(i)).join('');
  }

  html += `<p class="foot">Leave-by times are estimates: stored average drive time plus a fixed 15-minute buffer. No live traffic data on a static site.</p>`;
  el.innerHTML = html;
}

function ledeFor(day, block, next) {
  if (!next) return 'Nothing left scheduled. Los Lagos is right there.';
  const pl = PLACES[next.place];
  if (next.kind === 'slow') return 'Nothing scheduled on purpose. Warm water, no drive.';
  const n = now();
  if (toMin(next.start) < n.mins) return `Running behind on ${pl.short}. Still worth going.`;
  if (pl.isDrive) return `${pl.short} at ${fmt(toMin(next.start))} — ${esc(driveText(pl))}. Build in a buffer.`;
  return `${pl.drive > 0 ? `Leave by ${fmt(leaveBy(next))} for ${pl.short}.` : `${pl.short} — no drive.`} Sunset ${TRIP.sunset}.`;
}

function bookingAlert(all = false) {
  const n = now();
  const pending = ITINERARY.filter(i => {
    const b = bookingOf(i.id, i.place);
    if (b !== 'needs' && b !== 'rec') return false;
    if (DONE[i.id]) return false;
    if (all) return true;
    const d = TRIP.days.find(x => x.n === i.day);
    return d.date >= n.date;
  });
  if (!pending.length) return '';
  return `<div class="alert">
    <h4>Not booked yet</h4>
    <ul>${pending.map(i => `<li>${esc(PLACES[i.place].short)} — ${TRIP.days.find(d => d.n === i.day).label} ${fmt(toMin(i.start))}</li>`).join('')}</ul>
  </div>`;
}

/* ---------- PLAN ---------- */
let OPEN_ITEM = null;

function renderPlan() {
  const n = now();
  document.getElementById('plan').innerHTML = `
    <div class="daymark"><span class="kicker">Aug 26–29, 2026</span></div>
    <h1 class="title">Four days</h1>
    <p class="lede">One meaningful thing per half-day. Outdoors in the morning, water in the afternoon.</p>
    ${TRIP.days.map(d => {
      const items = ITINERARY.filter(i => i.day === d.n).sort((a, b) => toMin(a.start) - toMin(b.start));
      return `<div class="sect">${d.label} · ${prettyDate(d.date).replace(/^\w+, /, '')}${d.date === n.date ? ' · today' : ''}</div>
        ${items.map(i => OPEN_ITEM === i.id
            ? cardHtml(i, { badge: BLOCK_LABEL[i.block], collapsible: true })
            : miniHtml(i, BLOCK_LABEL[i.block])).join('')}`;
    }).join('')}
    <p class="foot">Tap any item to open it. Times are the plan, not a commitment — the toddler gets a vote.</p>`;
}

/* ---------- FOOD ---------- */
const INTENTS = [
  ['dinnerTonight', 'Dinner tonight'], ['toddler', 'Toddler easy'], ['nice', 'Nice dinner'],
  ['local', 'Local'], ['views', 'Views'], ['breakfast', 'Breakfast'], ['coffee', 'Coffee'],
  ['nonCR', 'Not Costa Rican'], ['backup', 'Backup'], ['more', 'More options']
];
let FOOD_FILTER = 'dinnerTonight';

function renderFood() {
  const n = now();
  const today = dayFor(n.date);
  const tonight = today && ITINERARY.find(i => i.day === today.n && i.block === 'evening');

  let list;
  if (FOOD_FILTER === 'dinnerTonight') {
    const ids = tonight ? [tonight.place, ...(tonight.alternates || [])] : ['chante', 'monkeys', 'medi'];
    list = ids.map(id => PLACES[id]).filter(Boolean);
  } else {
    list = Object.values(PLACES).filter(p => p.kind === 'food' && (p.intents || []).includes(FOOD_FILTER));
  }

  const rank = p => (p.tags.includes('must') ? 0 : p.tags.includes('high') ? 1 : p.tags.includes('backup') ? 3 : 2);
  if (FOOD_FILTER !== 'dinnerTonight') list.sort((a, b) => rank(a) - rank(b));

  document.getElementById('food').innerHTML = `
    <div class="daymark"><span class="kicker">Eat</span></div>
    <h1 class="title">What kind of meal?</h1>
    <p class="lede">Sorted by what you need right now, not alphabetically.</p>
    <div class="filters">${INTENTS.map(([k, l]) =>
      `<button class="chip" data-filter="${k}" aria-pressed="${FOOD_FILTER === k}">${l}</button>`).join('')}</div>
    ${list.length ? list.map(p => foodCard(p, tonight)).join('') : '<p class="empty">Nothing filed under that. Try Backup — Los Lagos always works.</p>'}
    <p class="foot">Hours, prices and reservation policies here come from search and review data. Confirm anything you are counting on.</p>`;
}

function foodCard(pl, tonight) {
  const pseudo = { id: 'f-' + pl.id, place: pl.id, title: pl.name, start: tonight && tonight.place === pl.id ? tonight.start : '18:00' };
  const bk = bookingOf(pseudo.id, pl.id);
  const done = !!DONE[pseudo.id];
  const sig = pl.weather ? signalFor({ ...pseudo, day: dayFor(now().date)?.n || 2 }) : null;
  return `
  <article class="card ${done ? 'done' : ''}">
    <div class="plate-wrap">
      ${ART(pl.art)}
      <span class="plate-drive">${esc(driveText(pl))}</span>
    </div>
    <div class="body">
      <div class="row-top"><h3 class="name small">${esc(pl.name)}</h3></div>
      <p class="why">${esc(pl.why)}</p>
      <div class="tags">${tagHtml(pl.tags)}</div>
      ${sig ? `<div class="signal ${sig.level}"><span class="ico">${sig.ico || 'ℹ️'}</span><span>${esc(sig.text)}</span></div>` : ''}
      <div class="bookrow">
        <button class="book" data-book="${pseudo.id}" data-s="${bk}">${BOOK_LABEL[bk]}</button>
        <span class="book-hint">tap to change</span>
      </div>
      <div class="actions">
        <a class="btn primary" href="${mapUrl(pl.query)}" target="_blank" rel="noopener">Directions</a>
        <button class="btn ghost" data-toggle="${pseudo.id}">Details</button>
      </div>
      <div class="details" id="d-${pseudo.id}">
        <dl>${(pl.details || []).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
        ${pl.confirm ? `<p class="confirm-flag">Confirm before you go — sourced from search and review data, not a live business feed.</p>` : ''}
      </div>
      <button class="complete" data-done="${pseudo.id}" aria-pressed="${done}">
        <span class="tick">${done ? '✓' : ''}</span>${done ? 'Been there' : 'Mark been there'}
      </button>
    </div>
  </article>`;
}

/* ---------- PACK ---------- */
function renderPack() {
  const all = PACKING.flatMap(([g, items]) => items.map(i => g + '|' + i));
  const n = all.filter(k => PACKED[k]).length;
  document.getElementById('pack').innerHTML = `
    <div class="daymark"><span class="kicker">Pack</span></div>
    <h1 class="title">${n} of ${all.length}</h1>
    <div class="progress"><i style="width:${Math.round(n / all.length * 100)}%"></i></div>
    ${PACKING.map(([g, items]) => `
      <div class="packgroup"><h3>${esc(g)}</h3>
        ${items.map(i => {
          const k = g + '|' + i;
          return `<button class="packitem" data-pack="${esc(k)}" aria-pressed="${!!PACKED[k]}">
            <span class="tick">${PACKED[k] ? '✓' : ''}</span>${esc(i)}</button>`;
        }).join('')}
      </div>`).join('')}`;
}

/* ---------- MORE ---------- */
function renderMore() {
  const rate = LIVE.fx;
  document.getElementById('more').innerHTML = `
    <div class="daymark"><span class="kicker">More</span></div>
    <h1 class="title">Everything else</h1>

    <div class="panel">
      <h3>Currency</h3>
      ${rate ? `
        <div class="fx">
          <input id="usd" type="number" inputmode="decimal" value="20" min="0" aria-label="US dollars">
          <span class="eq">=</span>
          <span class="out" id="crc">₡${Math.round(20 * rate).toLocaleString()}</span>
        </div>
        <span class="fresh">₡${rate.toFixed(2)} per USD · updated ${fmt(LIVE.fxAt.h * 60 + LIVE.fxAt.m)}</span>`
      : `<p class="fail">FX unavailable</p><button class="retry" data-retry="fx">Retry</button>`}
      <p class="note" style="margin-top:10px"><span>Cards are widely accepted. Keep ₡5,000–10,000 notes for sodas, roadside stops and tips.</span></p>
    </div>

    <div class="panel">
      <h3>Journal</h3>
      <textarea id="journal" placeholder="What you actually did, what the toddler thought of it.">${esc(store.get('journal', ''))}</textarea>
      <span class="fresh" id="jsaved">Saves as you type, on this device only.</span>
    </div>

    <div class="panel">
      <h3>Notes we checked twice</h3>
      ${NOTES.map(([t, b]) => `<div class="note"><b>${esc(t)}</b><span>${esc(b)}</span></div>`).join('')}
    </div>

    <div class="panel">
      <h3>Reset</h3>
      <p class="note" style="border:0;padding-top:0"><span>Clears completed items, reservation status, packing and journal on this device.</span></p>
      <button class="danger" data-reset>Clear saved progress</button>
    </div>

    <p class="foot">v2 · static site, no account, no sync. Weather from Open-Meteo, exchange rate from exchangerate-api. Everything else is stored trip data.</p>`;
}

/* ---------- STATUS BAR ---------- */
function renderStatus() {
  const n = now();
  const day = dayFor(n.date);
  const cur = LIVE.wx && LIVE.wx.current;
  const [word, glyph] = cur ? wxWord(cur.weathercode) : ['', ''];

  document.getElementById('statusLine').innerHTML = `
    <b>${fmt(n.mins)}</b>
    <span class="status-sep">·</span>
    ${LIVE.wx ? `<span>${glyph} <b>${Math.round(cur.temperature_2m)}°F</b></span>`
              : LIVE.wxErr ? `<span class="fail">Weather unavailable</span>` : `<span>Weather…</span>`}
    <span class="status-sep">·</span>
    ${LIVE.fx ? `<span><b>₡${Math.round(LIVE.fx)}</b>/$</span>`
              : LIVE.fxErr ? `<span class="fail">FX unavailable</span>` : `<span>FX…</span>`}
    <span class="status-sep">·</span>
    <span>${day ? `Day ${day.n}` : 'Pre-trip'}</span>
    <span class="status-chev">⌄</span>`;

  const wxBody = LIVE.wx
    ? `<div class="big">${Math.round(cur.temperature_2m)}°F ${glyph}</div>
       <div style="font-size:13px;color:var(--ink-2)">${word}</div>
       ${rainStrip(n.date)}
       <span class="fresh">Updated ${fmt(LIVE.wxAt.h * 60 + LIVE.wxAt.m)}</span>`
    : `<p class="fail">Weather unavailable</p><button class="retry" data-retry="wx">Retry</button>`;

  const fxBody = LIVE.fx
    ? `<div class="big">₡${LIVE.fx.toFixed(2)}</div>
       <div style="font-size:13px;color:var(--ink-2)">per US dollar</div>
       <span class="fresh">Updated ${fmt(LIVE.fxAt.h * 60 + LIVE.fxAt.m)}</span>`
    : `<p class="fail">FX unavailable</p><button class="retry" data-retry="fx">Retry</button>`;

  document.getElementById('statusDetail').innerHTML = `
    <div class="status-grid">
      <div class="status-card"><h4>La Fortuna</h4>${wxBody}</div>
      <div class="status-card"><h4>Colón</h4>${fxBody}</div>
    </div>`;
}

function rainStrip(date) {
  if (!LIVE.wx) return '';
  const parts = [['Morning', [7, 11]], ['Midday', [11, 14]], ['Afternoon', [14, 17]], ['Evening', [17, 20]]];
  return `<div style="display:flex;gap:6px;margin-top:8px">` + parts.map(([l, w]) => {
    const r = peakRain(date, w);
    if (!r) return '';
    const c = r.p >= 65 ? 'var(--clay)' : r.p >= 35 ? 'var(--sun)' : 'var(--leaf)';
    return `<div style="flex:1;text-align:center">
      <div style="height:4px;border-radius:99px;background:${c};opacity:.9"></div>
      <div style="font-size:10.5px;color:var(--ink-3);margin-top:3px">${l.slice(0, 3)} ${r.p}%</div></div>`;
  }).join('') + `</div>`;
}

/* ---------- router ---------- */
let TAB = 'today';
function render() {
  renderStatus();
  ({ today: renderToday, plan: renderPlan, food: renderFood, pack: renderPack, more: renderMore }[TAB])();
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('on', s.id === TAB));
  document.querySelectorAll('.navbtn').forEach(b => {
    b.setAttribute('aria-current', b.dataset.tab === TAB ? 'page' : 'false');
  });
  const pend = ITINERARY.some(i => ['needs', 'rec'].includes(bookingOf(i.id, i.place)) && !DONE[i.id]);
  document.querySelector('[data-tab="today"] .navdot')?.toggleAttribute('hidden', !pend);
}

/* ---------- events ---------- */
document.addEventListener('click', e => {
  const t = e.target.closest('[data-tab],[data-toggle],[data-done],[data-book],[data-pack],[data-filter],[data-retry],[data-reset],[data-jump],#statusLine');

  if (!t) return;

  if (t.dataset.tab)      { TAB = t.dataset.tab; window.scrollTo({ top: 0 }); render(); return; }
  if (t.id === 'statusLine') {
    const open = document.getElementById('status').classList.toggle('open');
    t.setAttribute('aria-expanded', open);
    return;
  }

  if (t.dataset.toggle) {
    const d = document.getElementById('d-' + t.dataset.toggle);
    const on = d.classList.toggle('on');
    t.textContent = on ? 'Hide details' : 'Details';
    return;
  }
  if (t.dataset.done)   { const k = t.dataset.done; DONE[k] = !DONE[k]; if (!DONE[k]) delete DONE[k]; store.set('done', DONE); render(); return; }
  if (t.dataset.book)   { const k = t.dataset.book; BOOKING[k] = BOOK_NEXT[t.dataset.s]; store.set('booking', BOOKING); render(); return; }
  if (t.dataset.pack)   { const k = t.dataset.pack; PACKED[k] = !PACKED[k]; if (!PACKED[k]) delete PACKED[k]; store.set('packed', PACKED); renderPack(); return; }
  if (t.dataset.filter) { FOOD_FILTER = t.dataset.filter; renderFood(); return; }
  if (t.dataset.retry)  { t.dataset.retry === 'wx' ? loadWeather() : loadFx(); return; }
  if (t.dataset.jump)   {
    OPEN_ITEM = OPEN_ITEM === t.dataset.jump ? null : t.dataset.jump;
    const wasPlan = TAB === 'plan';
    TAB = 'plan'; render();
    if (OPEN_ITEM) {
      const el = document.querySelector(`[data-item="${OPEN_ITEM}"]`);
      el?.scrollIntoView({ behavior: wasPlan ? 'smooth' : 'auto', block: 'center' });
    }
    return;
  }
  if (t.hasAttribute('data-reset')) {
    if (confirm('Clear completed items, reservation status, packing and journal on this device?')) {
      store.clear(); DONE = {}; BOOKING = {}; PACKED = {}; render();
    }
  }
});

document.addEventListener('input', e => {
  if (e.target.id === 'usd' && LIVE.fx) {
    document.getElementById('crc').textContent = '₡' + Math.round((+e.target.value || 0) * LIVE.fx).toLocaleString();
  }
  if (e.target.id === 'journal') {
    store.set('journal', e.target.value);
    document.getElementById('jsaved').textContent = 'Saved.';
  }
});

/* ---------- boot ---------- */
render();
loadWeather();
loadFx();
setInterval(() => { if (TAB === 'today') render(); else renderStatus(); }, 60000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });
