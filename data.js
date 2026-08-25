/* ============================================================
   La Fortuna Trip Companion — v2 data
   Every number here is either (a) fixed by the trip plan, or
   (b) an approximation clearly labelled as such in the UI.
   Nothing in here is presented as live or verified.
   ============================================================ */

const TRIP = {
  name: 'La Fortuna',
  base: 'Los Lagos Hotel, Spa & Resort',
  baseQuery: 'Los Lagos Hotel Spa & Resort, La Fortuna, Costa Rica',
  coords: { lat: 10.47, lon: -84.64 },     // La Fortuna de San Carlos (weather)
  sunset: '5:30 PM',
  days: [
    { n: 1, date: '2026-08-26', label: 'Wed', title: 'Arrive & settle' },
    { n: 2, date: '2026-08-27', label: 'Thu', title: 'Bridges & a good dinner' },
    { n: 3, date: '2026-08-28', label: 'Fri', title: 'Sloths, brunch, slow water' },
    { n: 4, date: '2026-08-29', label: 'Sat', title: 'Drive out' }
  ]
};

/* Tag vocabulary — restrained on purpose. tone drives colour. */
const TAGS = {
  must:       { label: 'Must-do',            tone: 'star',  stars: 5 },
  high:       { label: 'Highly recommended', tone: 'star',  stars: 4 },
  optional:   { label: 'Optional',           tone: 'quiet' },
  backup:     { label: 'Backup',             tone: 'quiet' },
  rain:       { label: 'Rain-friendly',      tone: 'rain'  },
  toddler:    { label: 'Toddler easy',       tone: 'leaf'  },
  carrier:    { label: 'Carrier recommended',tone: 'leaf'  },
  resRequired:{ label: 'Reservation required',   tone: 'clay' },
  resRec:     { label: 'Reservation recommended',tone: 'sun' },
  resNone:    { label: 'No reservation needed',  tone: 'quiet' },
  visibility: { label: 'Good only with visibility', tone: 'sun' }
};

/* ------------------------------------------------------------
   PLACES
   drive  = stored average minutes from Los Lagos. Approximate.
   art    = illustration key (see art.js)
   weather.window = hours used for the go / reassess signal
   ------------------------------------------------------------ */
