/**
 * Sidebar inspector for a single selected hotspot.
 *
 * Behavior fields (trigger, placement, theme, animation, lightbox) are
 * stored now; their frontend semantics land in Phase 3.
 */
import { __, sprintf } from '@wordpress/i18n';
import {
	MediaUpload,
	MediaUploadCheck,
	useSettings,
} from '@wordpress/block-editor';
import {
	PanelBody,
	TextControl,
	TextareaControl,
	SelectControl,
	ToggleControl,
	Button,
	BaseControl,
	ColorPalette,
} from '@wordpress/components';

const MARKER_STYLE_OPTIONS = [
	{ label: __( 'Numbered', 'pinspot' ), value: 'number' },
	{ label: __( 'Dot', 'pinspot' ), value: 'dot' },
	{ label: __( 'Plus', 'pinspot' ), value: 'plus' },
	{ label: __( 'Info', 'pinspot' ), value: 'info' },
	{ label: __( 'Question', 'pinspot' ), value: 'question' },
];

const MARKER_SIZE_OPTIONS = [
	{ label: __( 'Small', 'pinspot' ), value: 'small' },
	{ label: __( 'Medium', 'pinspot' ), value: 'medium' },
	{ label: __( 'Large', 'pinspot' ), value: 'large' },
];

const ANIMATION_OPTIONS = [
	{ label: __( 'None', 'pinspot' ), value: '' },
	{ label: __( 'Pulse', 'pinspot' ), value: 'pulse' },
	{ label: __( 'Bounce', 'pinspot' ), value: 'bounce' },
];

const MEDIA_TYPE_OPTIONS = [
	{ label: __( 'None', 'pinspot' ), value: '' },
	{ label: __( 'Image', 'pinspot' ), value: 'image' },
	{ label: __( 'Video (media library)', 'pinspot' ), value: 'video' },
	{ label: __( 'YouTube', 'pinspot' ), value: 'youtube' },
	{ label: __( 'Vimeo', 'pinspot' ), value: 'vimeo' },
];

const TRIGGER_OPTIONS = [
	{ label: __( 'Inherit from block', 'pinspot' ), value: '' },
	{ label: __( 'Click', 'pinspot' ), value: 'click' },
	{ label: __( 'Hover', 'pinspot' ), value: 'hover' },
];

const PLACEMENT_OPTIONS = [
	{ label: __( 'Auto', 'pinspot' ), value: 'auto' },
	{ label: __( 'Top', 'pinspot' ), value: 'top' },
	{ label: __( 'Bottom', 'pinspot' ), value: 'bottom' },
	{ label: __( 'Left', 'pinspot' ), value: 'left' },
	{ label: __( 'Right', 'pinspot' ), value: 'right' },
];

const THEME_OPTIONS = [
	{ label: __( 'Inherit from block', 'pinspot' ), value: '' },
	{ label: __( 'Light', 'pinspot' ), value: 'light' },
	{ label: __( 'Dark', 'pinspot' ), value: 'dark' },
];

