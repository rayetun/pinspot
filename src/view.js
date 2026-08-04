/**
 * Frontend runtime for Pinspot — WordPress Interactivity API store.
 *
 * `openId`, zoom state, and the lightbox live on the block-level context;
 * each hotspot's context adds its own `id`, effective trigger/placement,
 * and media data. Writes to inherited properties propagate to the block
 * context, so only one tooltip is open per block at a time.
 */
import { store, getContext, getElement } from '@wordpress/interactivity';

const clamp = ( value, min, max ) => Math.min( max, Math.max( min, value ) );

const prefersReducedMotion = () =>
	window.matchMedia &&
	window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;

// Open a hotspot as part of the guided tour. Like clicking its marker, a
// zoomed view is reset first so the tooltip shows complete and unclipped.
const openTourHotspot = ( context, id ) => {
	if ( context.scale > 1 ) {
		context.scale = 1;
		context.tx = 0;
		context.ty = 0;
	}
	context.openId = id;
};

// Pan/pinch pointer bookkeeping (transient, non-reactive).
const activePointers = new Map();
let panLast = null;
let pinchLastDist = 0;

// Grace period before a hover tooltip closes, so the pointer can travel
// from the marker into the tooltip without it vanishing.
const hoverTimers = new Map();
const HOVER_CLOSE_DELAY = 300;

const clampPan = ( context, rect ) => {
	context.tx = clamp( context.tx, rect.width * ( 1 - context.scale ), 0 );
	context.ty = clamp( context.ty, rect.height * ( 1 - context.scale ), 0 );
};

// Zoom toward a fixed point (cx, cy) in viewport-local coordinates.
const zoomTo = ( context, rect, newScale, cx, cy ) => {
	// A tooltip anchored inside the zoom viewport would be clipped by its
	// overflow, so close it whenever the view is zoomed or panned.
	context.openId = '';
	const scale = clamp( newScale, 1, context.maxZoom || 1 );
	context.tx = cx - ( ( cx - context.tx ) * scale ) / context.scale;
	context.ty = cy - ( ( cy - context.ty ) * scale ) / context.scale;
	context.scale = scale;
	if ( 1 === scale ) {
		context.tx = 0;
		context.ty = 0;
	} else {
		clampPan( context, rect );
	}
};