const PLACES = {
  loslagos: {
    id: 'loslagos', name: 'Los Lagos pools & hot springs', short: 'Los Lagos',
    kind: 'activity', art: 'springs', drive: 0, driveNote: 'On property',
    query: 'Los Lagos Hotel Spa & Resort, La Fortuna, Costa Rica',
    tags: ['rain', 'toddler', 'resNone'],
    why: 'The default when energy is low or the sky opens — warm water, no drive, no plan.',
    details: [
      ['Cost', 'Included with the stay'],
      ['Toddler', 'Shallow warm pools; check temperature before getting in — some are hot'],
      ['Timing', 'Best mid-afternoon when rain moves in']
    ]
  },

  mistico: {
    id: 'mistico', name: 'Místico Arenal Hanging Bridges', short: 'Místico',
    kind: 'activity', art: 'bridges', drive: 22,
    query: 'Mistico Arenal Hanging Bridges Park, Costa Rica',
    tags: ['high', 'carrier', 'resRec'],
    why: 'Canopy-level rainforest on a maintained loop — the best wildlife-per-effort walk near the base.',
    weather: { window: [7, 12], go: 'Light rain → still go. Canopy holds most of it.', reassess: 'Heavy rain → bridges get slick and views close in. Swap to Los Lagos.' },
    details: [
      ['Cost', 'Approx. $30–40 adult self-guided; guided costs more. Confirm current rates on booking.'],
      ['Stroller', 'Largely paved, may work with a stroller — bring the carrier as backup and confirm rental availability directly with the park.'],
      ['Time needed', 'Approx. 2 hrs at toddler pace'],
      ['Note', 'Go early. Wildlife and quiet both fade after 9:30.']
    ]
  },

  bogarin: {
    id: 'bogarin', name: 'Bogarín Trail — guided wildlife walk', short: 'Bogarín Trail',
    kind: 'activity', art: 'sloth', drive: 12,
    query: 'Bogarin Trail, La Fortuna, Costa Rica',
    tags: ['must', 'toddler', 'resRec'],
    why: 'The highest-odds sloth walk in town, flat the whole way — a guide is what makes it work.',
    weather: { window: [7, 11], go: 'Light rain → still go. Sloths do not mind and the trail is flat.', reassess: 'Heavy rain → wildlife goes quiet. Push to the afternoon or swap.' },
    details: [
      ['Cost', 'Approx. $20–45 per adult guided, varies by operator; under-3 generally free. Confirm at reception.'],
      ['Time needed', 'Approx. 2 hrs'],
      ['Terrain', 'Flat, hard-packed dirt, ~2 km. Reported as stroller-possible; carrier still easier.'],
      ['Guide', 'Guides are limited — book ahead. Self-guided is cheaper and you will see far less.'],
      ['Hours', 'Reported daily from 7 AM. Confirm current hours.']
    ]
  },

  waterfall: {
    id: 'waterfall', name: 'La Fortuna Waterfall — upper viewpoint', short: 'La Fortuna Waterfall',
    kind: 'activity', art: 'waterfall', drive: 18,
    query: 'Catarata Rio Fortuna, La Fortuna, Costa Rica',
    tags: ['optional', 'carrier'],
    why: 'Start at the upper viewpoint and decide there — the descent is roughly 500 steps each way.',
    weather: { window: [12, 17], go: 'Dry window → worth the drive for the viewpoint alone.', reassess: 'Heavy rain → steps get slick with a toddler. Skip it.' },
    details: [
      ['Cost', 'Entrance fee applies. Approx. $18–20 adult reported — confirm at the gate.'],
      ['Steps', 'Approx. 500 steps down to the base, and the same back up. Not a stroller route.'],
      ['Plan', 'Park, walk to the upper viewpoint, then decide whether anyone is descending.'],
      ['Note', 'No free public viewpoint is claimed here — treat the paid upper viewpoint as the plan.']
    ]
  },

  lapaz: {
    id: 'lapaz', name: 'La Paz Waterfall Gardens', short: 'La Paz Gardens',
    kind: 'activity', art: 'waterfall', drive: 120, driveNote: 'On the SJO route', isDrive: true,
    query: 'La Paz Waterfall Gardens Nature Park, Vara Blanca, Costa Rica',
    tags: ['optional', 'rain'],
    why: 'Only worth it as a departure-day stop — it sits on the road out, not on a day trip from here.',
    details: [
      ['Cost', 'Approx. $54–63 adult and $38–45 child 3–12 depending on source, before tax and any buffet. Sources disagree — confirm on the park site before counting on a number.'],
      ['Under 3', 'Commonly reported as free, but unverified. Confirm before you go.'],
      ['Hours', 'Reported 8 AM–5 PM, last admission mid-afternoon. Confirm current hours.'],
      ['Time needed', 'Approx. 2–3 hrs. Paved trails, but many steps between the falls.']
    ]
  },

  fruitstop: {
    id: 'fruitstop', name: 'Optional roadside fruit stop', short: 'Fruit stop',
    kind: 'activity', art: 'road', drive: 15, driveNote: 'Roadside, en route',
    query: 'fruit stand Route 142 La Fortuna Costa Rica',
    tags: ['optional', 'toddler'],
    why: 'Stop if you pass one and the toddler needs out of the car seat. Nothing to plan around.',
    details: [
      ['Cost', 'Cash, small notes. Availability varies.'],
      ['Note', 'No fixed vendor, hours, or price — these come and go along the road.']
    ]
  },

  departure: {
    id: 'departure', name: 'Drive to SJO', short: 'Drive out',
    kind: 'activity', art: 'plane', drive: 180, driveNote: 'Approx. 3–3.5 hrs to SJO', isDrive: true,
    query: 'Juan Santamaria International Airport, Alajuela, Costa Rica',
    tags: ['must'],
    why: 'Leave a real buffer — the mountain sections are slow and rain makes them slower.',
    details: [
      ['Drive', 'Approx. 3–3.5 hrs without stops. Add an hour if you stop at La Paz.'],
      ['Toddler', 'Plan one stop around the halfway mark.'],
      ['Note', 'Check your airline cut-off and work backwards from it, not from this card.']
    ]
  },

  /* ---------------- FOOD ---------------- */

  chante: {
    id: 'chante', name: 'El Chante Verde', short: 'El Chante Verde',
    kind: 'food', art: 'garden', drive: 14,
    query: 'El Chante Verde Restaurant, La Fortuna, Costa Rica',
    intents: ['nice', 'dinner'],
    tags: ['must', 'resRec'],
    why: 'Best dinner of the trip — a plant-filled garden room, and the menu covers everyone.',
    details: [
      ['Reserve', 'Widely reported as running largely on reservations. Call ahead.'],
      ['Hours', 'Reported from around 11:30 AM into the evening. Confirm current hours.'],
      ['Toddler', 'Kitchen can run slow when full — eat early and bring something to occupy the toddler.'],
      ['Where', 'Out toward the waterfall road, not the main strip.']
    ]
  },

  monkeys: {
    id: 'monkeys', name: "Soda Monkey's Place", short: "Monkey's Place",
    kind: 'food', art: 'soda', drive: 12,
    query: "Soda Monkey's Place, La Fortuna, Costa Rica",
    intents: ['toddler', 'local', 'dinner'],
    tags: ['high', 'toddler', 'resNone'],
    why: 'The easiest dinner with the toddler — family-run soda, fast, casual, no reservation.',
    details: [
      ['Reserve', 'Not needed. Walk in.'],
      ['Payment', 'Reported to take cash or card, English menus available.'],
      ['Order', 'Casados and chifrijo are what people come back for.'],
      ['Where', 'Roadside on the edge of town — easy to drive past.']
    ]
  },

  medi: {
    id: 'medi', name: 'Restaurante Café Mediterráneo', short: 'Café Mediterráneo',
    kind: 'food', art: 'pizza', drive: 12,
    query: 'Restaurante Cafe Mediterraneo, La Fortuna, Costa Rica',
    intents: ['toddler', 'dinner', 'nonCR'],
    tags: ['high', 'toddler', 'resNone'],
    why: 'The rescue dinner. Wood-fired pizza arrives fast and there is a play area to burn off a bad afternoon.',
    details: [
      ['Reserve', 'Generally walk-in. Busy at peak — go early.'],
      ['Toddler', "Reviewers consistently mention a children's play area. Confirm it's open when you arrive."],
      ['Order', 'Thin-crust pizza from the wood oven; pasta is handmade.'],
      ['Note', 'Check the bill and your change carefully.']
    ]
  },

  jalapas: {
    id: 'jalapas', name: 'Jalapas Restaurant', short: 'Jalapas',
    kind: 'food', art: 'volcano', drive: 22,
    query: 'Jalapas Restaurant, La Fortuna de San Carlos, Costa Rica',
    intents: ['views', 'dinner', 'nice'],
    tags: ['visibility', 'resRec'],
    conditional: 'visibility',
    why: 'Worth the drive only when Arenal is out — the view is the entire point.',
    weather: { window: [16, 18], go: 'Clear enough → book it and sit down by 4:45.', reassess: 'Volcano socked in → the drive stops being worth it. Eat in town.' },
    details: [
      ['Seating', 'Sit down 4:45–5:00 PM to get the light. Later and you are eating in the dark.'],
      ['Road', 'Winding, with an unpaved section. Not fun after dark in rain.'],
      ['Reserve', 'Recommended, especially at sunset. Confirm current hours.'],
      ['Note', 'Family-run; reports of ongoing construction on site.']
    ]
  },

  chifa: {
    id: 'chifa', name: 'Chifa La Familia Feliz', short: 'Chifa La Familia Feliz',
    kind: 'food', art: 'soda', drive: 12,
    query: 'Chifa La Familia Feliz, La Fortuna, Costa Rica',
    intents: ['nonCR', 'dinner', 'toddler'],
    tags: ['optional', 'resNone'],
    why: 'Peruvian-Chinese, and a break when nobody wants another casado.',
    details: [
      ['Reserve', 'Not typically needed.'],
      ['Hours', 'Confirm current hours — this is from search data, not a live feed.'],
      ['Toddler', 'Rice and noodle dishes share easily.']
    ]
  },

  openkitchen: {
    id: 'openkitchen', name: 'The Open Kitchen', short: 'The Open Kitchen',
    kind: 'food', art: 'coffee', drive: 12,
    query: 'The Open Kitchen La Fortuna, Costa Rica',
    intents: ['breakfast', 'brunch'],
    tags: ['high', 'toddler', 'resNone'],
    why: 'The Friday brunch after Bogarín — real breakfast, opens early, terrace seating.',
    confirm: true,
    details: [
      ['Hours', 'Reported to open 7 AM daily, closing mid-evening. Confirm before you go.'],
      ['Cost', 'Approx. $12–18 per person reported.'],
      ['Menu', 'Mediterranean-leaning breakfast, egg plates, bowls, vegan and gluten-free marked.'],
      ['Where', 'Calle 468, just off the centre.']
    ]
  },

  redfrog: {
    id: 'redfrog', name: 'Red Frog Coffee Roasters', short: 'Red Frog',
    kind: 'food', art: 'coffee', drive: 12,
    query: 'Red Frog Coffee Roasters, La Fortuna, Costa Rica',
    intents: ['coffee', 'breakfast', 'brunch'],
    tags: ['backup', 'resNone'],
    why: 'The brunch alternate, and the better cup of the two.',
    confirm: true,
    details: [
      ['Hours', 'Reported to open early. Confirm before you go.'],
      ['Note', 'Smaller and lighter than The Open Kitchen — better for coffee than a full plate.']
    ]
  },

  hormiga: {
    id: 'hormiga', name: 'La Casa de la Hormiga', short: 'La Hormiga',
    kind: 'food', art: 'soda', drive: 12,
    query: 'La Casa de la Hormiga, La Fortuna, Costa Rica',
    intents: ['breakfast', 'local', 'toddler'],
    tags: ['high', 'toddler', 'resNone'],
    why: 'Breakfast and lunch, not dinner — authentic, cheap, and quick with a toddler.',
    confirm: true,
    details: [
      ['Best for', 'Breakfast or an early lunch.'],
      ['Cost', 'Approx. $5–10 per person reported.'],
      ['Hours', 'Confirm current hours.']
    ]
  },

  vita: {
    id: 'vita', name: 'Vita Café', short: 'Vita Café',
    kind: 'food', art: 'coffee', drive: 12,
    query: 'Vita Cafe, La Fortuna, Costa Rica',
    intents: ['coffee'],
    tags: ['optional', 'resNone'],
    why: 'A specialty coffee stop — go for the cup, not for a meal.',
    confirm: true,
    details: [
      ['Best for', 'Coffee and something small.'],
      ['Not', 'Not the post-Bogarín brunch. Use The Open Kitchen for that.'],
      ['Hours', 'Confirm current hours.']
    ]
  },

  travesia: {
    id: 'travesia', name: 'Travesía', short: 'Travesía',
    kind: 'food', art: 'garden', drive: 13,
    query: 'Travesia Restaurant, La Fortuna, Costa Rica',
    intents: ['more', 'dinner'],
    tags: ['optional', 'resRec'],
    why: 'Secondary option if the primaries are full.',
    confirm: true,
    details: [['Hours', 'Confirm current hours and whether they are taking walk-ins.']]
  },

  tierramia: {
    id: 'tierramia', name: 'Tierra Mía', short: 'Tierra Mía',
    kind: 'food', art: 'soda', drive: 13,
    query: 'Tierra Mia Restaurant, La Fortuna, Costa Rica',
    intents: ['more', 'local'],
    tags: ['optional', 'resNone'],
    why: 'Secondary local option.',
    confirm: true,
    details: [['Hours', 'Confirm current hours.']]
  },

  losLagosDining: {
    id: 'losLagosDining', name: 'Los Lagos restaurant', short: 'Eat at Los Lagos',
    kind: 'food', art: 'springs', drive: 0, driveNote: 'On property',
    query: 'Los Lagos Hotel Spa & Resort, La Fortuna, Costa Rica',
    intents: ['backup', 'toddler', 'dinner'],
    tags: ['backup', 'toddler', 'rain'],
    why: 'No drive, no reservation, no negotiation. The fallback that always works.',
    details: [
      ['Best for', 'Rain, a bad nap, or a late afternoon that got away from you.'],
      ['Note', 'Confirm dining hours at the front desk on arrival.']
    ]
  }
};

