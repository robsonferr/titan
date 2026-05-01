# 🛡️ TITAN: Gamified Teen Goals

![release](https://img.shields.io/badge/release-stable--v2026.4.30-3b82f6?style=flat-square)
![CI](https://img.shields.io/badge/CI-passing-22c55e?style=flat-square&logo=github&logoColor=white)
![Cloudflare](https://img.shields.io/badge/Workers%20%2B%20D1-deployed-f38020?style=flat-square&logo=cloudflare&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16.2-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![security](https://img.shields.io/badge/security%20audit-P0%2FP1%20closed-22c55e?style=flat-square)
![license](https://img.shields.io/badge/license-MIT-a78bfa?style=flat-square)

**TITAN** is an open-source, mobile-first WebApp for turning adolescent goals into a game loop. Instead of being locked to one health-treatment routine, TITAN uses structured templates, daily quests, monthly Boss pressure, and loot-style rewards to make consistency feel more like progression than obligation.

## 🚀 The Mission

Adolescents usually juggle study blocks, movement, sleep routines, and personal responsibilities at the same time. **TITAN** reframes that routine as a playable command deck: the user becomes a **Pilot** managing a daily run, protecting streaks, and unlocking rewards through execution.

## 🎮 Key Features

- **Template-Driven Goals**: The current foundation supports structured templates that define daily core quests, success rules, and long-arc progression.
- **Daily Quest Log**: Each day is tracked as quest progress, not as hardcoded domain columns, so the same system can power health, study, or sport routines.
- **Featured Goal Meter**: Incremental quests can expose quick-add progress options like Pomodoro blocks, reading bursts, or similar repeatable actions.
- **Monthly Boss (OKR System)**: The Boss uses a monthly engagement score and a template-defined success rule to show whether the current routine is holding above the threshold.
- **The Loot Shop**: Real-world rewards can remain standalone or be linked directly to quests.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Runtime / Deploy**: Cloudflare Workers via [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare)
- **Persistence**: Cloudflare D1 (`TITAN_DB` binding)
- **Design System**: Custom gamer UI with a high-contrast palette (`#230c0f`, `#1b4965`, `#ee4266`, `#ddd8b8`)

## Local development

```bash
cd source
npm install
npm run db:setup:local
npm run dev
```

Use `npm run preview` when you want to validate the app inside the actual Workers runtime instead of the standard Next.js dev server.

## D1 workflow

```bash
# apply schema + seed to the local D1 database used by wrangler dev / preview
npm run db:setup:local

# apply schema + seed to the remote Cloudflare D1 database
npm run db:setup:remote
```

The Worker expects a `TITAN_DB` D1 binding declared in `wrangler.jsonc`. Regenerate typed bindings after Wrangler config changes with:

```bash
npm run cf-typegen
```

## Deployment

TITAN now targets **Cloudflare Workers + D1**.

```bash
npm run deploy
```

See `docs/DEPLOYMENT.md` for the full D1 migration, binding, and release flow.

## 🤝 Contributing

As an open-source project, we welcome contributions from:

- **Developers**: Help us improve the UX/UI or expand template and management flows.
- **Educators / Coaches / Parents**: Suggest templates and reward mechanics that work for adolescent routines.
- **Designers / Gamers**: Push the interface further into a playful, high-feedback experience.

## Support

If you find 🛡️ TITAN useful, consider buying me a coffee:

<a href="https://buymeacoffee.com/robsonferr" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" width="180"></a>

## License

[MIT](LICENSE.md)

## Author

Built with 🤟 by Robson