export default function HotspotInspector( {
	hotspot,
	number,
	onChange,
	onRemove,
} ) {
	const [ palette ] = useSettings( 'color.palette' );
	const mediaType = hotspot.mediaType || '';
	const usesLibraryMedia = 'image' === mediaType || 'video' === mediaType;

	return (
		<>
			<PanelBody
				title={ sprintf(
					/* translators: %d: hotspot number. */
					__( 'Hotspot %d', 'pinspot' ),
					number
				) }
			>
				<TextControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={ __( 'Title', 'pinspot' ) }
					value={ hotspot.title || '' }
					onChange={ ( title ) => onChange( { title } ) }
				/>
				<TextareaControl
					__nextHasNoMarginBottom
					label={ __( 'Description', 'pinspot' ) }
					value={ hotspot.description || '' }
					onChange={ ( description ) => onChange( { description } ) }
					help={ __(
						'Line breaks are kept. Basic HTML allowed: <strong>, <em>, <a>.',
						'pinspot'
					) }
				/>
				<Button
					variant="secondary"
					isDestructive
					onClick={ onRemove }
					className="pinspot-remove-hotspot"
				>
					{ __( 'Remove hotspot', 'pinspot' ) }
				</Button>
			</PanelBody>

			<PanelBody title={ __( 'Media', 'pinspot' ) } initialOpen={ false }>
				<SelectControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={ __( 'Media type', 'pinspot' ) }
					value={ mediaType }
					options={ MEDIA_TYPE_OPTIONS }
					onChange={ ( value ) =>
						onChange( {
							mediaType: value,
							mediaId: 0,
							mediaUrl: '',
						} )
					}
				/>
				{ usesLibraryMedia && (
					<MediaUploadCheck>
						<MediaUpload
							allowedTypes={ [ mediaType ] }
							value={ hotspot.mediaId || 0 }
							onSelect={ ( media ) =>
								onChange( {
									mediaId: media.id,
									mediaUrl: media.url,
								} )
							}
							render={ ( { open } ) => (
								<div className="pinspot-media-field">
									{ hotspot.mediaUrl &&
										'image' === mediaType && (
											<img
												className="pinspot-media-preview"
												src={ hotspot.mediaUrl }
												alt=""
											/>
										) }
									{ hotspot.mediaUrl &&
										'video' === mediaType && (
											// eslint-disable-next-line jsx-a11y/media-has-caption
											<video
												className="pinspot-media-preview"
												src={ hotspot.mediaUrl }
												controls
											/>
										) }
									<Button
										variant="secondary"
										onClick={ open }
									>
										{ hotspot.mediaUrl
											? __( 'Replace media', 'pinspot' )
											: __( 'Select media', 'pinspot' ) }
									</Button>
									{ hotspot.mediaUrl && (
										<Button
											variant="tertiary"
											isDestructive
											onClick={ () =>
												onChange( {
													mediaId: 0,
													mediaUrl: '',
												} )
											}
										>
											{ __( 'Clear', 'pinspot' ) }
										</Button>
									) }
								</div>
							) }
						/>
					</MediaUploadCheck>
				) }
				{ ( 'youtube' === mediaType || 'vimeo' === mediaType ) && (
					<TextControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={
							'youtube' === mediaType
								? __( 'YouTube URL', 'pinspot' )
								: __( 'Vimeo URL', 'pinspot' )
						}
						type="url"
						value={ hotspot.mediaUrl || '' }
						onChange={ ( mediaUrl ) => onChange( { mediaUrl } ) }
						help={ __(
							'Paste the video page URL — the embed is generated automatically.',
							'pinspot'
						) }
					/>
				) }
			</PanelBody>

			<PanelBody
				title={ __( 'Call to action', 'pinspot' ) }
				initialOpen={ false }
			>
				<TextControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={ __( 'Button text', 'pinspot' ) }
					value={ hotspot.linkText || '' }
					onChange={ ( linkText ) => onChange( { linkText } ) }
				/>
				<TextControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={ __( 'Link URL', 'pinspot' ) }
					type="url"
					value={ hotspot.linkUrl || '' }
					onChange={ ( linkUrl ) => onChange( { linkUrl } ) }
				/>
				<ToggleControl
					__nextHasNoMarginBottom
					label={ __( 'Open in new tab', 'pinspot' ) }
					checked={ !! hotspot.linkNewTab }
					onChange={ ( linkNewTab ) => onChange( { linkNewTab } ) }
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'Marker', 'pinspot' ) }
				initialOpen={ false }
			>
				<SelectControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={ __( 'Style', 'pinspot' ) }
					value={ hotspot.markerStyle || 'number' }
					options={ MARKER_STYLE_OPTIONS }
					onChange={ ( markerStyle ) => onChange( { markerStyle } ) }
				/>
				<SelectControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={ __( 'Size', 'pinspot' ) }
					value={ hotspot.markerSize || 'medium' }
					options={ MARKER_SIZE_OPTIONS }
					onChange={ ( markerSize ) => onChange( { markerSize } ) }
				/>
				<BaseControl
					__nextHasNoMarginBottom
					label={ __( 'Color', 'pinspot' ) }
					id="pinspot-marker-color"
				>
					<ColorPalette
						colors={ palette || [] }
						value={ hotspot.markerColor || undefined }
						onChange={ ( markerColor ) =>
							onChange( { markerColor: markerColor || '' } )
						}
						enableAlpha={ false }
					/>
				</BaseControl>
				<SelectControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={ __( 'Animation', 'pinspot' ) }
					value={ hotspot.animation || '' }
					options={ ANIMATION_OPTIONS }
					onChange={ ( animation ) => onChange( { animation } ) }
					help={ __(
						'Shown on the site. Respects reduced-motion preferences.',
						'pinspot'
					) }
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'Behavior', 'pinspot' ) }
				initialOpen={ false }
			>
				<SelectControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={ __( 'Open on', 'pinspot' ) }
					value={ hotspot.trigger || '' }
					options={ TRIGGER_OPTIONS }
					onChange={ ( trigger ) => onChange( { trigger } ) }
				/>
				<SelectControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={ __( 'Tooltip placement', 'pinspot' ) }
					value={ hotspot.placement || 'auto' }
					options={ PLACEMENT_OPTIONS }
					onChange={ ( placement ) => onChange( { placement } ) }
				/>
				<SelectControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={ __( 'Theme', 'pinspot' ) }
					value={ hotspot.theme || '' }
					options={ THEME_OPTIONS }
					onChange={ ( theme ) => onChange( { theme } ) }
				/>
				<ToggleControl
					__nextHasNoMarginBottom
					label={ __( 'Open media in lightbox', 'pinspot' ) }
					checked={ !! hotspot.lightbox }
					onChange={ ( lightbox ) => onChange( { lightbox } ) }
					help={ __(
						'Clicking the tooltip media opens it full-size.',
						'pinspot'
					) }
				/>
			</PanelBody>
		</>
	);
}