/* ------------------------------------------------------------
   ITINERARY — start times are the plan; leave-by is derived.
   block: morning | midday | afternoon | evening
   ------------------------------------------------------------ */
const ITINERARY = [
  /* Day 1 — Wed 26 Aug */
  { id: 'd1-arrive', day: 1, block: 'afternoon', start: '15:00', title: 'Check in at Los Lagos',
    place: 'loslagos', kind: 'activity',
    why: 'Land, unpack, let the toddler run. Nothing else is scheduled today on purpose.' },
  { id: 'd1-springs', day: 1, block: 'afternoon', start: '16:30', title: 'Hot springs, slowly',
    place: 'loslagos', kind: 'activity' },
  { id: 'd1-dinner', day: 1, block: 'evening', start: '17:45', title: 'Dinner — Chifa La Familia Feliz',
    place: 'chifa', kind: 'food',
    alternates: ['losLagosDining', 'monkeys'] },

  /* Day 2 — Thu 27 Aug */
  { id: 'd2-mistico', day: 2, block: 'morning', start: '08:00', title: 'Místico Hanging Bridges',
    place: 'mistico', kind: 'activity' },
  { id: 'd2-lunch', day: 2, block: 'midday', start: '11:45', title: 'Lunch — La Casa de la Hormiga',
    place: 'hormiga', kind: 'food', alternates: ['monkeys'] },
  { id: 'd2-slow', day: 2, block: 'afternoon', start: '14:00', title: 'Slow afternoon — Los Lagos',
    place: 'loslagos', kind: 'slow',
    why: 'Deliberately empty. August afternoons turn wet and the toddler needs the down time.' },
  { id: 'd2-dinner', day: 2, block: 'evening', start: '17:45', title: 'Dinner — El Chante Verde',
    place: 'chante', kind: 'food', alternates: ['medi', 'jalapas'] },

  /* Day 3 — Fri 28 Aug */
  { id: 'd3-bogarin', day: 3, block: 'morning', start: '07:30', title: 'Bogarín Trail guided walk',
    place: 'bogarin', kind: 'activity' },
  { id: 'd3-brunch', day: 3, block: 'midday', start: '10:15', title: 'Brunch — The Open Kitchen',
    place: 'openkitchen', kind: 'food', alternates: ['redfrog'] },
  { id: 'd3-waterfall', day: 3, block: 'afternoon', start: '14:00', title: 'La Fortuna Waterfall viewpoint',
    place: 'waterfall', kind: 'activity', alternates: ['loslagos'] },
  { id: 'd3-dinner', day: 3, block: 'evening', start: '17:15', title: "Dinner — Soda Monkey's Place",
    place: 'monkeys', kind: 'food', alternates: ['medi', 'jalapas'] },

  /* Day 4 — Sat 29 Aug */
  { id: 'd4-slow', day: 4, block: 'morning', start: '07:30', title: 'Slow morning, pack up',
    place: 'loslagos', kind: 'slow',
    why: 'Last swim, coffee, and load the car before the heat.' },
  { id: 'd4-depart', day: 4, block: 'midday', start: '10:00', title: 'Drive to SJO',
    place: 'departure', kind: 'activity', alternates: ['lapaz'] }
];

