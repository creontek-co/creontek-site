# CreonTek website

Next.js (App Router), TypeScript, Tailwind, GSAP, Lenis and three.js. Built from [BRIEF.md](BRIEF.md).

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

## Before launch

Everything editable is in [lib/site.ts](lib/site.ts).

| Item | Where | Status |
|---|---|---|
| Real projects, images and screen recordings | `PROJECTS` in `lib/site.ts`, `/public/media/work/` | Placeholder cards, labelled on the page |
| Contact email | `CONTACT_EMAIL` | Placeholder: `hello@creontek.co` |
| Social links | `SOCIALS` | Empty, so not shown |
| Testimonials | `TESTIMONIALS`, then set `SHOW_PROOF` | Hidden until real quotes exist |
| Care plan prices | `CARE_PLANS` | Placeholder values |
| Studio process timings | `STUDIO_PROCESS` | Placeholder durations |
| Industry one-liners | `INDUSTRIES` | Only Home services comes from the brief |
| Final brand blue | `--blue` in `app/styles/base.css`, plus `BLUE` constants in the blueprint and 3D scene | Brief default `#2F5BFF` |
| Privacy and Terms | `app/privacy`, `app/terms` | Drafts: need legal review |
| Enquiry delivery | Environment variables, see `.env.example` | Not configured: the form shows an error until it is |

## Notes

- With `cacheComponents` on, Next.js hides routes with React `<Activity>` rather than unmounting them. Hidden pages stay in the DOM, so components use refs, never page-wide selectors, and effects must survive being re-run.
- The home preloader is decided by an inline script in `app/layout.tsx`, before first paint. It plays once per session on `/` only.
- Sound is off by default and is synthesised with the Web Audio API in `lib/sound.ts`, so there are no audio files. `components/shell/SoundDirector.tsx` wires it to every section: add new sections to its `SCENES` list.
- `public/media/env-room.bin.gz` is the 3D logo's reflection map, baked from three.js RoomEnvironment so the browser doesn't have to generate it. Re-bake it if you upgrade three.js and reflections look wrong; the scene falls back to generating it if the file fails to load.
