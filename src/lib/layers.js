/**
 * Shared layer model for the pinspot/image-hotspots block.
 *
 * The JavaScript mirror of includes/class-pinspot-layers.php — keep the two in
 * step. A block holds one or more image *layers* (a floor plan's ground and
 * first floor, a before/after pair, a wide shot and a zoomed detail), each with
 * its own image and hotspots. Everything else stays block-level.
 *
 * Storage is backward compatible on purpose:
 *
 *   - A block with a single image keeps the original flat `imageUrl` /
 *     `imageAlt` / `hotspots` attributes and never gains a `layers` array, so
 *     the common case is byte-identical to before layers existed.
 *   - `layers` is materialized only when an editor adds a second layer. From
 *     that point `layers` is the source of truth; the flat attributes are left
 *     frozen at their pre-layers value as a graceful downgrade path (they are
 *     deliberately NOT mirrored, to avoid both payload bloat and dual-write
 *     bugs).
 *
 * The write helpers all return an attribute *patch* to hand to
 * `setAttributes()`, so callers never assemble layer state themselves.
 */

import { __, sprintf } from '@wordpress/i18n';

/**
 * Generate a collision-resistant layer id.
 *
 * @return {string} A new layer id.
 */
export function newLayerId() {
	return `layer-${ Date.now().toString( 36 ) }-${ Math.floor(
		Math.random() * 1296
	).toString( 36 ) }`;
}

/**
 * Coerce one raw layer into the canonical shape.
 *
 * @param {Object} raw   Raw layer data.
 * @param {number} index Zero-based position, for fallback id and name.
 * @return {Object|null} Null when the layer has no image and cannot render.
 */
function normalize( raw, index ) {
	const url = typeof raw.imageUrl === 'string' ? raw.imageUrl : '';
	if ( ! url.trim() ) {
		return null;
	}

	const id =
		typeof raw.id === 'string' && raw.id.trim()
			? raw.id
			: `layer-${ index + 1 }`;

	const name =
		typeof raw.name === 'string' && raw.name.trim()
			? raw.name
			: /* translators: %d: layer number. */
			  sprintf( __( 'Layer %d', 'pinspot' ), index + 1 );

	return {
		id,
		name,
		imageId: Number( raw.imageId ) || 0,
		imageUrl: url,
		imageAlt: typeof raw.imageAlt === 'string' ? raw.imageAlt : '',
		imageWidth: Number( raw.imageWidth ) || 0,
		imageHeight: Number( raw.imageHeight ) || 0,
		hotspots: Array.isArray( raw.hotspots ) ? raw.hotspots : [],
	};
}

/**
 * Normalize attributes into an ordered list of renderable layers.
 *
 * Layers without an image are dropped. Returns an empty array for a block that
 * has no image at all yet.
 *
 * @param {Object} attributes Block attributes.
 * @return {Object[]} The layers.
 */
export function getLayers( attributes = {} ) {
	if ( Array.isArray( attributes.layers ) && attributes.layers.length ) {
		const out = [];
		attributes.layers.forEach( ( raw ) => {
			if ( ! raw || typeof raw !== 'object' ) {
				return;
			}
			const layer = normalize( raw, out.length );
			if ( layer ) {
				out.push( layer );
			}
		} );
		if ( out.length ) {
			return out;
		}
		// `layers` held nothing renderable — fall through to the flat shape.
	}

	const legacy = normalize(
		{
			id: 'layer-1',
			imageId: attributes.imageId,
			imageUrl: attributes.imageUrl,
			imageAlt: attributes.imageAlt,
			imageWidth: attributes.imageWidth,
			imageHeight: attributes.imageHeight,
			hotspots: attributes.hotspots,
		},
		0
	);

	return legacy ? [ legacy ] : [];
}

/**
 * Whether the block is using the `layers` array rather than the flat shape.
 *
 * @param {Object} attributes Block attributes.
 * @return {boolean} True when `layers` is the source of truth.
 */
export function usesLayers( attributes = {} ) {
	return (
		Array.isArray( attributes.layers ) &&
		attributes.layers.some(
			( l ) =>
				l &&
				typeof l === 'object' &&
				typeof l.imageUrl === 'string' &&
				l.imageUrl.trim()
		)
	);
}

/**
 * Whether the block has more than one renderable layer.
 *
 * @param {Object} attributes Block attributes.
 * @return {boolean} True when the layer switcher should appear.
 */
export function isMulti( attributes = {} ) {
	return getLayers( attributes ).length > 1;
}

/**
 * Every hotspot across every layer, flattened in layer then author order.
 *
 * @param {Object} attributes Block attributes.
 * @return {Object[]} The hotspots.
 */
export function allHotspots( attributes = {} ) {
	return getLayers( attributes ).reduce(
		( acc, layer ) => acc.concat( layer.hotspots ),
		[]
	);
}

/**
 * Snapshot the flat attributes as a one-item layers array.
 *
 * Used to materialize `layers` the first time a second layer is added, so the
 * existing image and hotspots become layer 1 instead of being lost.
 *
 * @param {Object} attributes Block attributes.
 * @return {Object[]} Zero or one layer.
 */
