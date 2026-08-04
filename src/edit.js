/**
 * Editor UI for the pinspot/image-hotspots block.
 *
 * Phase 2: drag-to-reposition (pointer capture, percent math), arrow-key
 * nudge, full per-hotspot inspector, and the "All hotspots" list panel.
 */
import { __, sprintf } from '@wordpress/i18n';
import {
	useBlockProps,
	MediaPlaceholder,
	MediaReplaceFlow,
	BlockControls,
	InspectorControls,
	useSettings,
} from '@wordpress/block-editor';
import {
	ToolbarButton,
	Notice,
	PanelBody,
	SelectControl,
	ToggleControl,
	RangeControl,
	BaseControl,
	ColorPalette,
} from '@wordpress/components';
import { useState, useRef } from '@wordpress/element';

import HotspotInspector from './components/hotspot-inspector';
import HotspotList from './components/hotspot-list';
import HotspotTooltipEditor from './components/hotspot-tooltip-editor';
import ImportExport from './components/import-export';

const clampPct = ( value ) =>
	Math.min( 100, Math.max( 0, Math.round( value * 100 ) / 100 ) );

const DRAG_THRESHOLD_PX = 3;

// A custom style with no content (image without a picture, emoji without a
// character) falls back to the number, matching render.php.
export const effectiveMarkerStyle = ( hotspot ) => {
	const style = hotspot.markerStyle || 'number';
	if ( 'image' === style && ! hotspot.markerImageUrl ) {
		return 'number';
	}
	if ( 'emoji' === style && ! ( hotspot.markerValue || '' ).trim() ) {
		return 'number';
	}
	return style;
};

export const markerGlyph = ( style, number, value = '' ) => {
	switch ( style ) {
		case 'dot':
			return '';
		case 'plus':
			return '+';
		case 'info':
			return 'i';
		case 'question':
			return '?';
		case 'emoji':
			return value || String( number );
		default:
			return String( number );
	}
};

export const markerClassName = ( hotspot, extra = '' ) =>
	[
		'pinspot__marker',
		`pinspot__marker--${ effectiveMarkerStyle( hotspot ) }`,
		`pinspot__marker--${ hotspot.markerSize || 'medium' }`,
		extra,
	]
		.filter( Boolean )
		.join( ' ' );

// Appearance + behavior fields that "copy style" transfers between pins —
// deliberately excludes content (title, description, media, link), identity
// (id, x, y), and grouping. Unset keys are copied as undefined so pasting
// resets the target to defaults, mirroring the source exactly.
const STYLE_KEYS = [
	'markerStyle',
	'markerValue',
	'markerImageId',
	'markerImageUrl',
	'markerSize',
	'markerColor',
	'animation',
	'trigger',
	'placement',
	'theme',
	'lightbox',
];

const pickStyle = ( hotspot ) =>
	Object.fromEntries( STYLE_KEYS.map( ( key ) => [ key, hotspot[ key ] ] ) );

