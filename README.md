# Yi Kai Art

An English-language portfolio for Chinese-American contemporary artist Yi Kai. Built from the artist's 113 supplied works and biography, following the approved Works / About specification.

## Run locally

Requires Node.js 22.12 or later.

```sh
npm ci
npm run dev
```

Open the printed HTTP address (normally `http://127.0.0.1:5173`). The source `index.html` is not a standalone website: opening it using `file://` does not load React or the artwork routes.

## Pages

- `/works`: 12 approved featured works in an interactive, off-screen ring. Scroll, drag, or use the arrow buttons. Clicking a neighbouring work focuses it; clicking the focused work opens its complete image.
- `/works?view=archive`: all 113 works.
- `/works?series=now`: a filtered collection. The remaining IDs are `robot-ai`, `opera-players`, `agree-to-disagree`, `tibet`, and `land`.
- `/works?work=<id>`: an individual work; links survive refresh.
- `/about`: seven tactile books, each with its own spine, cover, page block, and opening hinge. Select a book, then activate it again to read the chapter. Escape returns it to the shelf.
- `/about?chapter=dialogue`: directly opens a chapter; `/about?read=biography` opens the unabridged supplied biography.
- `/biography.html`: generated, script-free text biography.

## Content

`src/content/works.json` maps every supplied file to a stable ID, collection, image derivatives, title, dimensions when available, and the approved featured order. Totals: NOW 26, ROBOT / AI 18, OPERA PLAYERS 18, AGREE TO DISAGREE 14, TIBET 18, LAND 19.

The first edition displays only title, series, and dimensions. Dimensions are read in the order used in the filename and labelled in inches. Fractional dimensions are normalized (e.g. `15 1_2 x 13` becomes `15.5 × 13 in`). The one file explicitly labelled `8x10 ft` is converted to `96 × 120 in`. Nine filenames have no dimensions; those fields are omitted. No medium, date, availability or sale information is invented. Titles follow the source filenames with only identifier/size/extension cleanup.

All five Photoshop documents were exported from their saved composite images using macOS `sips`. The originals remain untouched. Review their flattened appearance against the originals when replacing a source document.

The two authorized photographs remain uncropped; captions identify Yi Kai at left in `IMG_7587` and at right in `IMG_7581`. The biography is reproduced from the supplied text, including its original relative-age wording. No dates have been inferred to revise it.

To regenerate image derivatives on the material owner's computer:

```sh
npm run prepare:art -- /path/to/the/0910/folder
```

The source directory must contain `Selected Works`, `Photos of Openings`, and `About Yi Kai.txt`. All 113 works have 480, 960 and 1920 pixel WebP derivatives with sRGB conversion. The app includes no original PSDs and does not need access to the source directory at runtime.

## Validation

```sh
npm run build
npm test
```

The production build validates all catalogue totals, 339 artwork derivatives, featured ordering, five PSD entries, and fractional/feet dimensions. Browser tests use a locally installed Google Chrome with Playwright. They cover the ring, individual artwork display, all series counts, all seven book chapters, mobile reading, reduced motion, WebGL failure, URL navigation, English UI, and an axe accessibility audit.

## Hosting

### GitHub Pages

```sh
VITE_BASE_PATH=/yikaiart/ npm run build
```

Publish the contents of `dist` to the `gh-pages` branch and set Pages to deploy from that branch's root. The production path is `https://boxxelf.github.io/yikaiart/`. The generated `works/index.html`, `about/index.html`, `404.html`, and `.nojekyll` support direct entry and refresh. A GitHub Actions alternative is provided in `deploy/github-pages-workflow.yml`; move it to `.github/workflows/pages.yml` only when that workflow is desired and the account credential allows workflow changes.

### Vercel

Import the `Boxxelf/yikaiart` repository into Vercel using its Vite preset. `vercel.json` defines the build, output directory and client-side routing. Leave `VITE_BASE_PATH` unset for a root-domain deployment.

`yikaiart` is the project name, not a complete custom domain. No `.com` or other domain is invented or purchased. Configure a complete owned domain when available.

## Design and source acknowledgements

- [Ice-works-showcase](https://github.com/tiffanydesign/Ice-works-showcase): reference for the off-screen ring, fluid image joins and restrained metadata composition. The Yi Kai ring is a purpose-built React/Three.js implementation with a compact signed-distance shader.
- [Ice-Paperbound](https://github.com/MegD1/Ice-Paperbound): reference for the shelf arrangement, physical bindings, tactile materials and book extraction/opening sequence. This site's book models and procedural texture code were authored for Yi Kai.
- Fonts: Instrument Sans and Source Serif 4, distributed through Fontsource under the SIL Open Font License. License texts are retained in `licenses/`.
- Artwork, photographs and supplied biography: © Yi Kai, all rights reserved. Permission to publish this portfolio is not a general license to redistribute those materials.

## Accessibility and resource use

On mobile, reduced-motion settings or unavailable WebGL, the same works and chapters remain available in 2D. Native HTML dialogs provide focus containment and Escape handling. Written content stays in HTML, including full biography and chapter text. Only the twelve selected works enter the ring atlas; the 113-work archive loads ordinary images on demand. The scenes pause rendering when the tab is hidden or a reading/detail dialog is open.
