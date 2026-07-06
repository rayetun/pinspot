/**
 * Editor UI for the pinspot/image-hotspots block.
 *
 * Phase 1: image picker, click-to-place hotspots, and a minimal
 * per-hotspot inspector (title, description, remove).
 * Phase 2 adds drag-to-move, rich media fields, and marker styles.
 */
import { __, sprintf } from '@wordpress/i18n';
import {
	useBlockProps,
	MediaPlaceholder,
	MediaReplaceFlow,
	BlockControls,
	InspectorControls,
} from '@wordpress/block-editor';
import {
	ToolbarButton,
	PanelBody,
	TextControl,
	TextareaControl,
	Button,
	Notice,
} from '@wordpress/components';
import { useState } from '@wordpress/element';

export default function Edit( { attributes, setAttributes, isSelected } ) {
	const { imageId, imageUrl, imageAlt, hotspots } = attributes;
	const [ isPlacing, setIsPlacing ] = useState( false );
	const [ selectedId, setSelectedId ] = useState( null );

	const blockProps = useBlockProps( {
		className: isPlacing ? 'is-placing-hotspot' : undefined,
	} );

	const selectedHotspot = hotspots.find( ( h ) => h.id === selectedId );

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

	const onCanvasClick = ( event ) => {
		if ( ! isPlacing ) {
			setSelectedId( null );
			return;
		}
		const rect = event.currentTarget.getBoundingClientRect();
		const x = ( ( event.clientX - rect.left ) / rect.width ) * 100;
		const y = ( ( event.clientY - rect.top ) / rect.height ) * 100;
		const id = `hs-${ Date.now().toString( 36 ) }-${ hotspots.length }`;

		setAttributes( {
			hotspots: [
				...hotspots,
				{
					id,
					x: Math.round( x * 100 ) / 100,
					y: Math.round( y * 100 ) / 100,
					title: '',
					description: '',
				},
			],
		} );
		setSelectedId( id );
		setIsPlacing( false );
	};

	if ( ! imageUrl ) {
		return (
			<div { ...blockProps }>
				<MediaPlaceholder
					icon="location"
					labels={ {
						title: __( 'Pinspot — Image Hotspots', 'pinspot' ),
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
				{ selectedHotspot ? (
					<PanelBody
						title={ sprintf(
							/* translators: %d: hotspot number. */
							__( 'Hotspot %d', 'pinspot' ),
							hotspots.indexOf( selectedHotspot ) + 1
						) }
					>
						<TextControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							label={ __( 'Title', 'pinspot' ) }
							value={ selectedHotspot.title }
							onChange={ ( title ) =>
								updateHotspot( selectedHotspot.id, { title } )
							}
						/>
						<TextareaControl
							__nextHasNoMarginBottom
							label={ __( 'Description', 'pinspot' ) }
							value={ selectedHotspot.description }
							onChange={ ( description ) =>
								updateHotspot( selectedHotspot.id, {
									description,
								} )
							}
						/>
						<Button
							variant="secondary"
							isDestructive
							onClick={ () =>
								removeHotspot( selectedHotspot.id )
							}
						>
							{ __( 'Remove hotspot', 'pinspot' ) }
						</Button>
					</PanelBody>
				) : (
					<PanelBody title={ __( 'Hotspots', 'pinspot' ) }>
						<p>
							{ hotspots.length
								? __(
										'Select a marker on the image to edit its tooltip.',
										'pinspot'
								  )
								: __(
										'Use “Add hotspot” in the toolbar, then click a spot on the image.',
										'pinspot'
								  ) }
						</p>
					</PanelBody>
				) }
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
				>
					<img
						className="pinspot__image"
						src={ imageUrl }
						alt={ imageAlt }
					/>
					{ hotspots.map( ( hotspot, index ) => (
						<button
							key={ hotspot.id }
							type="button"
							className={
								'pinspot__marker' +
								( hotspot.id === selectedId
									? ' is-selected'
									: '' )
							}
							style={ {
								left: `${ hotspot.x }%`,
								top: `${ hotspot.y }%`,
							} }
							aria-label={
								hotspot.title ||
								sprintf(
									/* translators: %d: hotspot number. */
									__( 'Hotspot %d', 'pinspot' ),
									index + 1
								)
							}
							onClick={ ( event ) => {
								event.stopPropagation();
								setSelectedId( hotspot.id );
								setIsPlacing( false );
							} }
						>
							<span aria-hidden="true">{ index + 1 }</span>
						</button>
					) ) }
				</div>
			</figure>
		</>
	);
}
