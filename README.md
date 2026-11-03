# Penguin Ops — Reza Bojnordi

An original playable portfolio in English and Persian. Explore a snow island as Pip, a little Linux-loving penguin, and discover six chapters of Reza's résumé. Switch between a perspective 3D world and a 2D map without losing your position or progress.

**Only HTML, CSS and JavaScript. No backend, build step, package installation, API key, WebGL requirement or CDN.**

## Open it

Open `dist/index.html` directly in a browser. In the ready-to-upload GitHub Pages ZIP, `index.html` is already at the root, so open that file instead. All fonts, scripts, geometry and original résumé PDFs are included locally.

## Publish on GitHub Pages

1. Create or choose your GitHub repository.
2. Put the **contents of `dist/`** at the repository root. For the supplied ZIP, extract it and upload its contents directly. `index.html`, the JavaScript/CSS files, `.nojekyll` and `assets/` must sit at the same level. Keep filenames and letter case unchanged.
3. In the repository, open **Settings → Pages → Build and deployment**.
4. Set **Source: Deploy from a branch**, select **main** and **/ (root)**, then save. If your branch has another name, select that branch.
5. Once GitHub completes publication, use the website link shown on that Pages screen.

Relative asset paths support both a user site and a project site under a repository subpath. Do not add a leading `/` to asset URLs. No custom GitHub Actions workflow is required for branch publication. `.nojekyll` bypasses Jekyll processing.

Official setup: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

GitHub publication is performed in your own repository; this package does not create or modify a GitHub repository automatically.

## Northern Rally update

The expanded island has a coastal circuit, a garage, an original motorcycle and helmeted penguin rider, three jump ramps, solid barriers, knockable traffic cones, an ice pond and 24 collectible data chips. Walk or ride between the six résumé stations. Start a timed lap, visit the eight highlighted gates in order and beat your personal best. Records and collected chips are saved locally in this browser; there is no shared leaderboard.

Arcade driving includes acceleration, steering, reverse, braking, rechargeable boost, collision response and ramp launches. On foot, movement remains camera-relative; on the motorcycle, left/right steer and up/down control forward/reverse. Click the map or a station for automatic navigation, or use movement keys to take over.

## Controls

| Action | Control |
|---|---|
| Walk | WASD or arrow keys |
| Jump | Space |
| Slide / boost | Hold Shift while moving; motorcycle boost recharges when released |
| Mount / dismount | F or Ride motorcycle / Hop off |
| Motorcycle throttle / reverse | W / S or up / down |
| Motorcycle steering | A / D or left / right |
| Brake | B or mobile Brake button |
| Start / end timed rally | T or Start rally / End lap |
| Read nearby station | E or Enter |
| Rotate the camera | Drag the scene, or use the rotate buttons |
| Zoom | Mouse wheel or + / − buttons; pinch on touch screens |
| Whole island / follow camera | House button |
| Switch 3D / 2D | Top toggle or M |
| Return to the starting point | R |
| Walk to a point | Click or tap the ground |
| Walk to a station and open its résumé chapter | Click its label or select it from the station list |
| Close a panel | Escape or × |

Mobile has a direction pad, jump, boost, brake, mount/dismount, a mini-map and an expandable mission log. Tap the language button to switch the interface and career content. The résumé shortcut works without playing or completing any mission.

## Story

A fictional outage has disconnected the Northern Network. Pip visits Terminal Camp, Cloud Harbor, Validator Ridge, Automation Grove, the Observatory and Knowledge Peak. Each place reveals relevant career experience and an optional short challenge. Reconnecting all six lights the central beacon. Game scenarios are illustrative and are not production runbooks.

## Customize

| File under `dist/` | Purpose |
|---|---|
| `content.js` | Both languages, career history, skills, links and mission answers |
| `index.html` | Page shell, landing copy, metadata and PDF links |
| `style.css`, `adventure.css`, `rally.css` | Responsive design and Persian presentation |
| `engine.js` | Original software 3D renderer: perspective projection, clipping, lighting and face ordering |
| `world.js` | World geometry, motorcycle, rider, input, follow camera, races, collectibles and map |
| `game-core.js` | Deterministic driving, collisions, ramp physics, routing and gate progression |
| `app.js` | Résumé panels, quizzes, language, saved progress and background music and synthesized game sounds |
| `assets/` | Original résumé PDFs, local font, font license and penguin favicon |

The 3D renderer projects actual XYZ models onto Canvas 2D. It is intentionally a small stylized software renderer, not a WebGL engine or a full physics simulation. Artwork and code are original; the reference site's assets and source were not copied.

Progress and language are stored only in this browser's `localStorage`, when available. Reset is in the field guide. Ambient animation respects reduced-motion preferences and can be paused. The original 96-second instrumental “Northern Lights” starts on the first Enter the world click and loops. The music button pauses/resumes it; hover or focus the button for volume. Mute and volume preferences persist. Music pauses while the tab is hidden. There are no analytics, cookies, network APIs or external runtime assets.

Career facts come from the two supplied résumés. CKA is described as **course completion**, not an exam certification. Credentials and profile links are transcribed from the original PDFs; they are not independently verified. Update `content.js` and PDFs as your career changes.

## Validation

Run `node tests/game-core.test.cjs` and `node tests/world.integration.cjs` from the source checkout. The standalone ZIP includes these checks under `tests/`; the test script resolves either layout. They exercise vehicle movement, brakes, boost, collision tunnelling, ramp launches, all six station routes, a full eight-gate lap, saved best time and bilingual state.


JavaScript syntax, local asset references, 3D rendering, camera controls, switching to 2D, station navigation, résumé access and the six-mission flow are checked in Chromium. Persian/mobile layout is checked in a 390 × 844 CSS-pixel frame; this is not a physical-device test. GitHub Pages account settings and a custom domain are outside the package.
