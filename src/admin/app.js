/**
 * PinSpot admin dashboard — a small React app rendered under the top-level
 * "PinSpot" menu. Dark sidebar + light/dark content, matching the house style.
 */
import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import {
	Button,
	SelectControl,
	ColorPalette,
	BaseControl,
	Snackbar,
} from '@wordpress/components';

const data = window.pinspotAdmin || {};
const links = data.links || {};

/* -------------------------------------------------------------------------- */
/* Static content                                                             */
/* -------------------------------------------------------------------------- */

const NAV = [
	{ id: 'overview', label: __( 'Dashboard', 'pinspot' ), icon: 'dashboard' },
	{ id: 'blocks', label: __( 'Blocks', 'pinspot' ), icon: 'screenoptions' },
	{
		id: 'settings',
		label: __( 'Settings', 'pinspot' ),
		icon: 'admin-generic',
	},
	{
		id: 'upgrade',
		label: __( 'Upgrade to Pro', 'pinspot' ),
		icon: 'star-filled',
	},
];

// Free features shown on the Overview as "active".
const FEATURES = [
	[
		'format-image',
		__( 'Rich tooltips', 'pinspot' ),
		__(
			'Title, text, image, video, and a call-to-action button in every pin.',
			'pinspot'
		),
	],
	[
		'search',
		__( 'Zoom & pan', 'pinspot' ),
		__(
			'Explore large images; markers stay crisp and anchored.',
			'pinspot'
		),
	],
	[
		'controls-play',
		__( 'Guided tour', 'pinspot' ),
		__(
			'Step visitors through the hotspots, with optional autoplay.',
			'pinspot'
		),
	],
	[
		'filter',
		__( 'Group filters', 'pinspot' ),
		__(
			'Let visitors show or hide pins by category with chips.',
			'pinspot'
		),
	],
	[
		'admin-customizer',
		__( 'Emoji & image markers', 'pinspot' ),
		__( 'Any emoji or your own image as a marker.', 'pinspot' ),
	],
	[
		'format-gallery',
		__( 'Lightbox', 'pinspot' ),
		__(
			'Open tooltip images full-screen in an accessible lightbox.',
			'pinspot'
		),
	],
	[
		'editor-ul',
		__( 'Accessible list', 'pinspot' ),
		__(
			'An optional text alternative of every pin for SEO and screen readers.',
			'pinspot'
		),
	],
	[
		'migrate',
		__( 'Import / export', 'pinspot' ),
		__( 'Save a layout as JSON and reuse it anywhere.', 'pinspot' ),
	],
];

const QUICK_ACTIONS = [
	[
		'plus-alt',
		__( 'Add a hotspot image', 'pinspot' ),
		__( 'Create a post or page and insert the PinSpot block.', 'pinspot' ),
		links.newPost,
	],
	[
		'block-default',
		__( 'Try a starter pattern', 'pinspot' ),
		__( 'Insert a ready-made layout and edit it in seconds.', 'pinspot' ),
		links.docs,
	],
	[
		'book',
		__( 'Read the docs', 'pinspot' ),
		__( 'Guides and tips for building interactive images.', 'pinspot' ),
		links.docs,
	],
];

// The one free block + Pro-only companion blocks (teasers).
const BLOCKS = [
	{
		icon: 'location',
		name: __( 'Image Hotspots', 'pinspot' ),
		desc: __(
			'Place clickable pins on any image with rich, accessible tooltips.',
			'pinspot'
		),
		status: 'core',
	},
	{
		icon: 'admin-site-alt3',
		name: __( 'Live Map', 'pinspot' ),
		desc: __(
			'Real geo pins on a Leaflet + OpenStreetMap map — no API key.',
			'pinspot'
		),
		status: 'pro',
	},
	{
		icon: 'video-alt3',
		name: __( 'Video Hotspots', 'pinspot' ),
		desc: __(
			'Time-coded pins over self-hosted or YouTube video.',
			'pinspot'
		),
		status: 'pro',
	},
	{
		icon: 'images-alt2',
		name: __( '360° / Panorama', 'pinspot' ),
		desc: __( 'Drag-to-look scenes with hotspots inside them.', 'pinspot' ),
		status: 'pro',
	},
	{
		icon: 'controls-volumeon',
		name: __( 'Audio Guide', 'pinspot' ),
		desc: __(
			'Pins that stream narration with accessible controls.',
			'pinspot'
		),
		status: 'pro',
	},
];

