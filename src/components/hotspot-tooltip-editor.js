/**
 * On-canvas editable tooltip for the selected hotspot.
 *
 * Shows an editing surface anchored to the marker so the title and
 * description can be written directly on the image. The title is a plain
 * text input (stored raw, so the frontend's esc_html doesn't double-encode
 * entities); the description is RichText limited to bold/italic/link, whose
 * HTML output maps exactly to what render.php allows via wp_kses + nl2br.
 */
import { __ } from '@wordpress/i18n';
import { RichText } from '@wordpress/block-editor';

export default function HotspotTooltipEditor( { hotspot, onChange } ) {
	// Flip below the marker when it sits near the top edge of the image.
	const below = ( hotspot.y || 0 ) < 26;

	// Keep interactions inside the tooltip from reaching the canvas (which
	// would otherwise deselect the hotspot or start placing a new one).
	const stop = ( event ) => event.stopPropagation();

	return (
		/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */
		<div
			className={ `pinspot__edit-tip${ below ? ' is-below' : '' }` }
			style={ { left: `${ hotspot.x }%`, top: `${ hotspot.y }%` } }
			onClick={ stop }
			onPointerDown={ stop }
		>
			<input
				type="text"
				className="pinspot__edit-title"
				value={ hotspot.title || '' }
				placeholder={ __( 'Add a title…', 'pinspot' ) }
				onChange={ ( event ) =>
					onChange( { title: event.target.value } )
				}
				onKeyDown={ stop }
			/>
			<RichText
				tagName="div"
				className="pinspot__edit-desc"
				value={ hotspot.description || '' }
				allowedFormats={ [ 'core/bold', 'core/italic', 'core/link' ] }
				onChange={ ( description ) => onChange( { description } ) }
				placeholder={ __( 'Add a description…', 'pinspot' ) }
			/>
		</div>
	);
}