export default function Edit( { attributes, setAttributes, isSelected } ) {
	const {
		imageId,
		imageUrl,
		imageAlt,
		hotspots,
		globalTrigger,
		globalTheme,
		enableZoom,
		maxZoom,
		tooltipWidth,
		showList,
		enableFilters,
		enableTour,
		tourAutoplay,
		tourInterval,
		tourShowCount,
		tourColor,
		tourPosition,
		tourButtonSize,
		tourButtonShape,
	} = attributes;
	const [ palette ] = useSettings( 'color.palette' );
	const [ isPlacing, setIsPlacing ] = useState( false );
	const [ selectedId, setSelectedId ] = useState( null );
	const [ drag, setDrag ] = useState( null );
	const [ copiedStyle, setCopiedStyle ] = useState( null );
	const canvasRef = useRef( null );

	const blockProps = useBlockProps( {
		className: isPlacing ? 'is-placing-hotspot' : undefined,
	} );

	const selectedHotspot = hotspots.find( ( h ) => h.id === selectedId );

	// Distinct, non-empty group names in first-appearance order — offered as
	// quick-assign suggestions in the hotspot inspector.
	const existingGroups = [
		...new Set(
			hotspots.map( ( h ) => ( h.group || '' ).trim() ).filter( Boolean )
		),
	];

	const onSelectImage = ( media ) => {
		if ( ! media || ! media.url ) {
			return;
		}
		setAttributes( {
			imageId: media.id,
			imageUrl: media.url,
			imageAlt: media.alt || '',
			imageWidth: media.width,
			imageHeight: media.height,
		} );
	};

	const updateHotspot = ( id, changes ) => {
		setAttributes( {
			hotspots: hotspots.map( ( h ) =>
				h.id === id ? { ...h, ...changes } : h
			),
		} );
	};

	const removeHotspot = ( id ) => {
		setAttributes( {
			hotspots: hotspots.filter( ( h ) => h.id !== id ),
		} );
		if ( selectedId === id ) {
			setSelectedId( null );
		}
	};

	// Copy the selected pin's style, then paste it onto another pin (or all).
	const copyStyle = () => {
		if ( selectedHotspot ) {
			setCopiedStyle( pickStyle( selectedHotspot ) );
		}
	};

	const pasteStyle = () => {
		if ( selectedHotspot && copiedStyle ) {
			updateHotspot( selectedHotspot.id, copiedStyle );
		}
	};

	const applyStyleToAll = () => {
		if ( ! copiedStyle ) {
			return;
		}
		setAttributes( {
			hotspots: hotspots.map( ( h ) => ( { ...h, ...copiedStyle } ) ),
		} );
	};

	const pointFromEvent = ( event ) => {
		const rect = canvasRef.current.getBoundingClientRect();
		return {
			x: clampPct( ( ( event.clientX - rect.left ) / rect.width ) * 100 ),
			y: clampPct( ( ( event.clientY - rect.top ) / rect.height ) * 100 ),
		};
	};

	const onCanvasClick = ( event ) => {
		if ( ! isPlacing ) {
			setSelectedId( null );
			return;
		}
		const point = pointFromEvent( event );
		const id = `hs-${ Date.now().toString( 36 ) }-${ hotspots.length }`;

		setAttributes( {
			hotspots: [
				...hotspots,
				{ id, ...point, title: '', description: '' },
			],
		} );
		setSelectedId( id );
		setIsPlacing( false );
	};

	// --- Drag to reposition (pointer capture on the marker button). ---

	const onMarkerPointerDown = ( hotspot ) => ( event ) => {
		if ( isPlacing ) {
			return;
		}
		event.preventDefault();
		event.stopPropagation();
		event.currentTarget.setPointerCapture( event.pointerId );
		setDrag( {
			id: hotspot.id,
			x: hotspot.x,
			y: hotspot.y,
			startX: event.clientX,
			startY: event.clientY,
			moved: false,
		} );
	};

	const onMarkerPointerMove = ( hotspot ) => ( event ) => {
		if ( ! drag || drag.id !== hotspot.id ) {
			return;
		}
		const moved =
			drag.moved ||
			Math.abs( event.clientX - drag.startX ) > DRAG_THRESHOLD_PX ||
			Math.abs( event.clientY - drag.startY ) > DRAG_THRESHOLD_PX;
		if ( ! moved ) {
			return;
		}
		setDrag( { ...drag, ...pointFromEvent( event ), moved: true } );
	};

	const onMarkerPointerUp = ( hotspot ) => () => {
		if ( ! drag || drag.id !== hotspot.id ) {
			return;
		}
		if ( drag.moved ) {
			updateHotspot( hotspot.id, { x: drag.x, y: drag.y } );
		}
		setSelectedId( hotspot.id );
		setIsPlacing( false );
		setDrag( null );
	};

	// Arrow keys nudge by 0.5% (2% with Shift).
	const onMarkerKeyDown = ( hotspot ) => ( event ) => {
		const step = event.shiftKey ? 2 : 0.5;
		const deltas = {
			ArrowLeft: [ -step, 0 ],
			ArrowRight: [ step, 0 ],
			ArrowUp: [ 0, -step ],
			ArrowDown: [ 0, step ],
		};
		const delta = deltas[ event.key ];
		if ( ! delta ) {
			return;
		}
		event.preventDefault();
		updateHotspot( hotspot.id, {
			x: clampPct( hotspot.x + delta[ 0 ] ),
			y: clampPct( hotspot.y + delta[ 1 ] ),
		} );
	};

	if ( ! imageUrl ) {
		return (
			<div { ...blockProps }>
				<MediaPlaceholder
					icon="location"
					labels={ {
						title: __( 'PinSpot - Image Hotspots', 'pinspot' ),
						instructions: __(
							'Upload or select the image you want to annotate with hotspots.',
							'pinspot'
						),
					} }
					accept="image/*"
					allowedTypes={ [ 'image' ] }
					onSelect={ onSelectImage }
				/>
			</div>
		);
	}

	return (
		<>
			<BlockControls group="other">
				<MediaReplaceFlow
					mediaId={ imageId }
					mediaURL={ imageUrl }
					accept="image/*"
					allowedTypes={ [ 'image' ] }
					onSelect={ onSelectImage }
					name={ __( 'Replace image', 'pinspot' ) }
				/>
				<ToolbarButton
					icon="plus-alt2"
					label={ __( 'Add hotspot', 'pinspot' ) }
					isPressed={ isPlacing }
					onClick={ () => setIsPlacing( ! isPlacing ) }
				/>
			</BlockControls>

			<InspectorControls>
				{ selectedHotspot && (
					<HotspotInspector
						hotspot={ selectedHotspot }
						number={ hotspots.indexOf( selectedHotspot ) + 1 }
						existingGroups={ existingGroups }
						canPasteStyle={ !! copiedStyle }
						hotspotCount={ hotspots.length }
						onChange={ ( changes ) =>
							updateHotspot( selectedHotspot.id, changes )
						}
						onRemove={ () => removeHotspot( selectedHotspot.id ) }
						onCopyStyle={ copyStyle }
						onPasteStyle={ pasteStyle }
						onApplyStyleToAll={ applyStyleToAll }
					/>
				) }
				<HotspotList
					hotspots={ hotspots }
					selectedId={ selectedId }
					onSelect={ setSelectedId }
					onChange={ ( next ) => setAttributes( { hotspots: next } ) }
				/>
				<PanelBody
					title={ __( 'Tooltips', 'pinspot' ) }
					initialOpen={ true }
				>
					<SelectControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __( 'Open tooltips on', 'pinspot' ) }
						value={ globalTrigger }
						options={ [
							{
								label: __( 'Click', 'pinspot' ),
								value: 'click',
							},
							{
								label: __( 'Hover', 'pinspot' ),
								value: 'hover',
							},
						] }
						onChange={ ( value ) =>
							setAttributes( { globalTrigger: value } )
						}
						help={ __(
							'Hover tooltips still open on click for touch devices.',
							'pinspot'
						) }
					/>
					<SelectControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __( 'Tooltip theme', 'pinspot' ) }
						value={ globalTheme }
						options={ [
							{
								label: __( 'Light', 'pinspot' ),
								value: 'light',
							},
							{
								label: __( 'Dark', 'pinspot' ),
								value: 'dark',
							},
						] }
						onChange={ ( value ) =>
							setAttributes( { globalTheme: value } )
						}
					/>
					<RangeControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __( 'Tooltip width (px)', 'pinspot' ) }
						value={ tooltipWidth }
						min={ 180 }
						max={ 480 }
						step={ 10 }
						onChange={ ( value ) =>
							setAttributes( { tooltipWidth: value } )
						}
					/>
				</PanelBody>
				<PanelBody
					title={ __( 'Hotspot list & filters', 'pinspot' ) }
					initialOpen={ false }
				>
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __(
							'Show hotspot list below image',
							'pinspot'
						) }
						checked={ !! showList }
						onChange={ ( value ) =>
							setAttributes( { showList: value } )
						}
						help={ __(
							'A plain, accessible list of all hotspot content — great for screen readers and SEO.',
							'pinspot'
						) }
					/>
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __( 'Enable group filters', 'pinspot' ) }
						checked={ !! enableFilters }
						onChange={ ( value ) =>
							setAttributes( { enableFilters: value } )
						}
						help={ __(
							'Adds filter chips so visitors can show or hide hotspots by group. Assign a group to each hotspot in its panel; chips appear once two or more groups exist.',
							'pinspot'
						) }
					/>
				</PanelBody>
				<PanelBody
					title={ __( 'Guided tour', 'pinspot' ) }
					initialOpen={ false }
				>
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __( 'Enable guided tour', 'pinspot' ) }
						checked={ !! enableTour }
						onChange={ ( value ) =>
							setAttributes( { enableTour: value } )
						}
						help={ __(
							'Adds Previous/Next controls that step visitors through the hotspots in order.',
							'pinspot'
						) }
					/>
					{ enableTour && (
						<ToggleControl
							__nextHasNoMarginBottom
							label={ __( 'Autoplay the tour', 'pinspot' ) }
							checked={ !! tourAutoplay }
							onChange={ ( value ) =>
								setAttributes( { tourAutoplay: value } )
							}
							help={ __(
								'Advances automatically. Visitors get a pause button, and autoplay stays off for anyone who prefers reduced motion.',
								'pinspot'
							) }
						/>
					) }
					{ enableTour && tourAutoplay && (
						<RangeControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							label={ __( 'Seconds per hotspot', 'pinspot' ) }
							value={ tourInterval }
							min={ 2 }
							max={ 20 }
							step={ 1 }
							onChange={ ( value ) =>
								setAttributes( { tourInterval: value } )
							}
						/>
					) }
					{ enableTour && (
						<>
							<ToggleControl
								__nextHasNoMarginBottom
								label={ __(
									'Show position counter',
									'pinspot'
								) }
								checked={ tourShowCount !== false }
								onChange={ ( value ) =>
									setAttributes( { tourShowCount: value } )
								}
								help={ __(
									'Displays the “2 / 5” position numbers between the arrows.',
									'pinspot'
								) }
							/>
							<SelectControl
								__next40pxDefaultSize
								__nextHasNoMarginBottom
								label={ __( 'Tour bar position', 'pinspot' ) }
								value={ tourPosition || 'below' }
								options={ [
									{
										label: __(
											'Below the image',
											'pinspot'
										),
										value: 'below',
									},
									{
										label: __(
											'Overlaid on the image',
											'pinspot'
										),
										value: 'overlay',
									},
								] }
								onChange={ ( value ) =>
									setAttributes( { tourPosition: value } )
								}
							/>
							<SelectControl
								__next40pxDefaultSize
								__nextHasNoMarginBottom
								label={ __( 'Button size', 'pinspot' ) }
								value={ tourButtonSize || 'medium' }
								options={ [
									{
										label: __( 'Small', 'pinspot' ),
										value: 'small',
									},
									{
										label: __( 'Medium', 'pinspot' ),
										value: 'medium',
									},
									{
										label: __( 'Large', 'pinspot' ),
										value: 'large',
									},
								] }
								onChange={ ( value ) =>
									setAttributes( { tourButtonSize: value } )
								}
							/>
							<SelectControl
								__next40pxDefaultSize
								__nextHasNoMarginBottom
								label={ __( 'Button shape', 'pinspot' ) }
								value={ tourButtonShape || 'round' }
								options={ [
									{
										label: __( 'Round', 'pinspot' ),
										value: 'round',
									},
									{
										label: __(
											'Rounded square',
											'pinspot'
										),
										value: 'rounded',
									},
								] }
								onChange={ ( value ) =>
									setAttributes( { tourButtonShape: value } )
								}
							/>
							<BaseControl
								__nextHasNoMarginBottom
								label={ __( 'Button color', 'pinspot' ) }
								id="pinspot-tour-color"
							>
								<ColorPalette
									colors={ palette || [] }
									value={ tourColor || undefined }
									onChange={ ( value ) =>
										setAttributes( {
											tourColor: value || '',
										} )
									}
									enableAlpha={ false }
								/>
							</BaseControl>
						</>
					) }
				</PanelBody>
				<PanelBody
					title={ __( 'Zoom & pan', 'pinspot' ) }
					initialOpen={ false }
				>
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __( 'Enable zoom & pan', 'pinspot' ) }
						checked={ !! enableZoom }
						onChange={ ( value ) =>
							setAttributes( { enableZoom: value } )
						}
						help={ __(
							'Adds zoom controls, double-click zoom, pinch, and drag-to-pan on the site.',
							'pinspot'
						) }
					/>
					{ enableZoom && (
						<RangeControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							label={ __( 'Maximum zoom', 'pinspot' ) }
							value={ maxZoom }
							min={ 1.5 }
							max={ 8 }
							step={ 0.5 }
							onChange={ ( value ) =>
								setAttributes( { maxZoom: value } )
							}
						/>
					) }
				</PanelBody>
				<ImportExport
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>
			</InspectorControls>

			<figure { ...blockProps }>
				{ isSelected && isPlacing && (
					<Notice
						status="info"
						isDismissible={ false }
						className="pinspot-placing-notice"
					>
						{ __(
							'Click anywhere on the image to place the hotspot.',
							'pinspot'
						) }
					</Notice>
				) }
				{ /* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */ }
				<div
					className="pinspot__canvas"
					onClick={ onCanvasClick }
					role="application"
					aria-label={ __( 'Hotspot placement canvas', 'pinspot' ) }
					ref={ canvasRef }
				>
					<img
						className="pinspot__image"
						src={ imageUrl }
						alt={ imageAlt }
					/>
					{ hotspots.map( ( hotspot, index ) => {
						const isDraggingThis =
							drag && drag.id === hotspot.id && drag.moved;
						const x = isDraggingThis ? drag.x : hotspot.x;
						const y = isDraggingThis ? drag.y : hotspot.y;
						return (
							<button
								key={ hotspot.id }
								type="button"
								className={ markerClassName(
									hotspot,
									( hotspot.id === selectedId
										? 'is-selected '
										: '' ) +
										( isDraggingThis ? 'is-dragging' : '' )
								) }
								style={ {
									left: `${ x }%`,
									top: `${ y }%`,
									...( hotspot.markerColor
										? {
												'--pinspot-marker-color':
													hotspot.markerColor,
										  }
										: {} ),
								} }
								aria-label={
									hotspot.title ||
									sprintf(
										/* translators: %d: hotspot number. */
										__( 'Hotspot %d', 'pinspot' ),
										index + 1
									)
								}
								onClick={ ( event ) => event.stopPropagation() }
								onPointerDown={ onMarkerPointerDown( hotspot ) }
								onPointerMove={ onMarkerPointerMove( hotspot ) }
								onPointerUp={ onMarkerPointerUp( hotspot ) }
								onKeyDown={ onMarkerKeyDown( hotspot ) }
							>
								{ 'image' ===
								effectiveMarkerStyle( hotspot ) ? (
									<img
										className="pinspot__marker-img"
										src={ hotspot.markerImageUrl }
										alt=""
									/>
								) : (
									<span aria-hidden="true">
										{ markerGlyph(
											effectiveMarkerStyle( hotspot ),
											index + 1,
											hotspot.markerValue
										) }
									</span>
								) }
							</button>
						);
					} ) }
					{ selectedHotspot && ! isPlacing && ! drag && (
						<HotspotTooltipEditor
							hotspot={ selectedHotspot }
							onChange={ ( changes ) =>
								updateHotspot( selectedHotspot.id, changes )
							}
						/>
					) }
				</div>
			</figure>
		</>
	);
}
