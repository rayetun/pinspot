/**
 * Import / Export panel: download the hotspot configuration as JSON,
 * or import one (merge or replace) with per-field validation.
 */
import { __, sprintf } from '@wordpress/i18n';
import {
	PanelBody,
	Button,
	ToggleControl,
	Notice,
} from '@wordpress/components';
import { useState, useRef } from '@wordpress/element';

const MARKER_STYLES = [ 'number', 'dot', 'plus', 'info', 'question' ];
const MARKER_SIZES = [ 'small', 'medium', 'large' ];
const ANIMATIONS = [ 'pulse', 'bounce' ];
const TRIGGERS = [ 'click', 'hover' ];
const PLACEMENTS = [ 'auto', 'top', 'bottom', 'left', 'right' ];
const THEMES = [ 'light', 'dark' ];
const MEDIA_TYPES = [ 'image', 'video', 'youtube', 'vimeo' ];

const oneOf = ( value, allowed, fallback ) =>
	allowed.includes( value ) ? value : fallback;
const str = ( value ) => ( 'string' === typeof value ? value : '' );
const clampPct = ( value ) => {
	const number = Number( value );
	if ( ! Number.isFinite( number ) ) {
		return 50;
	}
	return Math.min( 100, Math.max( 0, number ) );
};

const sanitizeHotspot = ( raw, index ) => {
	if ( ! raw || 'object' !== typeof raw ) {
		return null;
	}
	const color = str( raw.markerColor );
	return {
		id: `hs-${ Date.now().toString( 36 ) }-i${ index }`,
		x: clampPct( raw.x ),
		y: clampPct( raw.y ),
		title: str( raw.title ),
		description: str( raw.description ),
		markerStyle: oneOf( raw.markerStyle, MARKER_STYLES, 'number' ),
		markerSize: oneOf( raw.markerSize, MARKER_SIZES, 'medium' ),
		markerColor: /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test( color ) ? color : '',
		animation: oneOf( raw.animation, ANIMATIONS, '' ),
		trigger: oneOf( raw.trigger, TRIGGERS, '' ),
		placement: oneOf( raw.placement, PLACEMENTS, 'auto' ),
		theme: oneOf( raw.theme, THEMES, '' ),
		lightbox: !! raw.lightbox,
		mediaType: oneOf( raw.mediaType, MEDIA_TYPES, '' ),
		mediaId: Number.isFinite( Number( raw.mediaId ) )
			? Number( raw.mediaId )
			: 0,
		mediaUrl: str( raw.mediaUrl ),
		linkUrl: str( raw.linkUrl ),
		linkText: str( raw.linkText ),
		linkNewTab: !! raw.linkNewTab,
	};
};

export default function ImportExport( { attributes, setAttributes } ) {
	const { imageUrl, imageAlt, hotspots } = attributes;
	const [ replaceOnImport, setReplaceOnImport ] = useState( false );
	const [ status, setStatus ] = useState( null );
	const fileInputRef = useRef();

	const onExport = () => {
		const payload = {
			plugin: 'pinspot',
			version: 1,
			exported: new Date().toISOString(),
			imageUrl,
			imageAlt,
			hotspots,
		};
		const blob = new Blob( [ JSON.stringify( payload, null, '\t' ) ], {
			type: 'application/json',
		} );
		const url = URL.createObjectURL( blob );
		const link = document.createElement( 'a' );
		link.href = url;
		link.download = 'pinspot-hotspots.json';
		document.body.appendChild( link );
		link.click();
		link.remove();
		URL.revokeObjectURL( url );
	};

	const onImportFile = ( event ) => {
		const input = event.target;
		const file = input.files && input.files[ 0 ];
		if ( ! file ) {
			return;
		}
		const reader = new window.FileReader();
		reader.onload = () => {
			try {
				const data = JSON.parse( reader.result );
				const list = Array.isArray( data )
					? data
					: data && data.hotspots;
				if ( ! Array.isArray( list ) ) {
					throw new Error( 'invalid' );
				}
				const imported = list.map( sanitizeHotspot ).filter( Boolean );
				if ( ! imported.length ) {
					throw new Error( 'empty' );
				}
				const changes = {
					hotspots: replaceOnImport
						? imported
						: [ ...hotspots, ...imported ],
				};
				if ( ! imageUrl && str( data && data.imageUrl ) ) {
					changes.imageUrl = data.imageUrl;
					changes.imageAlt = str( data.imageAlt );
				}
				setAttributes( changes );
				setStatus( {
					type: 'success',
					message: sprintf(
						/* translators: %d: number of imported hotspots. */
						__( '%d hotspots imported.', 'pinspot' ),
						imported.length
					),
				} );
			} catch ( error ) {
				setStatus( {
					type: 'error',
					message: __(
						'Invalid file — expected a Pinspot JSON export.',
						'pinspot'
					),
				} );
			}
			input.value = '';
		};
		reader.readAsText( file );
	};

	return (
		<PanelBody
			title={ __( 'Import / Export', 'pinspot' ) }
			initialOpen={ false }
		>
			{ status && (
				<Notice
					status={ status.type }
					isDismissible
					onRemove={ () => setStatus( null ) }
				>
					{ status.message }
				</Notice>
			) }
			<div className="pinspot-import-export">
				<Button
					variant="secondary"
					onClick={ onExport }
					disabled={ ! hotspots.length }
				>
					{ __( 'Export JSON', 'pinspot' ) }
				</Button>
				<Button
					variant="secondary"
					onClick={ () => fileInputRef.current.click() }
				>
					{ __( 'Import JSON', 'pinspot' ) }
				</Button>
				<input
					ref={ fileInputRef }
					type="file"
					accept=".json,application/json"
					onChange={ onImportFile }
					hidden
				/>
			</div>
			<ToggleControl
				__nextHasNoMarginBottom
				label={ __( 'Replace existing hotspots on import', 'pinspot' ) }
				checked={ replaceOnImport }
				onChange={ setReplaceOnImport }
				help={ __(
					'Off: imported hotspots are added to the current ones.',
					'pinspot'
				) }
			/>
		</PanelBody>
	);
}
