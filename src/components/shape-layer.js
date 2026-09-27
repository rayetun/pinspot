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
 * Drag operations are driven by window-level pointer listeners (not element
 * pointer capture): every geometry change re-renders and recreates the SVG
 * shapes and handle buttons, so a capture bound to one of those elements would
 * be lost mid-drag. Listening on the window keeps the drag alive across
 * re-renders.
 *
 * Circles are constrained to be square in *pixels* (using the canvas aspect
 * ratio) so they render as true circles on any image, not ellipses on wide ones.
 *
 * Shapes live in the same `hotspots` array as pins; this component only owns the
 * geometry interaction and defers content editing to the shared inspector.
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
	canvasRef,
	onEnsureSelected,
	onSelect,
	onCommit,
	onUpdate,
	defaultColor,
} ) {
	const ensureSelected = () => onEnsureSelected && onEnsureSelected();
	// In-progress drawing: rect/circle box (start/cur) or a growing polygon.
	const [ draft, setDraft ] = useState( null );
	// Live pointer position (% units) for the polygon preview.
	const [ cursor, setCursor ] = useState( null );
	// The active drag; a ref so window listeners read the latest without rebind.
	const drag = useRef( null );

	const shapes = hotspots.filter( isShape );
	const selected = shapes.find( ( s ) => s.id === selectedId );

	// Keyboard: Escape cancels a draft or clears the selection; Enter finishes a
	// polygon. Bound whenever a tool is active or a shape is selected.
	useEffect( () => {
		if ( ! tool && ! selected ) {
			return undefined;
		}
		const onKey = ( e ) => {
			if ( e.key === 'Escape' ) {
				if ( draft || tool ) {
					setDraft( null );
					setCursor( null );
					setTool( null );
				} else if ( selected ) {
					onSelect( null );
				}
			} else if (
				e.key === 'Enter' &&
				draft &&
				draft.type === 'poly' &&
				draft.points.length >= 3
			) {
				commitPolygon( draft.points );
			}
		};
		const win = canvasRef?.current?.ownerDocument?.defaultView || window;
		win.addEventListener( 'keydown', onKey );
		return () => win.removeEventListener( 'keydown', onKey );
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

	// Canvas pixel aspect ratio (width / height), for true-circle math.
	const canvasAspect = () => {
		const rect = canvasRef?.current?.getBoundingClientRect();
		return rect && rect.height ? rect.width / rect.height : 1;
	};

	// Bounding box from two drag points. For circles, force the box square in
	// pixels (anchored at the first point) so it renders as a true circle.
	const boxFor = ( shape, a, b ) => {
		if ( shape !== 'circle' ) {
			return normalizeRect( a.x, a.y, b.x, b.y );
		}
		const aspect = canvasAspect();
		// Relative pixel extents (in units of H/100): x scaled by the aspect.
		const diameter = Math.max(
			Math.abs( b.x - a.x ) * aspect,
			Math.abs( b.y - a.y )
		);
		const w = diameter / aspect;
		const h = diameter;
		const x = b.x >= a.x ? a.x : a.x - w;
		const y = b.y >= a.y ? a.y : a.y - h;
		return { x: clampPct( x ), y: clampPct( y ), w, h };
	};

	const commitRectLike = ( shape, box ) => {
		onCommit( { ...baseShape(), shape, rect: box } );
		setTool( null );
		setDraft( null );
		setCursor( null );
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

	// --- Unified drag driven by window listeners. ---

	const applyDrag = ( d, point ) => {
		if ( d.kind === 'draw' ) {
			setDraft( {
				type: 'box',
				shape: d.shape,
				start: d.start,
				cur: point,
			} );
			return;
		}
		const snap = d.snapshot;
		if ( d.kind === 'move' ) {
			const dx = point.x - d.origin.x;
			const dy = point.y - d.origin.y;
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
						x: clampPct(
							Math.min( 100 - b.w, Math.max( 0, b.x + dx ) )
						),
						y: clampPct(
							Math.min( 100 - b.h, Math.max( 0, b.y + dy ) )
						),
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
			pts[ d.handle ] = {
				x: clampPct( point.x ),
				y: clampPct( point.y ),
			};
			onUpdate( snap.id, { points: pts } );
		} else {
			// Resize by treating the opposite corner as fixed and the pointer as
			// the dragged corner (reuses boxFor, so circles stay true circles).
			const b = shapeBBox( snap );
			const corners = [
				{ x: b.x, y: b.y },
				{ x: b.x + b.w, y: b.y },
				{ x: b.x + b.w, y: b.y + b.h },
				{ x: b.x, y: b.y + b.h },
			];
			const fixed = corners[ ( d.handle + 2 ) % 4 ];
			onUpdate( snap.id, { rect: boxFor( snap.shape, fixed, point ) } );
		}
	};

	// The window the pointer events fire in. In the block editor the canvas is an
	// iframe, so events fire in the iframe's window — binding the parent window
	// would miss them and the drag would stop the moment it starts.
	const viewOf = ( event ) =>
		event.view || event.currentTarget?.ownerDocument?.defaultView || window;

	const startDrag = ( d, view ) => {
		const win = view || window;
		drag.current = d;
		const onMove = ( e ) => {
			if ( drag.current ) {
				applyDrag( drag.current, pointFromEvent( e ) );
			}
		};
		const onUp = ( e ) => {
			const cur = drag.current;
			drag.current = null;
			win.removeEventListener( 'pointermove', onMove );
			win.removeEventListener( 'pointerup', onUp );
			if ( cur && cur.kind === 'draw' ) {
				const box = boxFor( cur.shape, cur.start, pointFromEvent( e ) );
				if ( box.w >= DRAW_MIN && box.h >= DRAW_MIN ) {
					commitRectLike( cur.shape, box );
				} else {
					setDraft( null );
				}
			}
		};
		win.addEventListener( 'pointermove', onMove );
		win.addEventListener( 'pointerup', onUp );
	};

	// --- Pointer entry points. ---

	// The transparent capture surface (only present while a tool is active).
	const onCaptureDown = ( event ) => {
		if ( ! tool ) {
			return;
		}
		event.preventDefault();
		event.stopPropagation();
		ensureSelected();
		const point = pointFromEvent( event );

		if ( tool === 'polygon' ) {
			const pts = draft ? draft.points : [];
			if ( pts.length >= 3 && dist( point, pts[ 0 ] ) < CLOSE_HIT ) {
				commitPolygon( pts );
				return;
			}
			setDraft( { type: 'poly', points: [ ...pts, point ] } );
			return;
		}
		setDraft( { type: 'box', shape: tool, start: point, cur: point } );
		startDrag(
			{ kind: 'draw', shape: tool, start: point },
			viewOf( event )
		);
	};

	const onCaptureMove = ( event ) => {
		if ( tool === 'polygon' ) {
			setCursor( pointFromEvent( event ) );
		}
	};

	const onCaptureDouble = () => {
		if ( tool === 'polygon' && draft && draft.points.length >= 3 ) {
			commitPolygon( draft.points );
		}
	};

	// Select + move a shape by dragging its fill.
	const onShapeDown = ( hotspot ) => ( event ) => {
		if ( tool ) {
			return;
		}
		event.preventDefault();
		event.stopPropagation();
		// SVG shapes are not focusable, so keep the Gutenberg block selected
		// explicitly — otherwise the Inspector (right sidebar) would close.
		ensureSelected();
		onSelect( hotspot.id );
		startDrag(
			{
				kind: 'move',
				origin: pointFromEvent( event ),
				snapshot: hotspot,
			},
			viewOf( event )
		);
	};

	// Drag a handle to reshape.
	const onHandleDown = ( hotspot, handle ) => ( event ) => {
		event.preventDefault();
		event.stopPropagation();
		ensureSelected();
		onSelect( hotspot.id );
		startDrag(
			{ kind: 'handle', handle, snapshot: hotspot },
			viewOf( event )
		);
	};

	// --- Rendering. ---

	const opacityOf = ( hotspot ) => ( hotspot.shapeOpacity ?? 30 ) / 100;

	const svgShape = ( hotspot ) => {
		const color = colorFor( hotspot );
		const isSel = hotspot.id === selectedId;
		const common = {
			className: `pinspot-editor__shape${ isSel ? ' is-selected' : '' }`,
			style: {
				fill: color,
				stroke: color,
				fillOpacity: opacityOf( hotspot ),
			},
			onPointerDown: onShapeDown( hotspot ),
			// Stop the click from bubbling to the canvas, which would clear the
			// selection (mirrors what the marker buttons do for pins).
			onClick: ( e ) => e.stopPropagation(),
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
				[
					[ b.x, b.y ],
					[ b.x + b.w, b.y ],
					[ b.x + b.w, b.y + b.h ],
					[ b.x, b.y + b.h ],
				].forEach( ( c, i ) => {
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

	// Draft preview.
	let draftEl = null;
	if ( draft && draft.type === 'box' ) {
		const b = boxFor( draft.shape, draft.start, draft.cur );
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
			>
				{ shapes.map( svgShape ) }
				{ draftEl }
				{ draftPoly }
				{ tool && (
					<rect
						className="pinspot-editor__capture"
						x="0"
						y="0"
						width="100"
						height="100"
						onPointerDown={ onCaptureDown }
						onPointerMove={ onCaptureMove }
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
					onClick={ ( e ) => e.stopPropagation() }
				/>
			) ) }
		</>
	);
}