store(
	'pinspot',
	{
		state: {
			get isOpen() {
				const { id, openId } = getContext();
				return openId === id;
			},
			get isZoomed() {
				return getContext().scale > 1;
			},
			get stageTransform() {
				const { tx, ty, scale } = getContext();
				return `translate(${ tx }px, ${ ty }px) scale(${ scale })`;
			},
			get videoSrc() {
				const { videoOpen, embedUrl } = getContext();
				return videoOpen && embedUrl ? embedUrl : null;
			},
			get lightboxOpen() {
				return '' !== getContext().lightboxSrc;
			},
			get lightboxSrc() {
				return getContext().lightboxSrc || null;
			},
			// Tour: 1-based position of the open hotspot (0 when none is open).
			get tourCurrent() {
				const { tourIds, openId } = getContext();
				const i = ( tourIds || [] ).indexOf( openId );
				return i < 0 ? 0 : i + 1;
			},
			// Tour: title of the open hotspot, announced via a polite live region.
			get tourStatus() {
				const { tourIds, tourTitles, openId } = getContext();
				const i = ( tourIds || [] ).indexOf( openId );
				return i < 0 || ! tourTitles ? '' : tourTitles[ i ] || '';
			},
		},
		actions: {
			stop( event ) {
				// Keep tooltip-internal clicks from reaching the document
				// handler that closes tooltips.
				event.stopPropagation();
			},
			toggle( event ) {
				event.stopPropagation();
				const context = getContext();
				const opening = context.openId !== context.id;
				// A tooltip opened while the image is zoomed would be clipped by
				// the zoom viewport, so return to full view first — the tooltip
				// then shows complete and unclipped.
				if ( opening && context.scale > 1 ) {
					context.scale = 1;
					context.tx = 0;
					context.ty = 0;
				}
				context.openId = opening ? context.id : '';
			},
			hoverOpen() {
				const context = getContext();
				if ( 'hover' !== context.trigger ) {
					return;
				}
				clearTimeout( hoverTimers.get( context.id ) );
				hoverTimers.delete( context.id );
				context.openId = context.id;
			},
			hoverClose( event ) {
				const context = getContext();
				if ( 'hover' !== context.trigger ) {
					return;
				}
				const { ref } = getElement();
				if (
					event.relatedTarget &&
					ref.contains( event.relatedTarget )
				) {
					return;
				}
				const { id } = context;
				clearTimeout( hoverTimers.get( id ) );
				hoverTimers.set(
					id,
					setTimeout( () => {
						hoverTimers.delete( id );
						if ( context.openId === id ) {
							context.openId = '';
						}
					}, HOVER_CLOSE_DELAY )
				);
			},
			closeAll() {
				getContext().openId = '';
			},
			tourNext( event ) {
				event.stopPropagation();
				const context = getContext();
				const ids = context.tourIds || [];
				if ( ! ids.length ) {
					return;
				}
				const cur = ids.indexOf( context.openId );
				openTourHotspot(
					context,
					ids[ cur < 0 ? 0 : ( cur + 1 ) % ids.length ]
				);
			},
			tourPrev( event ) {
				event.stopPropagation();
				const context = getContext();
				const ids = context.tourIds || [];
				if ( ! ids.length ) {
					return;
				}
				const cur = ids.indexOf( context.openId );
				openTourHotspot(
					context,
					ids[ cur <= 0 ? ids.length - 1 : cur - 1 ]
				);
			},
			tourTogglePlay( event ) {
				event.stopPropagation();
				const context = getContext();
				context.tourPlaying = ! context.tourPlaying;
			},
			onKeydown( event ) {
				if ( 'Escape' !== event.key ) {
					return;
				}
				const context = getContext();
				if ( context.lightboxSrc ) {
					context.lightboxSrc = '';
					return;
				}
				if ( context.openId ) {
					// Return focus to the marker whose tooltip was open.
					const { ref } = getElement();
					const marker = ref.querySelector(
						'.pinspot__marker[aria-expanded="true"]'
					);
					context.openId = '';
					if ( marker ) {
						marker.focus();
					}
				}
			},
			playVideo( event ) {
				event.stopPropagation();
				getContext().videoOpen = true;
			},
			openLightbox( event ) {
				event.stopPropagation();
				const context = getContext();
				if ( context.mediaFull ) {
					context.lightboxSrc = context.mediaFull;
				}
			},
			closeLightbox( event ) {
				event.stopPropagation();
				getContext().lightboxSrc = '';
			},
			zoomIn( event ) {
				event.stopPropagation();
				const context = getContext();
				const { ref } = getElement();
				const rect = ref
					.closest( '.pinspot' )
					.querySelector( '.pinspot__viewport' )
					.getBoundingClientRect();
				zoomTo(
					context,
					rect,
					context.scale * 1.5,
					rect.width / 2,
					rect.height / 2
				);
			},
			zoomOut( event ) {
				event.stopPropagation();
				const context = getContext();
				const { ref } = getElement();
				const rect = ref
					.closest( '.pinspot' )
					.querySelector( '.pinspot__viewport' )
					.getBoundingClientRect();
				zoomTo(
					context,
					rect,
					context.scale / 1.5,
					rect.width / 2,
					rect.height / 2
				);
			},
			resetZoom( event ) {
				event.stopPropagation();
				const context = getContext();
				context.openId = '';
				context.scale = 1;
				context.tx = 0;
				context.ty = 0;
			},
			onWheel( event ) {
				const context = getContext();
				// Plain scrolling over the image keeps scrolling the page;
				// zoom on ctrl+wheel (or any wheel once zoomed in).
				if ( ! event.ctrlKey && 1 === context.scale ) {
					return;
				}
				event.preventDefault();
				const { ref } = getElement();
				const rect = ref.getBoundingClientRect();
				zoomTo(
					context,
					rect,
					context.scale * ( event.deltaY < 0 ? 1.15 : 1 / 1.15 ),
					event.clientX - rect.left,
					event.clientY - rect.top
				);
			},
			onDblClick( event ) {
				const context = getContext();
				const { ref } = getElement();
				const rect = ref.getBoundingClientRect();
				const target =
					context.scale > 1 ? 1 : Math.min( 2.5, context.maxZoom );
				zoomTo(
					context,
					rect,
					target,
					event.clientX - rect.left,
					event.clientY - rect.top
				);
			},
			onPanStart( event ) {
				if (
					event.target.closest(
						'.pinspot__marker, .pinspot__tooltip'
					)
				) {
					return;
				}
				const context = getContext();
				activePointers.set( event.pointerId, {
					x: event.clientX,
					y: event.clientY,
				} );
				if ( 1 === activePointers.size && context.scale > 1 ) {
					context.openId = '';
					panLast = { x: event.clientX, y: event.clientY };
					getElement().ref.setPointerCapture( event.pointerId );
				}
				if ( 2 === activePointers.size ) {
					const points = [ ...activePointers.values() ];
					pinchLastDist = Math.hypot(
						points[ 0 ].x - points[ 1 ].x,
						points[ 0 ].y - points[ 1 ].y
					);
					panLast = null;
				}
			},
			onPanMove( event ) {
				if ( ! activePointers.has( event.pointerId ) ) {
					return;
				}
				activePointers.set( event.pointerId, {
					x: event.clientX,
					y: event.clientY,
				} );
				const context = getContext();
				const { ref } = getElement();
				const rect = ref.getBoundingClientRect();

				if ( 2 === activePointers.size ) {
					// Pinch zoom around the midpoint.
					const points = [ ...activePointers.values() ];
					const dist = Math.hypot(
						points[ 0 ].x - points[ 1 ].x,
						points[ 0 ].y - points[ 1 ].y
					);
					if ( pinchLastDist > 0 ) {
						const midX =
							( points[ 0 ].x + points[ 1 ].x ) / 2 - rect.left;
						const midY =
							( points[ 0 ].y + points[ 1 ].y ) / 2 - rect.top;
						zoomTo(
							context,
							rect,
							context.scale * ( dist / pinchLastDist ),
							midX,
							midY
						);
					}
					pinchLastDist = dist;
					return;
				}

				if ( panLast && context.scale > 1 ) {
					context.tx += event.clientX - panLast.x;
					context.ty += event.clientY - panLast.y;
					clampPan( context, rect );
					panLast = { x: event.clientX, y: event.clientY };
				}
			},
			onPanEnd( event ) {
				activePointers.delete( event.pointerId );
				if ( activePointers.size < 2 ) {
					pinchLastDist = 0;
				}
				panLast = null;
			},
		},
		callbacks: {
			// Counter-scale markers/tooltips while the stage zooms.
			syncZoom() {
				const { scale } = getContext();
				getElement().ref.style.setProperty(
					'--pinspot-zoom',
					String( scale )
				);
			},
			// Start autoplay on load — but never without an explicit user
			// action when the visitor prefers reduced motion.
			tourInit() {
				const context = getContext();
				if (
					context.tourAutoplay &&
					! prefersReducedMotion() &&
					( context.tourIds || [] ).length > 1
				) {
					context.tourPlaying = true;
				}
			},
			// While playing, advance to the next hotspot after the interval.
			// Re-runs whenever the open hotspot changes, so any manual step
			// (or a marker click) restarts the countdown from that hotspot.
			tourAutoplay() {
				const context = getContext();
				const ids = context.tourIds || [];
				const { openId, tourPlaying, tourInterval } = context;
				if ( ! tourPlaying || ids.length < 2 ) {
					return;
				}
				const timer = setTimeout( () => {
					const cur = ids.indexOf( openId );
					openTourHotspot(
						context,
						ids[ cur < 0 ? 0 : ( cur + 1 ) % ids.length ]
					);
				}, tourInterval || 4000 );
				return () => clearTimeout( timer );
			},
			// Open a hotspot referenced by #pinspot-<id> in the URL.
			initHotspot() {
				const context = getContext();
				if ( window.location.hash === `#pinspot-${ context.id }` ) {
					context.openId = context.id;
					const { ref } = getElement();
					setTimeout( () => {
						ref.scrollIntoView( { block: 'center' } );
					}, 0 );
				}
			},
			// Auto placement (top/bottom flip) + horizontal viewport clamping.
			autoPlace() {
				const context = getContext();
				if ( context.openId !== context.id ) {
					return;
				}
				const { ref } = getElement();
				const placement = context.placement;
				window.requestAnimationFrame( () => {
					if ( 'auto' === placement ) {
						const rect = ref.getBoundingClientRect();
						ref.setAttribute(
							'data-placement',
							rect.top < 8 ? 'bottom' : 'top'
						);
					}
					if (
						'auto' === placement ||
						'top' === placement ||
						'bottom' === placement
					) {
						ref.style.removeProperty( '--pinspot-shift-x' );
						const rect = ref.getBoundingClientRect();
						const viewportWidth =
							document.documentElement.clientWidth;
						let shift = 0;
						if ( rect.left < 8 ) {
							shift = 8 - rect.left;
						} else if ( rect.right > viewportWidth - 8 ) {
							shift = viewportWidth - 8 - rect.right;
						}
						if ( shift ) {
							ref.style.setProperty(
								'--pinspot-shift-x',
								`${ Math.round( shift ) }px`
							);
						}
					}
				} );
			},
		},
	},
	{ lock: true }
);