function snapshotFlat( attributes ) {
	const url =
		typeof attributes.imageUrl === 'string' ? attributes.imageUrl : '';
	if ( ! url.trim() ) {
		return [];
	}
	return [
		{
			id: newLayerId(),
			name: '',
			imageId: Number( attributes.imageId ) || 0,
			imageUrl: url,
			imageAlt:
				typeof attributes.imageAlt === 'string'
					? attributes.imageAlt
					: '',
			imageWidth: Number( attributes.imageWidth ) || 0,
			imageHeight: Number( attributes.imageHeight ) || 0,
			hotspots: Array.isArray( attributes.hotspots )
				? attributes.hotspots
				: [],
		},
	];
}

/**
 * The stored layers array, materializing it from the flat shape when needed.
 *
 * @param {Object} attributes Block attributes.
 * @return {Object[]} A mutable copy of the stored layers.
 */
function storedLayers( attributes ) {
	if ( usesLayers( attributes ) ) {
		return attributes.layers
			.filter( ( l ) => l && typeof l === 'object' )
			.map( ( l ) => ( { ...l } ) );
	}
	return snapshotFlat( attributes );
}

/**
 * Build a new, empty layer from a selected media object.
 *
 * @param {Object} media A media object from MediaUpload / MediaPlaceholder.
 * @return {Object} The new layer.
 */
function layerFromMedia( media = {} ) {
	return {
		id: newLayerId(),
		name: '',
		imageId: Number( media.id ) || 0,
		imageUrl: media.url || '',
		imageAlt: media.alt || '',
		imageWidth: Number( media.width ) || 0,
		imageHeight: Number( media.height ) || 0,
		hotspots: [],
	};
}

/**
 * Patch adding a layer, migrating the flat shape into `layers` if needed.
 *
 * @param {Object} attributes Block attributes.
 * @param {Object} media      The selected image.
 * @return {Object} An attribute patch for setAttributes().
 */
export function addLayer( attributes, media ) {
	return {
		layers: [ ...storedLayers( attributes ), layerFromMedia( media ) ],
	};
}

/**
 * Patch replacing one layer's hotspots.
 *
 * On a single-image block this writes the flat `hotspots` attribute, so a block
 * that never used layers keeps its original storage shape.
 *
 * @param {Object}   attributes Block attributes.
 * @param {number}   index      Layer index.
 * @param {Object[]} hotspots   The replacement hotspots.
 * @return {Object} An attribute patch for setAttributes().
 */
export function writeHotspots( attributes, index, hotspots ) {
	if ( ! usesLayers( attributes ) ) {
		return { hotspots };
	}
	const layers = storedLayers( attributes );
	if ( ! layers[ index ] ) {
		return {};
	}
	layers[ index ] = { ...layers[ index ], hotspots };
	return { layers };
}

/**
 * Patch replacing one layer's image.
 *
 * @param {Object} attributes Block attributes.
 * @param {number} index      Layer index.
 * @param {Object} media      The selected image.
 * @return {Object} An attribute patch for setAttributes().
 */
export function writeLayerImage( attributes, index, media = {} ) {
	const patch = {
		imageId: Number( media.id ) || 0,
		imageUrl: media.url || '',
		imageAlt: media.alt || '',
		imageWidth: Number( media.width ) || 0,
		imageHeight: Number( media.height ) || 0,
	};

	if ( ! usesLayers( attributes ) ) {
		return patch;
	}
	const layers = storedLayers( attributes );
	if ( ! layers[ index ] ) {
		return {};
	}
	layers[ index ] = { ...layers[ index ], ...patch };
	return { layers };
}

/**
 * Patch renaming one layer.
 *
 * @param {Object} attributes Block attributes.
 * @param {number} index      Layer index.
 * @param {string} name       The new label.
 * @return {Object} An attribute patch for setAttributes().
 */
export function renameLayer( attributes, index, name ) {
	const layers = storedLayers( attributes );
	if ( ! layers[ index ] ) {
		return {};
	}
	layers[ index ] = { ...layers[ index ], name };
	return { layers };
}

/**
 * Patch removing one layer.
 *
 * Removing down to a single layer keeps the `layers` array rather than
 * collapsing back to the flat shape — collapsing would silently discard the
 * remaining layer's hotspots if it was not layer 1.
 *
 * @param {Object} attributes Block attributes.
 * @param {number} index      Layer index.
 * @return {Object} An attribute patch for setAttributes().
 */
export function removeLayer( attributes, index ) {
	const layers = storedLayers( attributes );
	if ( layers.length < 2 || ! layers[ index ] ) {
		return {};
	}
	layers.splice( index, 1 );
	return { layers };
}

/**
 * Patch moving one layer up or down the order.
 *
 * @param {Object} attributes Block attributes.
 * @param {number} index      Layer index.
 * @param {number} delta      -1 to move earlier, 1 to move later.
 * @return {Object} An attribute patch for setAttributes().
 */
export function moveLayer( attributes, index, delta ) {
	const layers = storedLayers( attributes );
	const target = index + delta;
	if ( ! layers[ index ] || ! layers[ target ] ) {
		return {};
	}
	const [ moved ] = layers.splice( index, 1 );
	layers.splice( target, 0, moved );
	return { layers };
}
