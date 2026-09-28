# PinSpot Extension API (HOOKS.md)

Public hooks the free **PinSpot** plugin exposes so add-ons (e.g. **PinSpot Pro**)
can extend it **without editing free code**. Stable from **PinSpot 1.2.0**.

> Design rule: an add-on attaches only through these hooks. The free plugin escapes
> all of its own output; where a hook lets an add-on emit markup, the add-on is
> responsible for escaping its own output.

## Detecting a licensed Pro add-on

```php
if ( function_exists( 'pinspot_is_pro_active' ) && pinspot_is_pro_active() ) {
    // A licensed PinSpot Pro is active.
}
```

`pinspot_is_pro_active()` returns true only when Pro has defined `PINSPOT_PRO_ACTIVE`
**inside its Freemius licence gate** — i.e. genuinely licensed, not merely installed.
Call it at render/admin time (Pro boots on `plugins_loaded`, after free's `init`), never
at include time. `PINSPOT_MIN_PRO_VERSION` is the minimum Pro version this build's API
targets.

## PHP filters

| Filter | Signature | Purpose |
|---|---|---|
| `pinspot_block_attributes` | `array $attributes` | Register extra block attributes (merged onto the built-ins at registration). Return `name => schema`. |
| `pinspot_should_render_hotspot` | `bool $render, array $hotspot, array $attrs` | Return `false` to hide a hotspot server-side (conditional display / scheduling). Hidden hotspots are excluded from markers, tour, and list consistently; marker numbers stay stable. |
| `pinspot_marker_classes` | `string $classes, array $hotspot, array $attrs` | Append CSS classes to the marker button (premium FX). |
| `pinspot_hotspot_classes` | `string $classes, array $hotspot, array $attrs` | Append CSS classes to the hotspot wrapper. |
| `pinspot_shape_classes` | `string $classes, array $hotspot, array $attrs` | Append CSS classes to a draw-area shape element (premium fills / always-show / FX). |
| `pinspot_hotspot_has_content` | `bool $has, array $hotspot, array $attrs` | Whether a hotspot's tooltip has content. Defaults to true when the free plugin found a title/description/media/CTA. Return `true` so an otherwise-empty hotspot still opens its tooltip (e.g. a WooCommerce product-bound pin whose only content the add-on injects via `pinspot_tooltip_end`). When false, the marker is non-interactive and no empty tooltip is shown. |

## PHP actions

| Action | Signature | Fires |
|---|---|---|
| `pinspot_render_before` | `array $attrs` | Before a block renders (enqueue per-block assets, count analytics). |
| `pinspot_render_after` | `array $attrs` | After a block renders. |
| `pinspot_tooltip_end` | `array $hotspot, array $attrs` | At the end of the tooltip body (e.g. WooCommerce price + add-to-cart). Echo escaped markup. |
| `pinspot_hotspot_end` | `array $hotspot, array $attrs` | Inside the hotspot wrapper, after the tooltip (e.g. a sale/stock badge). Echo escaped markup. |

## JavaScript (editor)

No free JS is required — the block uses standard registration, so add-ons hook WordPress
core filters directly:

```js
import { addFilter } from '@wordpress/hooks';

// Add editor-side attributes to the block.
addFilter( 'blocks.registerBlockType', 'pinspot-pro/attrs', ( settings, name ) => {
    if ( 'pinspot/image-hotspots' !== name ) return settings;
    return { ...settings, attributes: { ...settings.attributes, myProAttr: { type: 'string' } } };
} );

// Add Inspector panels (SlotFill).
addFilter( 'editor.BlockEdit', 'pinspot-pro/panels', createHigherOrderComponent( ( BlockEdit ) => ( props ) => {
    if ( 'pinspot/image-hotspots' !== props.name ) return <BlockEdit { ...props } />;
    return <><BlockEdit { ...props } /><InspectorControls>{ /* Pro panels */ }</InspectorControls></>;
}, 'withPinspotPro' ) );
```

The frontend Interactivity store namespace is `pinspot`; the `data-wp-context` shape is
stable — add-ons may register additional actions/state on the same namespace rather than
forking `view.js`.

## Frontend engagement event + attribution (for analytics)

When a hotspot or draw-area opens, the store dispatches a bubbling DOM event so add-ons can
observe engagement without forking `view.js`:

```js
document.addEventListener( 'pinspot:open', ( e ) => {
    const hotspotId = e.detail.id;                         // the opened hotspot's id
    const root = e.target.closest( '[data-pinspot-post]' ); // the block <figure>
    const postId = root ? parseInt( root.dataset.pinspotPost, 10 ) : 0;
    // record (postId, hotspotId) — aggregate only, no PII needed.
} );
```

- `pinspot:open` — `CustomEvent`, `bubbles: true`, `detail: { id }`. Fires for pins and
  drawn areas alike (click, hover-open, and tour navigation).
- `data-pinspot-post` — on the block root `<figure>`, the ID of the post/page the block
  renders in, for attribution. Stable from **1.2.0**.

## Admin dashboard pages (JS)

The PinSpot admin app (top-level **PinSpot** menu) lets a licensed add-on add its own
sidebar page — inheriting the app's dark/light theme and chrome — instead of registering a
separate `admin.php` submenu. Push a descriptor to `window.pinspotAdminPages` **before** the
`pinspot-admin` bundle runs (use a `before` inline script on that handle):

```php
wp_enqueue_script( 'my-addon-admin', $url, array(), $ver, true ); // defines the renderer
wp_add_inline_script(
    'pinspot-admin',
    '(window.pinspotAdminPages=window.pinspotAdminPages||[]).push({'
    . 'id:"analytics",label:"Analytics",icon:"chart-bar",'
    . 'mount:function(el,ctx){ window.myAddonRenderAnalytics(el,ctx); }});',
    'before'
);
```

Each entry is `{ id, label, icon, mount(el, ctx) }`. `mount` renders imperatively into `el`
and receives `ctx = { apiFetch, data, links }` (`apiFetch` is `@wordpress/api-fetch`, so REST
calls carry the nonce). The page appears in the sidebar and its content sits inside
`.pinspot-admin__content` — style it with the app's CSS variables (`--card`, `--text`,
`--muted`, `--border`, `--shadow`) so it themes automatically. Pages register only when Pro
is licensed (the add-on enqueues on the PinSpot screen). Stable from **1.2.0**.

## Guarantees

- These names are a stable public API from 1.2.0; breaking changes will bump the major and
  update `PINSPOT_MIN_PRO_VERSION`.
- Any add-on-supplied attribute value still flows through the same render-time escaping
  (`esc_*`, `wp_kses`, `sanitize_hex_color`, enum checks) in `render.php`.
