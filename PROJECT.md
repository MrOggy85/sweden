# Sweden — design contract

## What this is

A web app for children to explore facts about Sweden: the flag, the map, Stockholm, fika,
midsummer, animals, a few words of Swedish, winter. A kid picks a name and an animal
avatar, taps through topics, and the app remembers where they have been.

It exists because a list of facts is boring and a thing you can poke at is not.

## What the server is for

Two jobs, both persistence:

1. **Who is using it** — a nickname and an avatar, per profile. Several profiles per
   device, because the target device is a shared iPad.
2. **What they have looked at** — an append-only log of page interactions, plus per-page
   counts so the UI can show which topics have been explored.

There is no simulation, no real-time shared state, no multiplayer. The server is a
persistence layer with a static file server attached.

## Architecture

Copied deliberately from [elevatore](https://github.com/MrOggy85/elevatore):

- `api/` is a Deno process using `Deno.serve` and JSR stdlib, with zero npm dependencies.
- `client/` is React 18 with CSS Modules, bundled by esbuild driven from Deno, output
  written into `api/client/` and served by the api as static files.
- One origin, one port, no proxy, no CORS, no dev server. `DEV=1` makes `api/main.ts`
  spawn the esbuild watcher as a child process, so one command starts everything.

Hosted on **Deno Deploy**, deployed manually with `deployctl`. There is no deploy
workflow; `.github/workflows/claude.yml` is the only CI, and it exists so that features
can be requested as GitHub issues.

### Why the elevatore shape but not its engine

elevatore keeps a mutable world in memory and pushes snapshots over SSE from a 10 Hz
`setInterval`. That works on a persistent process and **does not** work on Deno Deploy,
where isolates are reclaimed when idle. So the file layout, routing style, build pipeline
and visual language carry over; the tick loop does not. Anything periodic in this app must
be request-triggered.

## Data model

Deno KV, chosen because it is built into Deno Deploy with nothing to provision. Local
development uses a SQLite file at `api/.data/kv.sqlite3` via `KV_PATH`.

| Key | Value | Purpose |
| --- | --- | --- |
| `['user', userId]` | `User` | nickname + avatar |
| `['device', deviceId]` | `Device` | which profiles are on this device, and which is active |
| `['visit', userId, at, seq]` | `Visit` | append-only log, expires after 180 days |
| `['pageStat', userId, pageId, 'c']` | `Deno.KvU64` | per-page count |
| `['pageStat', userId, pageId, 't']` | `number` | per-page last seen |
| `['userTotal', userId]` | `Deno.KvU64` | total interactions |
| `['pageTotal', pageId]` | `Deno.KvU64` | global popularity across all users |

Three decisions worth not undoing:

- **The log is a rolling window; the aggregates are the durable state.** Visits expire
  after 180 days, counters never do. Storage is therefore bounded by traffic rate rather
  than by lifetime, and long-term progress survives log expiry.
- **Every counter mutation is blind** (`sum`, no `check`), so a write never fails on a
  versionstamp conflict. This matters most for `['pageTotal', pageId]`, a global hotspot
  where read-modify-write would produce conflict storms.
- **Count and last-seen are sibling keys, not one object**, because `Deno.KvU64` cannot be
  nested inside a value. One prefix scan still returns both for every page.

One interaction is one atomic commit of five mutations — a single round trip.

## Identity

A single `HttpOnly` cookie holding a device id: 128 random bits, 22 base64url characters.
The active profile lives server-side in `Device.activeUserId`, not in the cookie, so
switching profiles is one server-side write that cannot desync.

No password, no email, no login. The credential is the cookie, and its validity is proven
by a KV lookup — which means there is no server secret to provision.

Consequences, accepted:

- **No cross-device continuity.** The same child on a different iPad is a different
  person. Adding it needs either real auth or a resume code.
- **Losing the cookie orphans the profile.** Private browsing, clearing site data, or
  browser storage eviction will strand profiles. Progress here is not precious.
- **No parent or teacher view** is possible without real auth.
- **Preview deployments have their own cookie jar**, so test profiles do not carry from a
  preview URL to production.

## Non-goals for v1

- No login, no accounts, no email, no passwords.
- No real names, ages, photos, or avatar uploads. Avatars are an allowlisted set of
  inline SVG shapes; there is nothing to moderate and nothing to leak.
- No multiplayer, no shared live state, no SSE.
- No sound.
- No offline/PWA support.
- No cross-device sync.
- No test framework. `deno check` and `tsc --noEmit` are the only automated gates.

## Abuse surface

Every write endpoint is unauthenticated: anyone can mint a device, create profiles, and
record visits. There is nothing worth stealing and no cross-profile read path, so the real
exposure is **unbounded KV growth and write quota consumption**.

What defends it today:

- Everything spammable has a TTL — visits 180 days, empty devices 7 days.
- Hard caps: 8 profiles per device, 24-character names, 2 KiB request bodies.
- `pageId` must be in the `PAGE_IDS` allowlist. This is the most important validation in
  the app: `pageId` becomes part of a KV key, so accepting an unknown one would let any
  client grow the key space permanently.

What is **not** built yet, and would be the first thing to add under real traffic:

- Per-profile daily write caps (`['rate', userId, dayNum]` as a summed `KvU64`).
- Per-IP profile-creation caps (`['mint', ipHash, hourNum]`). Note that
  `x-forwarded-for` is client-controlled, so this only raises the cost of casual abuse.

## What is logged

`api/server.ts` writes one structured line per request containing method, path, status,
duration, user agent, **the raw client IP**, and the active `userId`. Nothing is written to
KV; this is stdout, so on Deno Deploy it lives in Deploy's log retention.

This is a deliberate decision, not an oversight. It matches ordinary access-log practice
and is the main tool for debugging a specific session or spotting abuse from one network.
The cost is worth stating plainly: an IP alone is transient and a `userId` alone is
pseudonymous, but the pair links a home network to a named child profile for as long as
logs are kept. If that ever becomes unacceptable, log `SHA-256(ip + IP_SALT)` truncated
instead — that keeps "these requests came from one network" while dropping the network
identity.

The device cookie is **never** logged. It is a bearer credential; `userId` is logged in its
place, which is what makes the logs useful without making them a way in.

**Moderation is deliberately out of scope**, with a trigger condition: the nickname is the
only free text, and it is shown only to the child who typed it. If a leaderboard, shared
gallery, or any cross-user display of names is ever added, a word filter and a report path
become mandatory before shipping.

## Visual language

Comic/sticker style, inherited from elevatore: `1.5px #1c1c1c` outlines on everything,
`border-radius` 10–14px, hard offset shadows (`box-shadow: 0 4px 0 #1c1c1c22`) rather than
soft blurs, and inline SVG figures instead of image assets.

Palette: cream `#fdf6ec` page, `#fff3d6` panels, Swedish blue `#005293` and yellow
`#fecc00` as accents. Avatar colours come from the eight-entry `COLORS` map.

Touch targets are at least 44px, since the target devices are an iPad and an iPhone.
