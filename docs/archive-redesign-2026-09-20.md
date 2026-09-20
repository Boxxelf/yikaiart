# Archive experience revision

## Shared visual language
Warm canvas #FCFAF5; newspaper #E4D4B4; ink #26231D; oxblood cloth #543A34; aged brass #B69B6A. Keep Source Serif 4 for headlines and long reading; Instrument Sans for navigation. New pages remain English. Source URLs stay in content provenance only, never as visitor exits.

## Reviews
An aged newspaper on a reading desk: fibrous grain, uneven browned edges, fold creases, restrained ink rules, original portraits and publication marks. Author selection remains adjacent; the selected article and supplied archival clippings are readable in the page. An enlarged reading mode retains the paper texture. All 13 articles use the complete user-supplied manuscript, preserving original wording, paragraph breaks, bylines and languages.

## Collections
Bring From the archive directly below the opening title, before the artwork catalogue. Use a visible featured archive spread, a horizontal document index and in-page selected document description. Every document remains independently zoomable. Follow with a compact featured collection and the categorized holdings. Remove all visitor links to the original site; retain metadata and provenance internally.

## Memories
A cloth-bound album with a framed cover, embossed title, visible board thickness, paper edges and a stitched spine. Closed on arrival; click to lift and open. Pages turn around the binding in CSS 3D with distinct front and back faces and moving shadows. Pointer dragging can scrub a page turn; arrow controls and reduced motion provide equivalent navigation. Photographs remain real buttons and can still be inserted into the computer.

The enlarged screen becomes a vintage desktop browser, framed by the CRT housing. Window title, menu strip, back/forward history, simulated local address, photo navigation and a directory of all 28 memories. Choosing another photo keeps the browser open and updates the computer on return. The address is clearly simulated and does not send visitors to another website.

## Acceptance
No old-site links in Reviews or Collections; complete local image assets; explicit caption provenance; cover/open/close and forwards/backwards page turns; keyboard and touch access; no interaction during page-turn completion; no unmounted timers; full-size memory browser with history and album directory; retained computer rotation and insertion animation; mobile and reduced-motion checks.

## Implemented content status
All 13 review image entries are hosted locally, including replacement official museum/publication marks for broken source URLs. The supplied December 1998 Gallery Guide clipping is readable within Reviews. All 13 articles now show the full supplied review text, including the complete Ruth Appelhof passage and four Chinese originals. There are no visitor links to the old Reviews or Collections website.

The 10-document archive appears before the featured holding and 16-record catalogue. Its selected scan and complete English introduction are visible directly on the page, with a scrollable document index and an enlarged image reader.

The photo album uses CSS 3D perspective, cloth boards, paper edges, a hinged cover and two-sided page leaves. It opens from a closed cover, supports pointer page turning and accessible pagination, and preserves the selected spread when closed. The enlarged memory viewer is a CRT-framed local browser with simulated address, history, reload, previous/next photographs and a 28-photo directory.

Validation: production build and image checks passed. All 19 affected-page browser tests passed (18 on the first run; reader focus restoration fixed and individually rerun). Desktop, mobile, reduced-motion, English-only text, local assets, keyboard use, album page dragging and browser history were checked. Live publication was unchanged at that stage.

## Desk composition — September 20 update
The computer is the central object on a shared, quiet desk plane. A smaller closed cloth album lies at its left foreground, with visible paper thickness, perspective and a soft contact shadow. On phones the album sits below the computer, separated from rotation and reading controls.

Selecting the cover lifts the album from its actual desk position into a centered, enlarged spread. The desk recedes behind a translucent backdrop. The album retains four photographs per spread, page-edge dragging, pagination, category filters and the previous page when put back. Selecting a photograph returns the book to the desk before the card insertion begins; the miniature album is the card's origin. Escape, the backdrop and “Put album back” all return it to the desk and restore keyboard focus. Reduced motion skips the lifting and returning transforms.

The computer pauses while the album is open. The enlarged CRT browser and all 28 photographs remain available. These layout changes are in the local preview; no new public deployment was performed.

Validation for the desk revision: all 15 affected browser scenarios passed (13 initially; page-edge test synchronized with pickup motion, native photo dragging deferred until drag-image capture, and both scenarios passed their targeted reruns). Production build and catalogue/image validation passed. Visual checks covered the desktop composition and the mobile desk and enlarged album.

## Album positioning and expanded About — September 20
Removed the label below the desk album and shifted the default desktop placement 90 pixels left. The album now supports bounded pointer dragging with a six-pixel movement threshold so releasing a drag never opens the book. A later click lifts it from its new position; closing returns it there. Arrow keys move it, Home restores the initial position, and resizing resets placement to keep the album reachable. Mouse and touch share this behavior.

About now uses the same cream canvas as the other pages. The bookshelf remains the opening experience, followed by the complete user-supplied three-paragraph artist statement, collecting introduction, and 90 entries across Special Collections, Group Exhibitions, Solo Exhibitions, Awards, Publications and Teaching. A desktop section index and mobile links navigate the complete on-page records. The existing chapter reader remains intact.

Reviews at the album-positioning stage retained labeled summaries. This is superseded by the complete user-supplied manuscript update below. No public deployment was made in that revision.

Validation for this revision: production build and asset validation passed. All 15 relevant browser scenarios passed, including desktop and touch album movement, pickup/return, keyboard movement, memory loading, fallback/reduced motion, all 90 career entries, accessibility, and all seven original bookshelf chapters. The rapid-selection test now checks the final selected photograph instead of a timing-dependent temporary queue label. Desktop and mobile layouts were visually checked.

## Complete Reviews manuscript — September 20
Replaced the summaries with all 13 supplied reviews (26 original paragraphs) in `review-texts.json`. Preserve the supplied spelling and punctuation; decode the ARTNEWS trailing space entity. Retain all author credentials, original Chinese signatures, dates, and parenthetical source notes. English names remain in the review navigation; original bylines appear at the end of each article. Chinese text has explicit language metadata and a serif fallback suitable for CJK text.

The newspaper and enlarged reader share the same complete article component. No source-site exits or summary labels remain. Existing locally hosted review imagery and related archive scans are retained. Long-text layouts use readable line lengths; mobile portraits precede the text rather than narrowing the first paragraph. Changing the article in the enlarged reader returns to the top and focuses its heading. Publication has not been changed.

Validation: all nine editorial/full-text browser scenarios passed. Every article’s rendered paragraphs match the supplied data, all review images load, original bylines and Chinese language metadata are present, mobile layouts fit at 320px, reader changes reset scroll/focus, and accessibility checks pass. Desktop English and mobile Chinese newspaper layouts were visually checked. Production build, 13-review/26-paragraph validation, and asset checks passed.
