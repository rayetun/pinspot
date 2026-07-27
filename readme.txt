=== Pinspot — Interactive Image Hotspots ===
Contributors: rayetun
Donate link: https://wise.com/pay/me/mdrayhanu2
Tags: hotspot, image map, tooltip, interactive image, pins
Requires at least: 6.6
Tested up to: 7.0
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Turn any image into an interactive experience. Add hotspot pins with rich, accessible tooltips — text, media, video, links, zoom, and lightbox.

== Description ==

**Pinspot** turns a flat image into something people explore. Drop pins anywhere on a photo, map, diagram, or product shot — each pin opens a polished, accessible tooltip with a title, description, image or video, and a call-to-action button.

It is a single native block built the modern WordPress way — on the Interactivity API, the same technology that powers WordPress core blocks. No jQuery, no shortcodes, no page builder required. The frontend script is under 4 KB and only loads on pages that actually use a hotspot, so it never slows the rest of your site down.

Pinspot includes everything you need to build interactive images: unlimited hotspots, zoom & pan, image and video tooltips, a lightbox, import/export, and three starter patterns to help you get going quickly.

= What you can build =

* **Shoppable & product images** — call out features with numbered pins and “Buy now” buttons.
* **Team & about pages** — reveal names and roles on hover.
* **Maps, campus & floor plans** — a zoomable, pannable image with pins visitors can explore.
* **Infographics & diagrams** — explain each part in place, without cluttering the graphic.
* **Real-estate & travel** — annotate rooms, landmarks, and points of interest.

= Rich, flexible tooltips =

Every pin can carry a title, a description (with line breaks and basic **bold**, *italic*, and links), and one piece of media: an image from your library, a self-hosted video, or a YouTube / Vimeo embed. Add an optional call-to-action button that links anywhere. Choose light or dark tooltips, decide where they open (top, bottom, left, right, or automatic), and pick a marker style — numbered, dot, plus, info, or question — in any size and color, with an optional pulse or bounce animation.

= Accessibility built in =

Pinspot is designed to work for everyone, not just mouse users. Accessibility is built into how it works:

* **Fully keyboard operable** — every marker is a real button. Tab moves between pins, Enter or Space opens a tooltip, and Escape closes it and returns focus to the exact marker you opened it from, so you never lose your place.
* **Screen-reader ready** — each marker exposes proper `aria-expanded` and `aria-controls` state plus a descriptive label, so assistive technology understands what every pin does and whether its tooltip is currently open.
* **A full text alternative for the image** — turn on the optional hotspot list and every pin’s title, description, and link is also printed as a clean, ordered list beneath the image. Screen-reader users get all the information without having to interact with the graphic at all — and search engines can read it too, which is good for SEO.
* **Respects reduced motion** — if a visitor has “reduce motion” enabled in their operating system, every marker animation and tooltip transition is automatically switched off.
* **Accessible controls throughout** — the zoom buttons, the lightbox close button, and the video play button all carry proper labels.
* **Right-to-left ready** — full RTL language support is included.

= Start fast with block patterns =

New to hotspots? Pinspot ships three ready-made layouts you can insert and edit in seconds. In the editor, open the block inserter (the **+** button in the top-left), switch to the **Patterns** tab, and choose the **Pinspot** category. You will find:

* **Product showcase** — three numbered pins with call-to-action buttons, arranged over a product image. Great for shoppable images and feature callouts.
* **Team introduction** — hover-activated dot pins with dark tooltips, spaced for a group photo. Perfect for an about or team page.
* **Zoomable map tour** — a zoom-and-pan image with pulsing question-mark pins, built for maps, floor plans, campus guides, and infographics.

Each pattern drops in with a demo illustration and sample pins already in place. Just replace the demo image with your own and edit the text — it is the fastest way to see everything Pinspot can do and to learn how the pieces fit together.

= Everything lives on the block — there is no settings page to hunt for =

Pinspot deliberately has no separate admin dashboard. You configure everything right where you see it, using the standard WordPress block controls:

* **Block toolbar** — swap the image, or click **Add hotspot** and then click the image to drop a pin exactly where you want it.
* **Placing & moving pins** — drag any marker to reposition it, or select it and nudge with the arrow keys (hold Shift for larger steps) for precise placement.
* **Per-hotspot panels** — with a pin selected, the block sidebar (**Settings** tab) shows panels for its **Content**, **Media**, **Call to action**, **Marker** style, and **Behavior**.
* **All hotspots** — one panel lists every pin on the image so you can reorder, duplicate, or delete them at a glance.
* **Display settings** — set the trigger (click or hover), light or dark theme, tooltip width, the optional accessible list, and whether zoom & pan is enabled.
* **Import / Export** — save the whole layout as a JSON file and load it into another post, page, or site.

If you have ever placed a WordPress block, you already know how to use Pinspot.

= Privacy-first by design =

Pinspot makes no external requests on its own. YouTube and Vimeo tooltips show a lightweight preview image and only load the real player after the visitor clicks play — nothing is sent to Google or Vimeo until then. Your hotspot data is stored inside the block in your post content: no custom database tables, no tracking, no phoning home, and a completely clean uninstall.

