/**
 * Frontend runtime for Pinspot — WordPress Interactivity API store.
 *
 * `openId` lives on the block-level context; each hotspot's context adds
 * its own `id`. Writes to `openId` from a hotspot scope propagate to the
 * block context (inherited-property forwarding), so only one tooltip is
 * open per block at a time.
 */
import { store, getContext } from '@wordpress/interactivity';

store(
	'pinspot',
	{
		state: {
			get isOpen() {
				const { id, openId } = getContext();
				return openId === id;
			},
		},
		actions: {
			toggle( event ) {
				// Keep the document click handler from immediately closing it.
				event.stopPropagation();
				const context = getContext();
				context.openId =
					context.openId === context.id ? '' : context.id;
			},
			closeAll() {
				const context = getContext();
				context.openId = '';
			},
			onKeydown( event ) {
				if ( 'Escape' === event.key ) {
					const context = getContext();
					context.openId = '';
				}
			},
		},
	},
	{ lock: true }
);