// What Pro unlocks (Upgrade page cards).
const PRO_FEATURES = [
	[
		'cart',
		__( 'WooCommerce shoppable', 'pinspot' ),
		__(
			'Bind a pin to a product: live price, stock, and add-to-cart right in the tooltip.',
			'pinspot'
		),
	],
	[
		'visibility',
		__( 'Conditional display', 'pinspot' ),
		__(
			'Show or hide pins by user role, or schedule them for a date or sale window.',
			'pinspot'
		),
	],
	[
		'chart-bar',
		__( 'Deep analytics', 'pinspot' ),
		__(
			'Per-hotspot clicks, CTA conversions, funnels, date ranges, and CSV export.',
			'pinspot'
		),
	],
	[
		'marker',
		__( 'Premium marker FX', 'pinspot' ),
		__(
			'Radar ping, ripple, and floating effects, plus premium icon packs.',
			'pinspot'
		),
	],
	[
		'controls-play',
		__( 'Advanced tour', 'pinspot' ),
		__( 'Spotlight dimming, step highlighting, and narration.', 'pinspot' ),
	],
	[
		'images-alt2',
		__( 'Companion blocks', 'pinspot' ),
		__( 'Live Map, Video Hotspots, 360°, and Audio Guide.', 'pinspot' ),
	],
];

const PLANS = [
	{
		name: __( 'Personal', 'pinspot' ),
		price: '49',
		sites: __( '1 site', 'pinspot' ),
		popular: false,
	},
	{
		name: __( 'Business', 'pinspot' ),
		price: '99',
		sites: __( '5 sites', 'pinspot' ),
		popular: true,
	},
	{
		name: __( 'Agency', 'pinspot' ),
		price: '199',
		sites: __( '25 sites', 'pinspot' ),
		popular: false,
	},
];

const COMPARE = [
	[ __( 'Image Hotspots block', 'pinspot' ), true, true ],
	[
		__( 'Rich tooltips, zoom, lightbox, tour, filters', 'pinspot' ),
		true,
		true,
	],
	[ __( 'Emoji & custom-image markers', 'pinspot' ), true, true ],
	[ __( 'WooCommerce shoppable images', 'pinspot' ), false, true ],
	[ __( 'Conditional display & scheduling', 'pinspot' ), false, true ],
	[ __( 'Deep analytics & CSV export', 'pinspot' ), false, true ],
	[ __( 'Premium marker effects & icon packs', 'pinspot' ), false, true ],
	[
		__( 'Companion blocks (Map, Video, 360°, Audio)', 'pinspot' ),
		false,
		true,
	],
	[ __( 'Priority email support', 'pinspot' ), false, true ],
];

const FAQ = [
	[
		__( 'Do I need the free PinSpot plugin?', 'pinspot' ),
		__(
			'Yes. PinSpot Pro is an add-on that extends the free plugin, so keep the free plugin active.',
			'pinspot'
		),
	],
	[
		__( 'Is there a free trial?', 'pinspot' ),
		__(
			'Yes — a no-card free trial so you can try every Pro feature before you buy.',
			'pinspot'
		),
	],
	[
		__( 'How many sites can I use it on?', 'pinspot' ),
		__(
			'Depends on your plan: 1, 5, or 25 sites. Every plan includes every Pro feature.',
			'pinspot'
		),
	],
	[
		__( 'Will it work with my theme?', 'pinspot' ),
		__(
			'Yes. Pro uses the same block-native, accessible approach as the free plugin.',
			'pinspot'
		),
	],
	[
		__( 'What happens if my licence lapses?', 'pinspot' ),
		__(
			'Your site keeps working; you stop getting Pro updates and support until you renew.',
			'pinspot'
		),
	],
];

/* -------------------------------------------------------------------------- */
/* Small UI helpers                                                           */
/* -------------------------------------------------------------------------- */

const Dashicon = ( { icon } ) => (
	<span className={ `dashicons dashicons-${ icon }` } aria-hidden="true" />
);

const Card = ( { children, className = '' } ) => (
	<div className={ `pinspot-card ${ className }` }>{ children }</div>
);

function PageHeader( { title, subtitle } ) {
	return (
		<div className="pinspot-page__head">
			<h1>{ title }</h1>
			{ subtitle && <p>{ subtitle }</p> }
		</div>
	);
}