/* Packing — grouped, toddler-weighted */
const PACKING = [
  ['Toddler', ['Carrier (the one that works in rain)', 'Rain cover for carrier', 'Sun hat', 'Swim nappies', 'Spare full outfit ×2', 'Snacks for the car', 'Sound machine / travel blackout']],
  ['Rain & sun', ['Light rain jackets', 'Quick-dry layers', 'Reef-safe sunscreen', 'Insect repellent', 'Dry bag for phones']],
  ['Feet', ['Closed-toe trail shoes', 'Sandals for the springs', 'Spare socks']],
  ['Water', ['Swimsuits ×2', 'Fast-dry towels', 'Waterproof phone pouch']],
  ['Admin', ['Passports', 'Car seat / confirm rental has one', 'Small ₡ notes for sodas & tips', 'Card that works abroad', 'Offline map of Arenal downloaded']]
];

const NOTES = [
  ['Cash vs card', 'Most places here take cards. Sodas, roadside stops and tips go easier with ₡5,000–10,000 notes.'],
  ['Afternoon rain', 'August afternoons are frequently wet. Outdoor plans go in the morning; the springs absorb the afternoon.'],
  ['Sunset', 'Around 5:30 PM. Anything scenic has to be seated by 4:45.'],
  ['One thing per half-day', 'Two activities in a day with a 1.5-year-old is one activity plus a meltdown.'],
  ['What is live here', 'Weather and the exchange rate are fetched live. Drive times, prices and hours are stored estimates — treat them as such.']
];
