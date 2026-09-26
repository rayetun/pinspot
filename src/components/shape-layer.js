/**
 * Draw-area editing layer for the PinSpot block editor.
 *
 * Renders shape fills/outlines in an SVG overlay (viewBox 0..100, so image-%
 * coordinates map directly) and crisp, constant-size edit handles as HTML
 * buttons positioned over the canvas. Handles all pointer interaction:
 *
 *   - Drawing (when a tool is active): drag a box for rect/circle; click each
 *     vertex for polygon (double-click, click near the first point, or Enter to
 *     finish; Escape to cancel).
 *   - Selecting a shape (click its fill).
 *   - Moving a shape (drag its fill) and reshaping it (drag a handle: each
 *     vertex for a polygon; the four corners for rect/circle).
 *
 * Shapes live in the same `hotspots` array as pins; this component only owns
 * the geometry interaction and defers content editing to the shared inspector.
 */

import { __ } from '@wordpress/i18n';
import { useState, useEffect, useRef } from '@wordpress/element';
import {
	isShape,
	shapeBBox,
	polygonPoints,
	clampPct,
	normalizeRect,
} from '../lib/shape-geometry';

const DRAW_MIN = 1.5; // Minimum drawn size (%) before a shape is committed.
const CLOSE_HIT = 3.5; // Distance (%) to the first vertex that closes a polygon.
const DEFAULT_COLOR = '#3a5df0';

const dist = ( a, b ) => Math.hypot( a.x - b.x, a.y - b.y );

