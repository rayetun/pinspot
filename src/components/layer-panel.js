/**
 * Inspector panel for a block's layered images.
 *
 * A PinSpot block can stack several images — the floors of a floor plan, a
 * before and an after, a wide shot and a close-up — and visitors switch between
 * them. Each image keeps its own hotspots, so this panel also decides which
 * image the canvas is editing: pins placed go to the active layer.
 *
 * Reordering and renaming are offered only once there are two or more images,
 * so a plain single-image block shows just the "Add another image" button and
 * never has to think about layers.
 */

import { __, sprintf } from '@wordpress/i18n';
import { MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import { Button, Notice, PanelBody, TextControl } from '@wordpress/components';

/**
 * The layers panel.
 *
 * @param {Object}   props             Props.
 * @param {Object[]} props.layers      Normalized layers.
 * @param {number}   props.activeIndex Index of the layer being edited.
 * @param {Function} props.onSelect    Receives the index to edit.
 * @param {Function} props.onAdd       Receives a selected media object.
 * @param {Function} props.onRemove    Receives the index to remove.
 * @param {Function} props.onRename    Receives (index, name).
 * @param {Function} props.onMove      Receives (index, -1 | 1).
 * @return {JSX.Element} Panel.
 */
export default function LayerPanel( {
	layers,
	activeIndex,
	onSelect,
	onAdd,
	onRemove,
	onRename,
	onMove,
} ) {
	const multi = layers.length > 1;
	const active = layers[ activeIndex ];

	return (
		<PanelBody
			title={ __( 'Images & layers', 'pinspot' ) }
			initialOpen={ multi }
		>
			<p className="pinspot-layers__help">
				{ __(
					'Stack several images in one block — the floors of a floor plan, a before and an after, or a wide shot and a close-up. Visitors switch between them, and each image keeps its own hotspots.',
					'pinspot'
				) }
			</p>

			<ul className="pinspot-layers__list">
				{ layers.map( ( layer, i ) => (
					<li
						key={ layer.id }
						className={
							i === activeIndex
								? 'pinspot-layers__row is-active'
								: 'pinspot-layers__row'
						}
					>
						<Button
							className="pinspot-layers__pick"
							variant={
								i === activeIndex ? 'primary' : 'tertiary'
							}
							onClick={ () => onSelect( i ) }
							aria-pressed={ i === activeIndex }
						>
							{ layer.name }
						</Button>
						{ multi && (
							<span className="pinspot-layers__ops">
								<Button
									icon="arrow-up-alt2"
									size="small"
									label={ __( 'Move earlier', 'pinspot' ) }
									disabled={ 0 === i }
									onClick={ () => onMove( i, -1 ) }
								/>
								<Button
									icon="arrow-down-alt2"
									size="small"
									label={ __( 'Move later', 'pinspot' ) }
									disabled={ i === layers.length - 1 }
									onClick={ () => onMove( i, 1 ) }
								/>
								<Button
									icon="trash"
									size="small"
									isDestructive
									label={ __(
										'Remove this image',
										'pinspot'
									) }
									onClick={ () => onRemove( i ) }
								/>
							</span>
						) }
					</li>
				) ) }
			</ul>

			{ multi && active && (
				<TextControl
					label={ __( 'Label for this image', 'pinspot' ) }
					help={ __(
						'Shown on the button visitors click to switch to it.',
						'pinspot'
					) }
					value={ active.name }
					onChange={ ( value ) => onRename( activeIndex, value ) }
					__nextHasNoMarginBottom
				/>
			) }

			<MediaUploadCheck>
				<MediaUpload
					allowedTypes={ [ 'image' ] }
					onSelect={ onAdd }
					render={ ( { open } ) => (
						<Button
							variant="secondary"
							icon="plus"
							onClick={ open }
						>
							{ __( 'Add another image', 'pinspot' ) }
						</Button>
					) }
				/>
			</MediaUploadCheck>

			{ multi && active && (
				<Notice status="info" isDismissible={ false }>
					{ sprintf(
						/* translators: %s: layer label, e.g. Ground floor. */
						__(
							'Editing %s. Pins you place belong to this image.',
							'pinspot'
						),
						active.name
					) }
				</Notice>
			) }
		</PanelBody>
	);
}
