/* ============================================================
   art.js — hand-built SVG "field plates".
   Drawn rather than photographed on purpose: they load instantly,
   never 404, and can't be a photo of the wrong restaurant.
   Each key maps to exactly one subject.
   ============================================================ */

const ART = (() => {
  const sky = (a, b) => `<linearGradient id="sky-@" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;

  const wrap = (id, defs, body) => `
    <svg class="plate" viewBox="0 0 400 176" preserveAspectRatio="xMidYMid slice" role="img" aria-hidden="true">
      <defs>${defs.replace(/@/g, id)}</defs>
      <rect width="400" height="176" fill="url(#sky-${id})"/>
      ${body}
    </svg>`;

  const mist = (y, o = 0.5) => `<g class="mist" opacity="${o}">
    <ellipse cx="90" cy="${y}" rx="120" ry="10" fill="#fff" opacity=".55"/>
    <ellipse cx="290" cy="${y + 8}" rx="140" ry="9" fill="#fff" opacity=".4"/></g>`;

  const hills = (c1, c2) => `
    <path d="M0 118 C60 92 110 108 160 96 C215 83 260 104 320 92 C355 85 380 92 400 88 L400 176 L0 176Z" fill="${c1}"/>
    <path d="M0 138 C70 118 120 132 190 124 C260 116 320 132 400 122 L400 176 L0 176Z" fill="${c2}"/>`;

  const canopy = (c) => `<g fill="${c}">
    <circle cx="24" cy="150" r="30"/><circle cx="58" cy="158" r="26"/><circle cx="352" cy="152" r="30"/>
    <circle cx="380" cy="162" r="26"/><circle cx="318" cy="164" r="22"/></g>`;

  const cone = (c) => `<path d="M120 116 L196 40 L272 116 Z" fill="${c}"/>
    <path d="M196 40 L214 62 L204 66 L220 84 L196 78 L178 88 L188 66 L176 60 Z" fill="#fff" opacity=".18"/>`;

  const plates = {
    /* Hanging bridges: cable curve + planks over a green gorge */
    bridges: wrap('br', sky('#CFE4EE', '#EAF3E8'), `
      ${cone('#7FA08E')}
      ${hills('#3E7C5C', '#2C6146')}
      ${mist(104, .6)}
      <g stroke="#F4EFE2" stroke-width="2.5" fill="none">
        <path d="M-6 78 C110 132 290 132 406 78"/>
        <path d="M-6 56 C110 108 290 108 406 56"/>
      </g>
      <g stroke="#F4EFE2" stroke-width="1.4" opacity=".85">
        ${Array.from({ length: 13 }, (_, i) => {
          const x = 10 + i * 31;
          const t = (x - 200) / 206;
          const yb = 78 + (1 - t * t) * 52, yt = 56 + (1 - t * t) * 50;
          return `<line x1="${x}" y1="${yt}" x2="${x}" y2="${yb}"/>`;
        }).join('')}
      </g>
      <g stroke="#C9B99A" stroke-width="3" opacity=".9">
        ${Array.from({ length: 12 }, (_, i) => {
          const x = 14 + i * 31, t = (x - 200) / 206;
          const yb = 78 + (1 - t * t) * 52;
          return `<line x1="${x - 8}" y1="${yb}" x2="${x + 8}" y2="${yb}"/>`;
        }).join('')}
      </g>
      ${canopy('#245240')}`),

    /* Sloth on a branch */
    sloth: wrap('sl', sky('#DCEBD8', '#F1F6E9'), `
      ${hills('#4B8A63', '#33684C')}
      ${canopy('#27573F')}
      <path d="M40 62 C140 46 250 74 372 52" stroke="#5C4632" stroke-width="7" fill="none" stroke-linecap="round"/>
      <g class="sway" transform-origin="196px 62px">
        <ellipse cx="196" cy="92" rx="34" ry="25" fill="#9C8467"/>
        <ellipse cx="196" cy="88" rx="24" ry="17" fill="#B49B7C"/>
        <circle cx="224" cy="78" r="16" fill="#C2AA8B"/>
        <path d="M214 74 q10 -5 20 0" stroke="#6E5942" stroke-width="2.5" fill="none"/>
        <circle cx="219" cy="76" r="2.2" fill="#3A2E22"/><circle cx="231" cy="76" r="2.2" fill="#3A2E22"/>
        <path d="M222 84 q5 4 10 0" stroke="#6E5942" stroke-width="2" fill="none"/>
        <g stroke="#6E5942" stroke-width="5" stroke-linecap="round" fill="none">
          <path d="M176 70 q-8 -10 -4 -14"/><path d="M212 66 q6 -10 2 -12"/>
        </g>
      </g>
      <g fill="#2E6349" opacity=".9">
        <path d="M8 40 q22 -14 40 4 q-22 12 -40 -4Z"/><path d="M392 34 q-24 -12 -42 8 q24 10 42 -8Z"/>
      </g>`),

    /* Waterfall in a gorge with steps */
    waterfall: wrap('wf', sky('#CBE3E6', '#E9F2E6'), `
      ${hills('#3B7757', '#2A5C44')}
      <path d="M150 24 L150 118 Q168 140 196 142 Q224 140 242 118 L242 24 Z" fill="#20503C" opacity=".55"/>
      <g class="fall">
        <path d="M178 30 Q172 84 176 128 L214 128 Q218 84 212 30 Z" fill="#EAF6F7" opacity=".95"/>
        <path d="M186 32 Q182 84 186 126" stroke="#CBE7EC" stroke-width="3" fill="none"/>
        <path d="M204 32 Q208 84 204 126" stroke="#CBE7EC" stroke-width="3" fill="none"/>
      </g>
      <ellipse cx="196" cy="140" rx="46" ry="12" fill="#BFE0E4"/>
      <ellipse cx="196" cy="140" rx="28" ry="7" fill="#E7F5F6" opacity=".8"/>
      <g fill="#C9B99A" opacity=".95">
        ${Array.from({ length: 6 }, (_, i) =>
          `<rect x="${292 + i * 8}" y="${104 + i * 11}" width="42" height="7" rx="3"/>`).join('')}
      </g>
      ${canopy('#22513C')}
      ${mist(132, .45)}`),

    /* Hot spring terraces */
    springs: wrap('sp', sky('#E7E0D2', '#F4EFE4'), `
      ${cone('#8A9E92')}
      ${hills('#457F5F', '#2F6349')}
      <g>
        <ellipse cx="200" cy="120" rx="128" ry="26" fill="#63B8B0"/>
        <ellipse cx="200" cy="116" rx="112" ry="21" fill="#7FCFC4"/>
        <ellipse cx="150" cy="152" rx="120" ry="24" fill="#4FA9A3"/>
        <ellipse cx="150" cy="149" rx="104" ry="19" fill="#6FC4BB"/>
      </g>
      <g class="steam" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".6">
        <path d="M118 108 q10 -16 0 -30 q-10 -14 0 -26"/>
        <path d="M200 100 q10 -16 0 -30 q-10 -14 0 -24"/>
        <path d="M282 108 q10 -16 0 -30 q-10 -14 0 -26"/>
      </g>
      ${canopy('#255540')}`),

    /* Arenal at dusk — the visibility card */
    volcano: wrap('vo', sky('#F0C79A', '#F6E3C6'), `
      <circle cx="316" cy="58" r="22" fill="#F4A259" opacity=".85"/>
      ${cone('#5D6E63')}
      <path d="M120 116 L196 40 L232 116 Z" fill="#4A5B51"/>
      ${hills('#38664F', '#27503D')}
      ${mist(96, .5)}
      ${canopy('#1F4536')}`),

    /* Garden dining room */
    garden: wrap('ga', sky('#E6EEDC', '#F5F2E6'), `
      <rect x="0" y="96" width="400" height="80" fill="#EFE7D6"/>
      <g fill="#2F6A4C">
        ${Array.from({ length: 9 }, (_, i) => {
          const x = 12 + i * 46;
          return `<g class="sway" transform-origin="${x}px 0px">
            <path d="M${x} 0 L${x} ${34 + (i % 3) * 16}" stroke="#2F6A4C" stroke-width="3"/>
            <ellipse cx="${x - 9}" cy="${20 + (i % 3) * 12}" rx="11" ry="6"/>
            <ellipse cx="${x + 9}" cy="${32 + (i % 3) * 12}" rx="11" ry="6"/></g>`;
        }).join('')}
      </g>
      <rect x="128" y="108" width="144" height="8" rx="4" fill="#B08B5E"/>
      <rect x="146" y="116" width="8" height="34" fill="#8E6E48"/><rect x="246" y="116" width="8" height="34" fill="#8E6E48"/>
      <circle cx="172" cy="104" r="9" fill="#fff"/><circle cx="228" cy="104" r="9" fill="#fff"/>
      <g><rect x="196" y="88" width="8" height="18" fill="#D9E6D2"/><circle cx="200" cy="84" r="9" fill="#E6B0C6"/></g>
      <g fill="#F2C14E"><circle cx="60" cy="130" r="6"/><circle cx="344" cy="138" r="6"/></g>`),

    /* Wood-fired pizza */
    pizza: wrap('pz', sky('#F3E2CC', '#F8EFE0'), `
      <rect x="0" y="104" width="400" height="72" fill="#E7D6BE"/>
      <path d="M120 108 q80 -66 160 0 Z" fill="#B4562F"/>
      <path d="M150 108 q50 -40 100 0 Z" fill="#2C1E16"/>
      <g class="flicker"><path d="M186 106 q6 -18 14 -22 q4 12 12 22 Z" fill="#F2A03D"/>
        <path d="M192 106 q4 -11 8 -14 q3 8 7 14 Z" fill="#F6D06A"/></g>
      <rect x="96" y="108" width="208" height="10" rx="4" fill="#8E6E48"/>
      <g><rect x="42" y="118" width="70" height="6" rx="3" fill="#A98052"/>
        <circle cx="42" cy="121" r="20" fill="#EBC98C"/>
        <circle cx="42" cy="121" r="15" fill="#D8434B" opacity=".7"/>
        <g fill="#B4302F"><circle cx="36" cy="116" r="3"/><circle cx="48" cy="124" r="3"/><circle cx="38" cy="128" r="3"/></g></g>
      <g fill="#2F6A4C"><circle cx="344" cy="128" r="14"/><circle cx="366" cy="136" r="11"/></g>`),

    /* Roadside soda */
    soda: wrap('so', sky('#DCE9DB', '#F2F4E7'), `
      ${hills('#4A8663', '#31654B')}
      <rect x="96" y="72" width="208" height="72" rx="6" fill="#F6EFE0"/>
      <path d="M84 74 L200 40 L316 74 Z" fill="#C25B3C"/>
      <rect x="120" y="92" width="60" height="40" rx="4" fill="#2F6A4C" opacity=".85"/>
      <rect x="220" y="92" width="60" height="40" rx="4" fill="#2F6A4C" opacity=".85"/>
      <rect x="186" y="100" width="28" height="44" rx="3" fill="#8E6E48"/>
      <g fill="#F2C14E"><circle cx="140" cy="66" r="5"/><circle cx="200" cy="60" r="5"/><circle cx="260" cy="66" r="5"/></g>
      ${canopy('#26543F')}`),

    /* Coffee */
    coffee: wrap('cf', sky('#EFE6D6', '#F8F3E8'), `
      <rect x="0" y="112" width="400" height="64" fill="#E0D2BB"/>
      <g class="steam" stroke="#B49B7C" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7">
        <path d="M182 66 q10 -14 0 -26"/><path d="M204 62 q10 -14 0 -26"/><path d="M226 66 q10 -14 0 -26"/>
      </g>
      <path d="M156 76 h96 a4 4 0 0 1 4 4 v14 a34 34 0 0 1 -34 34 h-36 a34 34 0 0 1 -34 -34 v-14 a4 4 0 0 1 4 -4Z" fill="#F7F3EA"/>
      <path d="M256 84 a20 20 0 0 1 0 32" stroke="#F7F3EA" stroke-width="9" fill="none"/>
      <ellipse cx="204" cy="86" rx="42" ry="9" fill="#6B4A32"/>
      <ellipse cx="204" cy="85" rx="26" ry="5" fill="#C9A87C" opacity=".8"/>
      <ellipse cx="204" cy="140" rx="72" ry="10" fill="#C9B79A"/>
      <g fill="#2F6A4C"><ellipse cx="52" cy="120" rx="26" ry="12"/><ellipse cx="352" cy="126" rx="26" ry="12"/></g>
      <g fill="#B4302F"><circle cx="46" cy="112" r="4"/><circle cx="58" cy="114" r="4"/><circle cx="346" cy="118" r="4"/></g>`),

    /* Route 142 */
    road: wrap('rd', sky('#D6E6E4', '#EFF3E4'), `
      ${cone('#849C8E')}
      ${hills('#4B8663', '#33684C')}
      <path d="M150 176 Q188 118 196 92 Q204 118 250 176 Z" fill="#8A8579"/>
      <g stroke="#F4EFE2" stroke-width="3" stroke-dasharray="10 12"><path d="M200 176 L198 94"/></g>
      <g fill="#C25B3C"><rect x="270" y="106" width="46" height="26" rx="5"/>
        <rect x="276" y="132" width="6" height="14" fill="#8E6E48"/><rect x="304" y="132" width="6" height="14" fill="#8E6E48"/></g>
      <g fill="#F2C14E"><circle cx="282" cy="118" r="5"/><circle cx="296" cy="116" r="5"/><circle cx="308" cy="120" r="5"/></g>
      ${canopy('#26543F')}`),

    /* Departure */
    plane: wrap('pl', sky('#CFE0EC', '#EDF1E7'), `
      ${hills('#4C8062', '#34644B')}
      <g class="glide">
        <path d="M96 62 L226 54 L268 62 L226 70 L96 78 Z" fill="#F5F1E6"/>
        <path d="M168 58 L150 26 L166 26 L200 56 Z" fill="#E4DDCB"/>
        <path d="M168 74 L150 104 L166 104 L200 76 Z" fill="#E4DDCB"/>
        <circle cx="252" cy="62" r="4" fill="#3E7CA6"/>
      </g>
      <g class="mist" opacity=".55"><ellipse cx="120" cy="96" rx="70" ry="8" fill="#fff"/>
        <ellipse cx="300" cy="86" rx="60" ry="7" fill="#fff"/></g>
      ${canopy('#26543F')}`)
  };

  return (key) => plates[key] || plates.volcano;
})();