/* -------------------------------------------------------------------------- */
/* Pages                                                                      */
/* -------------------------------------------------------------------------- */

function Overview( { go } ) {
	const stats = data.stats || {};
	const tiles = [
		[
			'location',
			stats.blocksInUse ?? 0,
			__( 'Posts using PinSpot', 'pinspot' ),
			'a',
		],
		[
			'screenoptions',
			stats.patterns ?? 3,
			__( 'Starter patterns', 'pinspot' ),
			'b',
		],
		[
			'admin-customizer',
			stats.markerStyles ?? 7,
			__( 'Marker styles', 'pinspot' ),
			'c',
		],
		[
			data.proActive ? 'yes-alt' : 'star-filled',
			data.proActive
				? __( 'Active', 'pinspot' )
				: __( 'Free', 'pinspot' ),
			__( 'PinSpot Pro', 'pinspot' ),
			'd',
		],
	];
	return (
		<div className="pinspot-page">
			<PageHeader
				title={ __( 'Dashboard', 'pinspot' ) }
				subtitle={ __(
					'Overview of your interactive images and active features.',
					'pinspot'
				) }
			/>

			<div className="pinspot-stats">
				{ tiles.map( ( [ icon, value, label, tone ], i ) => (
					<Card key={ i } className="pinspot-stat">
						<span className={ `pinspot-stat__icon tone-${ tone }` }>
							<Dashicon icon={ icon } />
						</span>
						<div>
							<div className="pinspot-stat__value">{ value }</div>
							<div className="pinspot-stat__label">{ label }</div>
						</div>
					</Card>
				) ) }
			</div>

			<h2 className="pinspot-section">
				{ __( 'Active features', 'pinspot' ) }
			</h2>
			<div className="pinspot-grid">
				{ FEATURES.map( ( [ icon, name, desc ], i ) => (
					<Card key={ i } className="pinspot-feature">
						<span className="pinspot-feature__icon">
							<Dashicon icon={ icon } />
						</span>
						<div className="pinspot-feature__body">
							<div className="pinspot-feature__title">
								{ name }
								<span className="pinspot-feature__on">
									<Dashicon icon="yes-alt" />
								</span>
							</div>
							<p>{ desc }</p>
						</div>
					</Card>
				) ) }
			</div>

			<h2 className="pinspot-section">
				{ __( 'Quick actions', 'pinspot' ) }
			</h2>
			<div className="pinspot-grid pinspot-grid--3">
				{ QUICK_ACTIONS.map( ( [ icon, name, desc, href ], i ) => (
					<a
						key={ i }
						className="pinspot-card pinspot-action"
						href={ href || '#' }
					>
						<span className="pinspot-action__icon">
							<Dashicon icon={ icon } />
						</span>
						<div>
							<div className="pinspot-action__title">
								{ name }
							</div>
							<p>{ desc }</p>
						</div>
					</a>
				) ) }
			</div>

			{ ! data.proActive && (
				<Card className="pinspot-cta">
					<div>
						<strong>
							{ __(
								'Turn images into sales with PinSpot Pro',
								'pinspot'
							) }
						</strong>
						<p>
							{ __(
								'WooCommerce shoppable images, conditional display, deep analytics, and companion blocks.',
								'pinspot'
							) }
						</p>
					</div>
					<Button variant="primary" onClick={ () => go( 'upgrade' ) }>
						{ __( 'See Pro features', 'pinspot' ) }
					</Button>
				</Card>
			) }
		</div>
	);
}

function Blocks() {
	return (
		<div className="pinspot-page">
			<PageHeader
				title={ __( 'Blocks', 'pinspot' ) }
				subtitle={ __(
					'The blocks PinSpot adds to the editor. Pro adds a family of companion blocks.',
					'pinspot'
				) }
			/>
			<div className="pinspot-grid pinspot-grid--3">
				{ BLOCKS.map( ( b, i ) => (
					<Card
						key={ i }
						className={ `pinspot-block ${
							b.status === 'pro' ? 'is-pro' : ''
						}` }
					>
						<div className="pinspot-block__top">
							<span className="pinspot-block__icon">
								<Dashicon icon={ b.icon } />
							</span>
							{ b.status === 'core' && (
								<span className="pinspot-pill pinspot-pill--on">
									<Dashicon icon="yes-alt" />{ ' ' }
									{ __( 'Active', 'pinspot' ) }
								</span>
							) }
							{ b.status === 'pro' && (
								<span className="pinspot-pill pinspot-pill--pro">
									<Dashicon icon="lock" />{ ' ' }
									{ __( 'Pro', 'pinspot' ) }
								</span>
							) }
						</div>
						<div className="pinspot-block__title">{ b.name }</div>
						<p>{ b.desc }</p>
					</Card>
				) ) }
			</div>
		</div>
	);
}

