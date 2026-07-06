/**
 * Editor UI for the pinspot/image-hotspots block.
 *
 * Phase 0 stub — Phase 1 adds the image picker and click-to-place;
 * Phase 2 adds the full inspector, drag, and the hotspot list panel.
 */
import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import { Placeholder } from '@wordpress/components';

export default function Edit() {
	const blockProps = useBlockProps();

	return (
		<div { ...blockProps }>
			<Placeholder
				icon="location"
				label={ __( 'Pinspot — Image Hotspots', 'pinspot' ) }
				instructions={ __(
					'Select an image to start placing hotspots. (Phase 1 in progress.)',
					'pinspot'
				) }
			/>
		</div>
	);
}
