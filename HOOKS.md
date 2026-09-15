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

## Guarantees

- These names are a stable public API from 1.2.0; breaking changes will bump the major and
  update `PINSPOT_MIN_PRO_VERSION`.
- Any add-on-supplied attribute value still flows through the same render-time escaping
  (`esc_*`, `wp_kses`, `sanitize_hex_color`, enum checks) in `render.php`.