function Settings() {
	const [ settings, setSettings ] = useState( data.settings || {} );
	const [ saving, setSaving ] = useState( false );
	const [ notice, setNotice ] = useState( '' );

	const update = ( key, value ) =>
		setSettings( { ...settings, [ key ]: value } );

	const save = () => {
		setSaving( true );
		apiFetch( {
			path: 'pinspot/v1/settings',
			method: 'POST',
			data: settings,
		} )
			.then( ( saved ) => {
				setSettings( saved );
				setNotice( __( 'Settings saved.', 'pinspot' ) );
			} )
			.catch( () =>
				setNotice( __( 'Could not save settings.', 'pinspot' ) )
			)
			.finally( () => setSaving( false ) );
	};

	return (
		<div className="pinspot-page">
			<PageHeader
				title={ __( 'Settings', 'pinspot' ) }
				subtitle={ __(
					'Defaults applied to new PinSpot blocks. Each block can still override them.',
					'pinspot'
				) }
			/>
			<Card className="pinspot-settings">
				<SelectControl
					__nextHasNoMarginBottom
					label={ __( 'Default trigger', 'pinspot' ) }
					value={ settings.defaultTrigger || 'click' }
					options={ [
						{ label: __( 'Click', 'pinspot' ), value: 'click' },
						{ label: __( 'Hover', 'pinspot' ), value: 'hover' },
					] }
					onChange={ ( v ) => update( 'defaultTrigger', v ) }
				/>
				<SelectControl
					__nextHasNoMarginBottom
					label={ __( 'Default tooltip theme', 'pinspot' ) }
					value={ settings.defaultTheme || 'light' }
					options={ [
						{ label: __( 'Light', 'pinspot' ), value: 'light' },
						{ label: __( 'Dark', 'pinspot' ), value: 'dark' },
					] }
					onChange={ ( v ) => update( 'defaultTheme', v ) }
				/>
				<BaseControl
					__nextHasNoMarginBottom
					label={ __( 'Default marker color', 'pinspot' ) }
					id="pinspot-default-color"
				>
					<ColorPalette
						value={ settings.defaultMarkerColor || '#3a5df0' }
						onChange={ ( v ) =>
							update( 'defaultMarkerColor', v || '#3a5df0' )
						}
						enableAlpha={ false }
					/>
				</BaseControl>
				<div className="pinspot-settings__actions">
					<Button
						variant="primary"
						isBusy={ saving }
						onClick={ save }
					>
						{ __( 'Save settings', 'pinspot' ) }
					</Button>
				</div>
			</Card>
			{ notice && (
				<Snackbar onRemove={ () => setNotice( '' ) }>
					{ notice }
				</Snackbar>
			) }
		</div>
	);
}

function FaqItem( { q, a } ) {
	const [ open, setOpen ] = useState( false );
	return (
		<div className={ `pinspot-faq__item ${ open ? 'is-open' : '' }` }>
			<button type="button" onClick={ () => setOpen( ! open ) }>
				<span>{ q }</span>
				<Dashicon icon={ open ? 'minus' : 'plus-alt2' } />
			</button>
			{ open && <p>{ a }</p> }
		</div>
	);
}

