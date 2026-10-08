/**
 * Registers the pinspot/image-hotspots block.
 */
import { registerBlockType } from '@wordpress/blocks';
import { addFilter } from '@wordpress/hooks';

import metadata from './block.json';
import edit from './edit';
import save from './save';
import './style.scss';
import './editor.scss';

// Apply the site-wide defaults (Settings dashboard) to new blocks. Existing
// blocks keep their own stored values.
addFilter(
	'blocks.registerBlockType',
	'pinspot/site-defaults',
	( settings, name ) => {
		if ( metadata.name !== name ) {
			return settings;
		}
		const site = window.pinspotSettings || {};
		const attributes = { ...settings.attributes };
		if ( site.defaultTrigger && attributes.globalTrigger ) {
			attributes.globalTrigger = {
				...attributes.globalTrigger,
				default: site.defaultTrigger,
			};
		}
		if ( site.defaultTheme && attributes.globalTheme ) {
			attributes.globalTheme = {
				...attributes.globalTheme,
				default: site.defaultTheme,
			};
		}
		if ( site.defaultTooltipWidth && attributes.tooltipWidth ) {
			attributes.tooltipWidth = {
				...attributes.tooltipWidth,
				default: Number( site.defaultTooltipWidth ),
			};
		}
		return { ...settings, attributes };
	}
);

registerBlockType( metadata.name, {
	edit,
	save,
} );
