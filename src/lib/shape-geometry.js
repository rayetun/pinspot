/**
 * Draw-area geometry helpers (editor side).
 *
 * A shape is a hotspot with `shape` ('polygon' | 'rect' | 'circle') plus
 * geometry in image-percentage units: polygon → `points: [{x,y}, …]`;
 * rect/circle → `rect: {x, y, w, h}`. These mirror the server logic in
 * render.php so the editor preview matches the front end.
 */

export const SHAPE_TYPES = [ 'polygon', 'rect', 'circle' ];

export const isShape = ( hotspot ) =>
	!! hotspot && SHAPE_TYPES.includes( hotspot.shape );

export const clampPct = ( v ) => Math.min( 100, Math.max( 0, v ) );

/**
 * Valid polygon points (numeric x/y), or [].
 *
 * @param {Object} hotspot Hotspot data.
 * @return {Array} Points with numeric x/y.
 */
export const polygonPoints = ( hotspot ) =>
	Array.isArray( hotspot.points )
		? hotspot.points.filter(
				( p ) =>
					p &&
					typeof p.x === 'number' &&
					typeof p.y === 'number' &&
					! Number.isNaN( p.x ) &&
					! Number.isNaN( p.y )
		  )
		: [];

/**
 * Bounding box { x, y, w, h } in %, or null when the shape is invalid.
 *
 * @param {Object} hotspot Hotspot data.
 * @return {?Object} Bounding box, or null.
 */
export const shapeBBox = ( hotspot ) => {
	if ( ! isShape( hotspot ) ) {
		return null;
	}
	if ( hotspot.shape === 'polygon' ) {
		const pts = polygonPoints( hotspot );
		if ( pts.length < 3 ) {
			return null;
		}
		const xs = pts.map( ( p ) => p.x );
		const ys = pts.map( ( p ) => p.y );
		const x = Math.min( ...xs );
		const y = Math.min( ...ys );
		return {
			x,
			y,
			w: Math.max( 0.01, Math.max( ...xs ) - x ),
			h: Math.max( 0.01, Math.max( ...ys ) - y ),
		};
	}
	const r = hotspot.rect;
	if ( ! r || typeof r.x !== 'number' || typeof r.w !== 'number' ) {
		return null;
	}
	const x = clampPct( r.x );
	const y = clampPct( r.y );
	return {
		x,
		y,
		w: Math.max( 0.01, Math.min( 100 - x, r.w ) ),
		h: Math.max( 0.01, Math.min( 100 - y, r.h ) ),
	};
};

/**
 * Centroid { x, y } in % — the tooltip anchor.
 *
 * @param {Object} hotspot Hotspot data.
 * @return {Object} Centroid { x, y }.
 */
export const shapeCentroid = ( hotspot ) => {
	if ( hotspot.shape === 'polygon' ) {
		const pts = polygonPoints( hotspot );
		if ( ! pts.length ) {
			return { x: 50, y: 50 };
		}
		return {
			x: pts.reduce( ( s, p ) => s + p.x, 0 ) / pts.length,
			y: pts.reduce( ( s, p ) => s + p.y, 0 ) / pts.length,
		};
	}
	const b = shapeBBox( hotspot );
	return b ? { x: b.x + b.w / 2, y: b.y + b.h / 2 } : { x: 50, y: 50 };
};

/**
 * Normalize a drawn bounding box so w/h are positive.
 *
 * @param {number} x1 First corner x (%).
 * @param {number} y1 First corner y (%).
 * @param {number} x2 Opposite corner x (%).
 * @param {number} y2 Opposite corner y (%).
 * @return {Object} Bounding box { x, y, w, h }.
 */
export const normalizeRect = ( x1, y1, x2, y2 ) => ( {
	x: clampPct( Math.min( x1, x2 ) ),
	y: clampPct( Math.min( y1, y2 ) ),
	w: Math.abs( x2 - x1 ),
	h: Math.abs( y2 - y1 ),
} );
