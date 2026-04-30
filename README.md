# 🛡️ TITAN: Gamified Teen Goals

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
- **Persistence**: SQLite bootstrap for the current MVP, with a writable `TITAN_DB_PATH` required for hosted deployments
- **Design System**: Custom gamer UI with a high-contrast palette (`#230c0f`, `#1b4965`, `#ee4266`, `#ddd8b8`)

## Local development

```bash
cd source
cp .env.example .env.local
npm install
npm run db:init
npm run dev
```

The default local database path is `./data/titan.local.db`. Override it with `TITAN_DB_PATH` if you want to keep the SQLite file somewhere else.

## Deployment

The current hosted MVP target is a **Node.js host with a persistent volume**. Because TITAN still uses `better-sqlite3`, a hosted environment must provide a writable SQLite path through `TITAN_DB_PATH`.

- **Works now**: Docker/VM/Railway/Render/Fly-style Node deployment with persistent disk
- **Not ready yet**: Vercel production deployment with writable persistence

See `docs/DEPLOYMENT.md` for the full release flow and environment setup.

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
