# Yi Kai Art

https://boxxelf.github.io/yikaiart/

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

## Memories

`/memories` places an opaque vintage CRT computer on a transparent canvas beside a four-photo-per-spread album. Click or keyboard-activate a photograph to start its 2.8-second insertion and screen reveal directly; dragging a print into the slot also works. During an insertion, further choices keep only the latest photo in the queue. The card lifts from the clicked print, arcs toward the slot, and slides in as the screen reveals its photograph and English description.

Drag the computer horizontally to rotate it through 360 degrees, or vertically with a mouse to tilt it. Touch surfaces allow horizontal rotation and vertical page scrolling. Rotate-left/right buttons and Reset view offer keyboard alternatives. The screen stays attached to its housing and is hidden behind the computer; a tap opens the enlarged reader, while a drag never does. Insertion gently returns the computer to the front. Replay, Skip animation and previous/next memory controls remain available. On narrower screens the album sits below the computer. Direct links use `/memories?photo=<id>`.

Rendering stops when the scene is stationary, offscreen or behind the reader. Shadow maps update during card movement only; displayed album photos are prefetched. Production builds copy the validated art and Memories catalogues, excluding unreferenced sync-conflict image duplicates without modifying source files.

The archive contains 28 images: 27 photographs and one exhibition poster. Handwritten notes I and II and their generated web assets were removed as requested. Descriptions are English only; original captions and review notes remain in the source catalogue for provenance. English captions use neutral wording where identities or source descriptions are uncertain. No uncertain identity was inferred from a face.

Regenerate the 400px thumbnails and 1600px display images without changing the originals:

```sh
npm run prepare:memories -- '/path/to/Photos of Openings'
```

The 56 Memories derivatives retain the supplied photos and poster. Images retain their aspect ratio and are never enlarged beyond the original resolution. The build validates all memory IDs, category counts, captions and image paths. The computer and animation are authored for this site, informed by [Gemos Still](https://github.com/duoduoaiduoduo/gemos-still); no reference branding, demo media, reconstruction models or application source were copied. There is no Gaussian reconstruction, upload, export or film generation. WebGL failure falls back to a CSS computer, and reduced-motion preferences skip the insertion animation while keeping the same content and controls.

## Reviews and Collections

Reviews presents 13 complete user-supplied perspectives from 1987–2015, preserving the original English and Chinese text, bylines and years. The aged newspaper page and enlarged reader show the full text with locally hosted imagery. No visitor links lead to the old website. Direct entries use `/reviews?review=<id>&read=1`.

Collections contains 16 holdings from Yi Kai Studio and all 10 supplied additional photographs in the prominent **From the archive** section before the holdings. Every added photograph has an English introduction. Filter holdings by institution, gallery, corporate/hospitality or private ownership; click any image for a full-proportion reader with zoom and previous/next navigation. Direct entries use `/collections?collection=<id>`, with optional `type` filters. Both routes have static entry files for refreshes.

The 26 images have 680px thumbnails and display derivatives bounded to 1800px, with no upscaling. Build validation verifies 52 image assets and English archive captions. Original photographs are unchanged. See [caption inventory](docs/collection-additional-photos.md) and [design document](docs/reviews-collections-design.md). To regenerate, run `npm run prepare:collections -- <downloaded-source-directory> <additional-photo-directory>`; the first directory should contain `images.json` (source URL list) and numbered `collection-01.*` through `collection-16.*` originals. Source image URLs are also retained in `src/content/holdings.json`.


### September 20 archive revision

Reviews now uses aged newspaper stock and locally hosted review imagery; source-site exits are removed. All 13 reviews now contain the complete user-supplied text and original bylines, including four original Chinese reviews. The newspaper page and enlarged reader both show the complete articles with local imagery and related archival clippings.

Collections starts with **From the archive**, including a selected document, its complete English introduction and a browsable strip of all ten documents. Holdings and their collection metadata remain further down the same page; all image readers stay on this site.

Memories opens with a cloth-bound CSS 3D album. Click the cover to lift/open it, use page arrows or drag a page edge to turn leaves, and click a print to start the computer insertion. The enlarged CRT includes a simulated local browser with address field, back/forward history, reload, photograph navigation and the complete 28-photo directory. Closing the browser leaves the last viewed photograph on the computer. Reduced motion uses immediate transitions.

About now uses the shared cream background and includes the complete supplied artist statement, collecting introduction and 90 career entries below the bookshelf. The desk album can be repositioned by mouse, touch or arrow keys; Home resets it. The Reviews reader navigation covers the full top edge while scrolling.