function Upgrade() {
	const upgradeUrl = links.upgrade || '#';
	return (
		<div className="pinspot-page pinspot-upgrade">
			<div className="pinspot-hero">
				<div className="pinspot-hero__body">
					<span className="pinspot-hero__badge">
						{ __( 'PinSpot Pro', 'pinspot' ) }
					</span>
					<h1>{ __( 'Turn images into sales', 'pinspot' ) }</h1>
					<p>
						{ __(
							'The only accessible, block-native way to build shoppable images in WordPress — plus conditional display, deep analytics, premium effects, and a family of companion blocks.',
							'pinspot'
						) }
					</p>
					<div className="pinspot-hero__stats">
						<div>
							<strong>{ PRO_FEATURES.length }+</strong>
							<span>{ __( 'Pro features', 'pinspot' ) }</span>
						</div>
						<div>
							<strong>{ __( 'Free', 'pinspot' ) }</strong>
							<span>{ __( 'trial', 'pinspot' ) }</span>
						</div>
						<div>
							<strong>{ __( 'No', 'pinspot' ) }</strong>
							<span>{ __( 'monthly fees', 'pinspot' ) }</span>
						</div>
					</div>
					<a
						className="pinspot-hero__cta"
						href={ upgradeUrl }
						target="_blank"
						rel="noreferrer"
					>
						{ __( 'Get PinSpot Pro', 'pinspot' ) }{ ' ' }
						<Dashicon icon="arrow-right-alt" />
					</a>
					<span className="pinspot-hero__fine">
						{ __(
							'Free trial · Annual billing · Cancel anytime',
							'pinspot'
						) }
					</span>
				</div>
				<div className="pinspot-hero__art">
					<Dashicon icon="cart" />
				</div>
			</div>

			<h2 className="pinspot-center">
				{ __( 'Everything in Pro', 'pinspot' ) }
			</h2>
			<div className="pinspot-grid pinspot-grid--3">
				{ PRO_FEATURES.map( ( [ icon, name, desc ], i ) => (
					<Card key={ i } className="pinspot-feature">
						<span className="pinspot-feature__icon pinspot-feature__icon--pro">
							<Dashicon icon={ icon } />
						</span>
						<div className="pinspot-feature__body">
							<div className="pinspot-feature__title">
								{ name }
							</div>
							<p>{ desc }</p>
						</div>
					</Card>
				) ) }
			</div>

			<h2 className="pinspot-center">
				{ __( 'Simple, transparent pricing', 'pinspot' ) }
			</h2>
			<p className="pinspot-center pinspot-muted">
				{ __(
					'Every plan includes every Pro feature — now and in future updates.',
					'pinspot'
				) }
			</p>
			<div className="pinspot-plans">
				{ PLANS.map( ( p, i ) => (
					<Card
						key={ i }
						className={ `pinspot-plan ${
							p.popular ? 'is-popular' : ''
						}` }
					>
						{ p.popular && (
							<span className="pinspot-plan__tag">
								{ __( 'Most popular', 'pinspot' ) }
							</span>
						) }
						<div className="pinspot-plan__name">{ p.name }</div>
						<div className="pinspot-plan__price">
							${ p.price }
							<span>/{ __( 'yr', 'pinspot' ) }</span>
						</div>
						<div className="pinspot-plan__sites">{ p.sites }</div>
						<a
							className="pinspot-plan__cta"
							href={ upgradeUrl }
							target="_blank"
							rel="noreferrer"
						>
							{ __( 'Get started', 'pinspot' ) }
						</a>
					</Card>
				) ) }
			</div>

			<h2 className="pinspot-center">
				{ __( 'Free vs Pro', 'pinspot' ) }
			</h2>
			<Card className="pinspot-compare">
				<table>
					<thead>
						<tr>
							<th>{ __( 'Feature', 'pinspot' ) }</th>
							<th>{ __( 'Free', 'pinspot' ) }</th>
							<th>{ __( 'Pro', 'pinspot' ) }</th>
						</tr>
					</thead>
					<tbody>
						{ COMPARE.map( ( [ label, free, pro ], i ) => (
							<tr key={ i }>
								<td>{ label }</td>
								<td className={ free ? 'yes' : 'no' }>
									<Dashicon
										icon={ free ? 'yes' : 'no-alt' }
									/>
								</td>
								<td className={ pro ? 'yes' : 'no' }>
									<Dashicon icon={ pro ? 'yes' : 'no-alt' } />
								</td>
							</tr>
						) ) }
					</tbody>
				</table>
			</Card>

			<h2 className="pinspot-center">
				{ __( 'Frequently asked questions', 'pinspot' ) }
			</h2>
			<div className="pinspot-faq">
				{ FAQ.map( ( [ q, a ], i ) => (
					<FaqItem key={ i } q={ q } a={ a } />
				) ) }
			</div>

			<div className="pinspot-center pinspot-upgrade__foot">
				<a
					className="pinspot-hero__cta"
					href={ upgradeUrl }
					target="_blank"
					rel="noreferrer"
				>
					{ __( 'Get PinSpot Pro', 'pinspot' ) }{ ' ' }
					<Dashicon icon="arrow-right-alt" />
				</a>
			</div>
		</div>
	);
}

