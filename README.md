# Leonida Field Guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/RaynaldyRyan/leonida-field-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/RaynaldyRyan/leonida-field-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline trophy guide and tracker for Grand Theft Auto VI on PlayStation 5: all 55 official trophies (1 platinum, 2 gold, 6 silver, 46 bronze) with a cited guide for every one, a checklist that saves progress in the browser, a four-phase roadmap to the platinum, and a missables page.

## What it does

- **Checklist of all 55 trophies** with the exact official name, description and grade. Tick trophies as they pop; progress is saved in localStorage.
- **Export and import** progress as a JSON file, so a save can move between browsers.
- **Filters** by grade, by kind (story / misc / activity / combat / collectible) and by earned status, plus a search box.
- **Spoiler setting (on by default)** that hides story trophies' names and descriptions until they are earned.
- **A guide for every trophy**, written in our own words, with a **Sources:** line beside each one naming where the facts come from (PowerPyx, Exophase, PSNProfiles, KeenGamer). Where a step cannot be verified yet — the game released 19 November 2026 and the guides are a day old — the guide says so plainly instead of inventing locations or routes.
- **Roadmap to the platinum in 4 phases** (setup, story, cleanup, final checks) with a "do before advancing" callout. Only one trophy is flagged missable — #28 Positive Mental Attitude, the first meditation in Chapter 1 — and the rest carry "check before advancing" notes where a story choice is involved.
- **Deep links:** `?trophy=N` opens a trophy's guide, `?view=roadmap` or `?view=missables` jumps to a page, `?kind=X` filters, `?earned=1,2,3` pre-sets earned trophies for a demo.

## The platinum, in brief

About 200 hours, difficulty 4/10, one playthrough, no online trophies (PowerPyx). Story first (60–80 hours, five chapters), then the 100% completion checklist (about 100 hours), then stranger strands and cleanup (about 10 hours). There is no mission replay, so save manually at the start of every chapter — and do the Chapter 1 meditation before that chapter ends.

## Run it

```sh
node serve.ts
```

Then open http://127.0.0.1:8080/ in desktop Chrome. The app is static files under `app/` and works with the network off: every script, stylesheet and data file it loads is a local file under `app/`. Citation links open only when the reader follows them.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` validates the 55 trophies, copies `app/` and `screenshots/` to the output directory, and writes `dossier.json` with the kit's `buildDossier`.

---

<sub>Entered on [make.fun](https://make.fun/?ref=ryanraynaldy&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