export default function ShapeLayer( {
	hotspots,
	selectedId,
	tool,
	setTool,
	pointFromEvent,
	onSelect,
	onCommit,
	onUpdate,
	defaultColor,
} ) {
	// In-progress drawing: rect/circle box or a growing polygon point list.
	const [ draft, setDraft ] = useState( null );
	// Live pointer position (% units) for previews.
	const [ cursor, setCursor ] = useState( null );
	// Active manipulation: { kind:'move'|'handle', id, ... }.
	const op = useRef( null );

	const shapes = hotspots.filter( isShape );

	// Cancel an in-progress polygon on Escape; finish on Enter.
	useEffect( () => {
		if ( ! tool ) {
			return undefined;
		}
		const onKey = ( e ) => {
			if ( e.key === 'Escape' ) {
				setDraft( null );
				setTool( null );
			} else if (
				e.key === 'Enter' &&
				draft &&
				draft.type === 'poly' &&
				draft.points.length >= 3
			) {
				commitPolygon( draft.points );
			}
		};
		window.addEventListener( 'keydown', onKey );
		return () => window.removeEventListener( 'keydown', onKey );
	} );

	const newId = () =>
		`hs-${ Date.now().toString( 36 ) }-${ hotspots.length }`;

	const colorFor = ( hotspot ) =>
		hotspot.markerColor ||
		( defaultColor && defaultColor !== DEFAULT_COLOR
			? defaultColor
			: DEFAULT_COLOR );

	const baseShape = () => {
		const shape = { id: newId(), title: '', description: '' };
		if ( defaultColor && defaultColor !== DEFAULT_COLOR ) {
			shape.markerColor = defaultColor;
		}
		return shape;
	};

	const commitRectLike = ( shape, box ) => {
		onCommit( { ...baseShape(), shape, rect: box } );
		setTool( null );
		setDraft( null );
	};

	const commitPolygon = ( points ) => {
		if ( points.length >= 3 ) {
			onCommit( {
				...baseShape(),
				shape: 'polygon',
				points: points.map( ( p ) => ( {
					x: clampPct( p.x ),
					y: clampPct( p.y ),
				} ) ),
			} );
		}
		setTool( null );
		setDraft( null );
		setCursor( null );
	};

	// --- Drawing: pointer on the transparent capture surface. ---

	const onCaptureDown = ( event ) => {
		if ( ! tool ) {
			return;
		}
		event.preventDefault();
		event.stopPropagation();
		const point = pointFromEvent( event );

		if ( tool === 'polygon' ) {
			const pts = draft ? draft.points : [];
			// Click near the first vertex closes the polygon.
			if ( pts.length >= 3 && dist( point, pts[ 0 ] ) < CLOSE_HIT ) {
				commitPolygon( pts );
				return;
			}
			setDraft( { type: 'poly', points: [ ...pts, point ] } );
			return;
		}

		// rect / circle: start dragging a box.
		event.currentTarget.setPointerCapture( event.pointerId );
		setDraft( { type: 'box', shape: tool, start: point, cur: point } );
	};

	const onCaptureMove = ( event ) => {
		if ( ! tool ) {
			return;
		}
		const point = pointFromEvent( event );
		setCursor( point );
		if ( draft && draft.type === 'box' ) {
			setDraft( { ...draft, cur: point } );
		}
	};

	const onCaptureUp = ( event ) => {
		if ( ! draft || draft.type !== 'box' ) {
			return;
		}
		const box = normalizeRect(
			draft.start.x,
			draft.start.y,
			draft.cur.x,
			draft.cur.y
		);
		if ( box.w >= DRAW_MIN && box.h >= DRAW_MIN ) {
			commitRectLike( draft.shape, box );
		} else {
			setDraft( null );
		}
		if ( event.currentTarget.hasPointerCapture?.( event.pointerId ) ) {
			event.currentTarget.releasePointerCapture( event.pointerId );
		}
	};

	const onCaptureDouble = () => {
		if ( tool === 'polygon' && draft && draft.points.length >= 3 ) {
			commitPolygon( draft.points );
		}
	};

	// --- Move a whole shape by dragging its fill. ---

	const onShapeDown = ( hotspot ) => ( event ) => {
		if ( tool ) {
			return;
		}
		event.preventDefault();
		event.stopPropagation();
		onSelect( hotspot.id );
		event.currentTarget.setPointerCapture( event.pointerId );
		op.current = {
			kind: 'move',
			id: hotspot.id,
			origin: pointFromEvent( event ),
			snapshot: hotspot,
		};
	};

	// --- Drag a handle to reshape. ---

	const onHandleDown = ( hotspot, handle ) => ( event ) => {
		event.preventDefault();
		event.stopPropagation();
		onSelect( hotspot.id );
		event.currentTarget.setPointerCapture( event.pointerId );
		op.current = {
			kind: 'handle',
			id: hotspot.id,
			handle,
			snapshot: hotspot,
		};
	};

	const onLayerMove = ( event ) => {
		const active = op.current;
		if ( ! active ) {
			return;
		}
		const point = pointFromEvent( event );
		const snap = active.snapshot;

		if ( active.kind === 'move' ) {
			const dx = point.x - active.origin.x;
			const dy = point.y - active.origin.y;
			if ( snap.shape === 'polygon' ) {
				onUpdate( snap.id, {
					points: polygonPoints( snap ).map( ( p ) => ( {
						x: clampPct( p.x + dx ),
						y: clampPct( p.y + dy ),
					} ) ),
				} );
			} else {
				const b = shapeBBox( snap );
				onUpdate( snap.id, {
					rect: {
						x: clampPct( Math.min( 100 - b.w, b.x + dx ) ),
						y: clampPct( Math.min( 100 - b.h, b.y + dy ) ),
						w: b.w,
						h: b.h,
					},
				} );
			}
			return;
		}

		// kind === 'handle'
		if ( snap.shape === 'polygon' ) {
			const pts = polygonPoints( snap ).slice();
			pts[ active.handle ] = { x: point.x, y: point.y };
			onUpdate( snap.id, { points: pts } );
		} else {
			// Corner handle indices: 0=TL, 1=TR, 2=BR, 3=BL.
			const b = shapeBBox( snap );
			let x1 = b.x;
			let y1 = b.y;
			let x2 = b.x + b.w;
			let y2 = b.y + b.h;
			if ( active.handle === 0 ) {
				x1 = point.x;
				y1 = point.y;
			} else if ( active.handle === 1 ) {
				x2 = point.x;
				y1 = point.y;
			} else if ( active.handle === 2 ) {
				x2 = point.x;
				y2 = point.y;
			} else {
				x1 = point.x;
				y2 = point.y;
			}
			onUpdate( snap.id, { rect: normalizeRect( x1, y1, x2, y2 ) } );
		}
	};

	const onLayerUp = ( event ) => {
		if ( op.current ) {
			if ( event.currentTarget.hasPointerCapture?.( event.pointerId ) ) {
				event.currentTarget.releasePointerCapture( event.pointerId );
			}
			op.current = null;
		}
	};

	// --- Rendering. ---

	const svgShape = ( hotspot ) => {
		const color = colorFor( hotspot );
		const selected = hotspot.id === selectedId;
		const common = {
			className: `pinspot-editor__shape${
				selected ? ' is-selected' : ''
			}`,
			style: { fill: color, stroke: color },
			onPointerDown: onShapeDown( hotspot ),
		};
		if ( hotspot.shape === 'polygon' ) {
			const pts = polygonPoints( hotspot );
			if ( pts.length < 3 ) {
				return null;
			}
			return (
				<polygon
					key={ hotspot.id }
					points={ pts
						.map( ( p ) => `${ p.x },${ p.y }` )
						.join( ' ' ) }
					{ ...common }
				/>
			);
		}
		const b = shapeBBox( hotspot );
		if ( ! b ) {
			return null;
		}
		if ( hotspot.shape === 'circle' ) {
			return (
				<ellipse
					key={ hotspot.id }
					cx={ b.x + b.w / 2 }
					cy={ b.y + b.h / 2 }
					rx={ b.w / 2 }
					ry={ b.h / 2 }
					{ ...common }
				/>
			);
		}
		return (
			<rect
				key={ hotspot.id }
				x={ b.x }
				y={ b.y }
				width={ b.w }
				height={ b.h }
				{ ...common }
			/>
		);
	};

	// Handles for the selected shape (HTML buttons, constant pixel size).
	const selected = shapes.find( ( s ) => s.id === selectedId );
	const handles = [];
	if ( selected && ! tool ) {
		if ( selected.shape === 'polygon' ) {
			polygonPoints( selected ).forEach( ( p, i ) => {
				handles.push( {
					key: `v${ i }`,
					x: p.x,
					y: p.y,
					hotspot: selected,
					handle: i,
				} );
			} );
		} else {
			const b = shapeBBox( selected );
			if ( b ) {
				const corners = [
					[ b.x, b.y ],
					[ b.x + b.w, b.y ],
					[ b.x + b.w, b.y + b.h ],
					[ b.x, b.y + b.h ],
				];
				corners.forEach( ( c, i ) => {
					handles.push( {
						key: `c${ i }`,
						x: c[ 0 ],
						y: c[ 1 ],
						hotspot: selected,
						handle: i,
					} );
				} );
			}
		}
	}

	// Draft preview geometry.
	let draftEl = null;
	if ( draft && draft.type === 'box' ) {
		const b = normalizeRect(
			draft.start.x,
			draft.start.y,
			draft.cur.x,
			draft.cur.y
		);
		draftEl =
			draft.shape === 'circle' ? (
				<ellipse
					className="pinspot-editor__draft"
					cx={ b.x + b.w / 2 }
					cy={ b.y + b.h / 2 }
					rx={ b.w / 2 }
					ry={ b.h / 2 }
				/>
			) : (
				<rect
					className="pinspot-editor__draft"
					x={ b.x }
					y={ b.y }
					width={ b.w }
					height={ b.h }
				/>
			);
	}
	let draftPoly = null;
	if ( draft && draft.type === 'poly' ) {
		const pts = [ ...draft.points ];
		const preview = cursor ? [ ...pts, cursor ] : pts;
		draftPoly = (
			<>
				<polyline
					className="pinspot-editor__draft"
					points={ preview
						.map( ( p ) => `${ p.x },${ p.y }` )
						.join( ' ' ) }
				/>
				{ pts.map( ( p, i ) => (
					<circle
						key={ `dp${ i }` }
						className="pinspot-editor__draft-dot"
						cx={ p.x }
						cy={ p.y }
						r={ i === 0 ? 1.4 : 1 }
					/>
				) ) }
			</>
		);
	}

	return (
		<>
			<svg
				className="pinspot-editor__shapes"
				viewBox="0 0 100 100"
				preserveAspectRatio="none"
				aria-hidden="true"
				onPointerMove={ onLayerMove }
				onPointerUp={ onLayerUp }
			>
				{ shapes.map( svgShape ) }
				{ draftEl }
				{ draftPoly }
				{ tool && (
					// Transparent surface that captures drawing pointer events.
					<rect
						className="pinspot-editor__capture"
						x="0"
						y="0"
						width="100"
						height="100"
						onPointerDown={ onCaptureDown }
						onPointerMove={ onCaptureMove }
						onPointerUp={ onCaptureUp }
						onDoubleClick={ onCaptureDouble }
					/>
				) }
			</svg>
			{ handles.map( ( h ) => (
				<button
					key={ h.key }
					type="button"
					className="pinspot-editor__handle"
					style={ { left: `${ h.x }%`, top: `${ h.y }%` } }
					aria-label={ __( 'Drag to reshape', 'pinspot' ) }
					onPointerDown={ onHandleDown( h.hotspot, h.handle ) }
					onPointerMove={ onLayerMove }
					onPointerUp={ onLayerUp }
				/>
			) ) }
		</>
	);
}