/* -------------------------------------------------------------------------- */
/* Shell                                                                      */
/* -------------------------------------------------------------------------- */

export default function App() {
	const [ page, setPage ] = useState( 'overview' );
	const [ theme, setTheme ] = useState(
		window.localStorage.getItem( 'pinspotAdminTheme' ) || 'light'
	);

	useEffect( () => {
		window.localStorage.setItem( 'pinspotAdminTheme', theme );
	}, [ theme ] );

	const PAGES = {
		overview: <Overview go={ setPage } />,
		blocks: <Blocks />,
		settings: <Settings />,
		upgrade: <Upgrade />,
	};

	return (
		<div className={ `pinspot-admin theme-${ theme }` }>
			<aside className="pinspot-admin__sidebar">
				<div className="pinspot-admin__brand">
					<span className="pinspot-admin__logo">
						<Dashicon icon="location" />
					</span>
					<span className="pinspot-admin__name">PinSpot</span>
					<span className="pinspot-admin__version">
						v{ data.version || '' }
					</span>
				</div>
				<nav className="pinspot-admin__nav">
					{ NAV.map( ( n ) => (
						<button
							key={ n.id }
							type="button"
							className={ page === n.id ? 'is-active' : '' }
							onClick={ () => setPage( n.id ) }
						>
							<Dashicon icon={ n.icon } />
							<span>{ n.label }</span>
						</button>
					) ) }
				</nav>
			</aside>

			<div className="pinspot-admin__main">
				<header className="pinspot-admin__topbar">
					{ data.proActive ? (
						<span className="pinspot-tag pinspot-tag--pro">
							<Dashicon icon="yes-alt" />{ ' ' }
							{ __( 'Pro active', 'pinspot' ) }
						</span>
					) : (
						<button
							type="button"
							className="pinspot-tag pinspot-tag--go"
							onClick={ () => setPage( 'upgrade' ) }
						>
							<Dashicon icon="star-filled" />{ ' ' }
							{ __( 'Go Pro', 'pinspot' ) }
						</button>
					) }
					<button
						type="button"
						className="pinspot-iconbtn"
						aria-label={ __( 'Toggle theme', 'pinspot' ) }
						onClick={ () =>
							setTheme( theme === 'light' ? 'dark' : 'light' )
						}
					>
						<Dashicon
							icon={
								theme === 'light' ? 'lightbulb' : 'sunglasses'
							}
						/>
					</button>
					{ links.support && (
						<a
							className="pinspot-tag pinspot-tag--support"
							href={ links.support }
							target="_blank"
							rel="noreferrer"
						>
							{ __( 'Get Support', 'pinspot' ) }
						</a>
					) }
				</header>

				<main className="pinspot-admin__content">
					{ PAGES[ page ] }
				</main>

				<footer className="pinspot-admin__foot">
					<div className="pinspot-admin__foot-msg">
						<Dashicon icon="heart" />
						<div>
							<strong>
								{ __( 'Enjoying PinSpot?', 'pinspot' ) }
							</strong>
							<span>
								{ __(
									'PinSpot is free and built by an independent developer. A review or small donation keeps it maintained.',
									'pinspot'
								) }
							</span>
						</div>
					</div>
					<div className="pinspot-admin__foot-actions">
						{ links.review && (
							<a
								className="pinspot-btn pinspot-btn--review"
								href={ links.review }
								target="_blank"
								rel="noreferrer"
							>
								<Dashicon icon="star-filled" />{ ' ' }
								{ __( 'Leave a Review', 'pinspot' ) }
							</a>
						) }
						{ links.donate && (
							<a
								className="pinspot-btn pinspot-btn--donate"
								href={ links.donate }
								target="_blank"
								rel="noreferrer"
							>
								<Dashicon icon="heart" />{ ' ' }
								{ __( 'Donate', 'pinspot' ) }
							</a>
						) }
						{ links.support && (
							<a
								className="pinspot-btn"
								href={ links.support }
								target="_blank"
								rel="noreferrer"
							>
								{ __( 'Get Support', 'pinspot' ) }
							</a>
						) }
					</div>
				</footer>
			</div>
		</div>
	);
}
