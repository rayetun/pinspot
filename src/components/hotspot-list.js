/**
 * "All hotspots" sidebar panel: select, reorder, duplicate, delete.
 */
import { __, sprintf } from '@wordpress/i18n';
import { PanelBody, Button } from '@wordpress/components';
import { chevronUp, chevronDown, copy, trash } from '@wordpress/icons';

const newId = ( suffix ) => `hs-${ Date.now().toString( 36 ) }-${ suffix }`;

export default function HotspotList( {
	hotspots,
	selectedId,
	onSelect,
	onChange,
} ) {
	const move = ( index, delta ) => {
		const target = index + delta;
		if ( target < 0 || target >= hotspots.length ) {
			return;
		}
		const next = [ ...hotspots ];
		[ next[ index ], next[ target ] ] = [ next[ target ], next[ index ] ];
		onChange( next );
	};

	const duplicate = ( index ) => {
		const source = hotspots[ index ];
		const clone = {
			...source,
			id: newId( hotspots.length ),
			x: Math.min( 100, ( source.x || 0 ) + 3 ),
			y: Math.min( 100, ( source.y || 0 ) + 3 ),
		};
		const next = [ ...hotspots ];
		next.splice( index + 1, 0, clone );
		onChange( next );
		onSelect( clone.id );
	};

	const remove = ( index ) => {
		const removed = hotspots[ index ];
		onChange( hotspots.filter( ( _, i ) => i !== index ) );
		if ( removed.id === selectedId ) {
			onSelect( null );
		}
	};

	return (
		<PanelBody
			title={ __( 'All hotspots', 'pinspot' ) }
			initialOpen={ ! selectedId }
		>
			{ ! hotspots.length && (
				<p>
					{ __(
						'Use “Add hotspot” in the toolbar, then click a spot on the image.',
						'pinspot'
					) }
				</p>
			) }
			<ul className="pinspot-hotspot-list">
				{ hotspots.map( ( hotspot, index ) => (
					<li
						key={ hotspot.id }
						className={
							hotspot.id === selectedId ? 'is-selected' : ''
						}
					>
						<Button
							className="pinspot-hotspot-list__label"
							onClick={ () => onSelect( hotspot.id ) }
						>
							{ sprintf(
								/* translators: 1: hotspot number, 2: hotspot title. */
								__( '%1$d. %2$s', 'pinspot' ),
								index + 1,
								hotspot.title || __( '(untitled)', 'pinspot' )
							) }
						</Button>
						<Button
							icon={ chevronUp }
							size="small"
							disabled={ 0 === index }
							onClick={ () => move( index, -1 ) }
							label={ __( 'Move up', 'pinspot' ) }
						/>
						<Button
							icon={ chevronDown }
							size="small"
							disabled={ index === hotspots.length - 1 }
							onClick={ () => move( index, 1 ) }
							label={ __( 'Move down', 'pinspot' ) }
						/>
						<Button
							icon={ copy }
							size="small"
							onClick={ () => duplicate( index ) }
							label={ __( 'Duplicate', 'pinspot' ) }
						/>
						<Button
							icon={ trash }
							size="small"
							isDestructive
							onClick={ () => remove( index ) }
							label={ __( 'Delete', 'pinspot' ) }
						/>
					</li>
				) ) }
			</ul>
		</PanelBody>
	);
}
