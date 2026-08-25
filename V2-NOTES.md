# La Fortuna Trip App — v2

## Deploy

Files go in the repo root, replacing the current set:

```
index.html   styles.css   data.js   art.js   app.js
```

**Back up v1 first** (spec #30 — I can't do this from here):

```bash
git checkout -b v1-backup && git push -u origin v1-backup
git checkout main
# copy the five files in, then:
git add -A && git commit -m "v2 rebuild" && git push
```

Rollback is `git checkout v1-backup -- .`

## Testing a specific moment

Append `?t=YYYY-MM-DDTHH:MM` to freeze the clock:

- `?t=2026-08-27T07:00` — Thursday morning, Místico
- `?t=2026-08-28T16:30` — Friday dinner decision
- `?t=2026-08-27T14:20` — slow afternoon
- `?t=2026-08-29T09:00` — departure day

Without the parameter the app uses real time, always evaluated in `America/Costa_Rica`,
so Today is correct before you fly as well as after.

## Editing the trip

Everything lives in `data.js`:

- `PLACES` — one entry per attraction/restaurant. `drive` is stored minutes from Los Lagos,
  `tags` are keys from `TAGS`, `weather.window` is the hour range used for the go/reassess signal,
  `confirm: true` prints the "confirm before you go" flag.
- `ITINERARY` — one row per scheduled item. Leave-by is derived, never stored.
- `PACKING`, `NOTES` — plain arrays.

`art.js` maps an `art` key to an SVG scene. Adding a place means picking an existing key
or drawing a new one.

## What is live and what is not

| | Source | On failure |
|---|---|---|
| Weather | Open-Meteo `/v1/forecast`, hourly precipitation probability + weathercode, 10.47/-84.64 | "Weather unavailable" + retry. No cached or invented number. |
| Exchange rate | `open.er-api.com/v6/latest/USD` | "FX unavailable" + retry. No hardcoded fallback rate. |
| Drive times | Stored averages | Always shown with `~` |
| Leave-by | start − drive − 15 min | Labelled "approx., no live traffic" |
| Prices / hours | Web search and review data | "Confirm current hours" flags in the UI |

Both fetches use a 6-second `AbortController` timeout.