== Installation ==

= From your dashboard =

1. Go to **Plugins → Add New** and search for **Pinspot**.
2. Click **Install Now**, then **Activate**.

= Manual upload =

1. Download the plugin ZIP file.
2. Go to **Plugins → Add New → Upload Plugin**, choose the ZIP, and click **Install Now**.
3. Activate the plugin.

= Add your first hotspot image =

1. Edit any post or page.
2. Add the **Pinspot — Image Hotspots** block (search for “Pinspot” in the inserter), or insert a **Pinspot** pattern to start from a ready-made layout.
3. Select or upload the image you want to annotate.
4. Click **Add hotspot** in the block toolbar, then click the spot on the image where the pin should go.
5. With the pin selected, fill in its title, description, media, and link in the sidebar.
6. Repeat for each pin, then **Publish**. There is no extra setup and no options page to configure.

== Frequently Asked Questions ==

= Is there a settings or options page? =

No — and you will not need one. Everything is configured on the block itself: the toolbar for adding pins and replacing the image, and the block sidebar for each pin’s content, style, and behavior. This keeps your admin uncluttered and your settings right next to the thing they change.

= Does it work with my theme? =

Yes. Pinspot is a standard WordPress block with its own self-contained styles, so it works with block themes and classic themes alike. It also respects your theme’s width settings, including wide and full alignment.

= How many hotspots can I add? =

As many as you like, on as many images as you like. There is no limit and no “pro” gate.

= Are the pins responsive? =

Yes. Each pin’s position is stored as a percentage of the image, so it stays anchored to the right spot at every screen size, from phones to widescreen displays.

= Can visitors open tooltips by hovering? =

Yes. You can set the whole block — or an individual pin — to open on hover instead of click. On touch devices, hover pins still open on tap, so mobile visitors are never left out.

= Is Pinspot accessible? =

Yes. Pins are keyboard-operable buttons with proper ARIA state, Escape closes a tooltip and restores focus to its marker, animations respect the “reduce motion” setting, and an optional list below the image gives screen-reader users and search engines a full text version of your hotspots. See “Accessibility built in” in the description for the details.

= Will it slow down my site? =

No. The frontend runtime is under 4 KB and only loads on pages that contain a hotspot block. There is no jQuery and nothing render-blocking.

= Does it load anything from YouTube or Vimeo automatically? =

No. Video tooltips show a preview thumbnail with a play button; the actual player only loads after the visitor clicks it. See the External Services section for exactly what is sent, and when.

= Where is my hotspot data stored? =

Right inside the block in your post content. There are no extra database tables and no leftover options, so removing the plugin leaves your site clean.

= Can I reuse a hotspot layout on another page or site? =

Yes. Use **Import / Export** in the block sidebar to download a layout as a JSON file and load it into another post — even on a different website.

= Is the source code available? =

Yes. The complete, un-minified source (JavaScript and SCSS) is included in the plugin’s `/src` directory alongside the compiled files in `/build`. The plugin is built with the standard WordPress tooling — run `npm install` and then `npm run build` to recompile it from source.

== External Services ==

Pinspot embeds no external service by default. Only when you choose YouTube or Vimeo as a tooltip’s media type, the following apply on the public page:

**YouTube (Google LLC) — video embeds and thumbnails**
Purpose: show the video preview thumbnail and, after the visitor clicks play, the embedded player.
Data sent: the visitor’s IP address and standard browser headers are sent to i.ytimg.com when the tooltip preview image loads, and to www.youtube-nocookie.com (the privacy-enhanced embed domain) only after the visitor clicks play.
Sent when: only on pages where you added a YouTube tooltip; the player itself loads only on click.
Service: https://www.youtube.com
Terms of Service: https://www.youtube.com/t/terms
Privacy Policy: https://policies.google.com/privacy

**Vimeo (Vimeo.com, Inc.) — video embeds**
Purpose: show the embedded Vimeo player after the visitor clicks play.
Data sent: the visitor’s IP address and standard browser headers are sent to player.vimeo.com only after the visitor clicks play.
Sent when: only on pages where you added a Vimeo tooltip, and only on click.
Service: https://vimeo.com
Terms of Service: https://vimeo.com/terms
Privacy Policy: https://vimeo.com/privacy

== Screenshots ==

1. A rich tooltip on the frontend — title, description, and a call-to-action button.
2. Dark theme with on-image zoom controls and animated markers.
3. Zoom and pan into a large image; markers stay crisp and readable.
4. Optional accessible list of every hotspot below the image, for screen readers and SEO.
5. The block editor: place pins, reorder them, and configure everything in the sidebar.

== Changelog ==

= 1.0.0 =
* Initial release: interactive image hotspots block with rich tooltips, media, light/dark themes, click or hover triggers, smart placement, zoom & pan, lightbox, click-to-load video facades, deep links, import/export, three starter patterns, an optional accessible hotspot list, and full keyboard, screen-reader, reduced-motion, and RTL support.

== Upgrade Notice ==

= 1.0.0 =
Initial release.
