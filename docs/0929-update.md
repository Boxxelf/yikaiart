# September 29 website update

- Added The Fragmented Self #6–#13 to the beginning of NOW. Each is oil on canvas, 27.5 × 35.5 in. NOW contains 34 works; the full archive contains 121.
- Corrected The Fragmented Self #3a to #3, preserving its existing URL and source filename.
- Desktop and mobile Works open on Mickey Opera Players with Masker. Mobile has a short, skippable painting reveal, directional swipe navigation and reduced-motion support.
- Mobile About uses a scroll-snap bookshelf, large covers, chapter previews and previous/next controls. Readers scroll independently beneath their return button and reset their scroll position when changing chapters.
- Replaced symbolic UI arrows, rotation controls and close controls with shared SVG icons. Copyright and registered-trademark typography remain ordinary text.
- Moved Memories rotation/reset controls below the whole desk, separate from the computer and movable album.
- Updated 11 Memories captions and both About photographs from the owner-confirmed notes. The first Taipei photograph documents exhibition preparation, not the opening itself. Updated the archive range to 1984–2026.
- Added Walzer Melcher LLP; the 2026 exhibition at 825 Gallery, Los Angeles Art Association; and the confirmed teaching institution names.

## Caption decisions

The supplied spelling “Professor John Aken” and designation “Chairman Kim” are retained. No surname or identity was inferred for Chairman Kim or the bank CEO.

For the 1990 photographs, Leonard Woodcock is described as a **former** U.S. Ambassador to China and Walter Mondale as a **former** Vice President. Their relevant terms ended in 1981:

- https://history.state.gov/departmenthistory/people/woodcock-leonard-f
- https://www.senate.gov/art-artifacts/fine-art/sculpture/22_00041_000.htm

The photograph identities, exhibition context and other names follow the owner's supplied captions; these were not independently authenticated from faces.

## Assets and regeneration

`node scripts/import-0929.mjs /path/to/0929` imports the eight supplied JPGs idempotently and generates 480, 960 and 1920 px WebP derivatives without modifying the originals. The old `prepare:art` command rebuilds the original 0910 catalogue; run the 0929 import after it to retain these additions.

The original iCloud-offloaded dependency directory is preserved as `.node_modules-offloaded-0929` (ignored). The locked dependencies are installed in `/Users/tinajiang/.cache/yikaiart-0929-dependencies/node_modules`, outside iCloud, and linked from the project’s `node_modules`. This avoids stalled placeholder reads. `package.json` and `package-lock.json` are unchanged.

## Verification

- Production build completed, including validation of all catalogues and generation of static route entry points.
- 31 Playwright checks passed against the production preview: Works, About, Memories, Reviews, Collections, mobile interactions, deep links, keyboard focus, reduced motion, missing WebGL, error recovery and accessibility.
- All 363 built artwork derivatives match their source derivative file sizes; no temporary image writes remain.
- Preview: http://127.0.0.1:4173/works
- No online deployment was performed.
