=== Pinspot — Interactive Image Hotspots ===
Contributors: rayetun
Tags: hotspot, image map, tooltip, interactive image, pins
Requires at least: 6.6
Tested up to: 7.0
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Place clickable hotspot pins on any image — rich, accessible tooltips with text, media, video, and links. Zoom, lightbox, and more.

== Description ==

**Pinspot** turns any image into an interactive experience. Drop pins on product photos, team pictures, maps, floor plans, or infographics — each pin opens a beautiful tooltip with a title, description, image or video, and a call-to-action button.

Built the modern WordPress way: a native block with the Interactivity API — no jQuery, no shortcodes, no bloat. The frontend runtime is under 3 KB.

= ✨ Features =

* 🎯 **Click-to-place editor** — pick an image, click to drop pins, drag to reposition, nudge with arrow keys
* 💬 **Rich tooltips** — title, description, image, self-hosted video, YouTube/Vimeo embeds, CTA button
* 🎨 **Marker styles** — numbered, dot, plus, info, question; three sizes; any color; pulse/bounce animations
* 🌗 **Light & dark themes** — per block or per pin
* 🖱️ **Click or hover triggers** — hover tooltips stay open while you move into them
* 📐 **Smart placement** — top/bottom/left/right or automatic flipping so tooltips never clip
* 🔍 **Zoom & pan** — optional buttons, double-click, ctrl+wheel, pinch, and drag-to-pan for maps and diagrams
* 🖼️ **Lightbox** — open tooltip images full-size
* ⚡ **Video facades** — YouTube/Vimeo load nothing until the visitor presses play
* 🔗 **Deep links** — link directly to an open hotspot with a URL hash
* 📦 **Import/Export** — move hotspot layouts between posts or sites as JSON
* 🧩 **Starter patterns** — product showcase, team introduction, zoomable map tour
* ♿ **Accessible** — full keyboard support, ARIA states, focus management, reduced-motion friendly
* 🌍 **RTL & translation ready**

= 🚀 Perfect for =

* Product feature callouts and shoppable images
* Team and about pages
* Maps, campus plans, and floor plans
* Infographics, diagrams, and technical drawings
* Real-estate photos and travel guides

== Installation ==

1. In your dashboard go to **Plugins → Add New** and search for “Pinspot”.
2. Install and activate.
3. In any post or page, add the **Pinspot — Image Hotspots** block (or insert one of the Pinspot patterns).
4. Select an image, click **Add hotspot** in the toolbar, then click a spot on the image.
5. Fill in the tooltip content in the sidebar. Publish!

== Frequently Asked Questions ==

= Does it work with any theme? =

Yes. Pinspot renders a standard block with its own scoped styles and inherits your theme's alignment settings (wide/full included).

= Are hotspot positions responsive? =

Yes. Positions are stored as percentages of the image, so pins stay anchored at every screen size.

= Can tooltips open on hover instead of click? =

Yes — switch the block (or an individual pin) to the hover trigger. On touch devices hover pins still open on tap.

= Does it load anything from YouTube or Vimeo automatically? =

No. Video tooltips render a lightweight preview with a play button; the actual player loads only after the visitor clicks it. See the External Services section for details.

= Where is the hotspot data stored? =

Inside the block in your post content — no extra database tables, no orphaned options. Deleting the plugin leaves your content clean.

== External Services ==

Pinspot embeds no external service by default. Only when you choose YouTube or Vimeo as a tooltip's media type, the following apply on the public page:

**YouTube (Google LLC) — video embeds and thumbnails**
Purpose: show the video preview thumbnail and, after the visitor clicks play, the embedded player.
Data sent: the visitor's IP address and standard browser headers are sent to i.ytimg.com when the tooltip preview image loads, and to www.youtube-nocookie.com (the privacy-enhanced embed domain) only after the visitor clicks play.
Sent when: only on pages where you added a YouTube tooltip; the player itself loads only on click.
Service: https://www.youtube.com
Terms of Service: https://www.youtube.com/t/terms
Privacy Policy: https://policies.google.com/privacy

**Vimeo (Vimeo.com, Inc.) — video embeds**
Purpose: show the embedded Vimeo player after the visitor clicks play.
Data sent: the visitor's IP address and standard browser headers are sent to player.vimeo.com only after the visitor clicks play.
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
* Initial release: interactive image hotspots block with rich tooltips, media, themes, triggers, placements, zoom & pan, lightbox, video facades, deep links, import/export, patterns, full accessibility and RTL support.

== Upgrade Notice ==

= 1.0.0 =
Initial release.
