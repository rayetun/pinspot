<?php
/**
 * Pattern: Before and after — two layered images with a switcher.
 *
 * The simplest demonstration of layers: the same scene twice, each with its own
 * annotations, so visitors flip between them. The tour stays within the image
 * on screen here (unlike the floor-plan pattern), because "before" and "after"
 * are alternatives rather than a sequence to walk through.
 *
 * The flat `imageUrl` / `imageAlt` fields mirror the first layer purely as a
 * downgrade path — Pinspot_Layers prefers `layers` whenever it is present.
 *
 * @package Pinspot
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$pinspot_before = esc_url( PINSPOT_URL . 'patterns/images/room-before.svg' );
$pinspot_after  = esc_url( PINSPOT_URL . 'patterns/images/room.svg' );

$pinspot_before_alt = esc_attr__( 'Room before the work, demo image', 'pinspot' );
$pinspot_after_alt  = esc_attr__( 'Room after the work, demo image', 'pinspot' );

$pinspot_layers = array(
	array(
		'id'          => 'pinspot-ba-before',
		'name'        => esc_attr__( 'Before', 'pinspot' ),
		'imageUrl'    => $pinspot_before,
		'imageAlt'    => $pinspot_before_alt,
		'imageWidth'  => 1200,
		'imageHeight' => 675,
		'hotspots'    => array(
			array(
				'id'          => 'hs-ba-b1',
				'x'           => 23,
				'y'           => 32,
				'title'       => esc_attr__( 'Bare walls', 'pinspot' ),
				'description' => esc_attr__( 'What the space looked like to start with.', 'pinspot' ),
				'markerStyle' => 'info',
			),
			array(
				'id'          => 'hs-ba-b2',
				'x'           => 45,
				'y'           => 66,
				'title'       => esc_attr__( 'Worn flooring', 'pinspot' ),
				'description' => esc_attr__( 'What the space looked like to start with.', 'pinspot' ),
				'markerStyle' => 'info',
			),
		),
	),
	array(
		'id'          => 'pinspot-ba-after',
		'name'        => esc_attr__( 'After', 'pinspot' ),
		'imageUrl'    => $pinspot_after,
		'imageAlt'    => $pinspot_after_alt,
		'imageWidth'  => 1200,
		'imageHeight' => 675,
		'hotspots'    => array(
			array(
				'id'          => 'hs-ba-a1',
				'x'           => 23,
				'y'           => 32,
				'title'       => esc_attr__( 'New artwork', 'pinspot' ),
				'description' => esc_attr__( 'What changed, and why it matters.', 'pinspot' ),
				'markerStyle' => 'plus',
			),
			array(
				'id'          => 'hs-ba-a2',
				'x'           => 50,
				'y'           => 52,
				'title'       => esc_attr__( 'Seating', 'pinspot' ),
				'description' => esc_attr__( 'What changed, and why it matters.', 'pinspot' ),
				'markerStyle' => 'plus',
			),
			array(
				'id'          => 'hs-ba-a3',
				'x'           => 83,
				'y'           => 46,
				'title'       => esc_attr__( 'Lighting', 'pinspot' ),
				'description' => esc_attr__( 'What changed, and why it matters.', 'pinspot' ),
				'markerStyle' => 'plus',
			),
		),
	),
);

$pinspot_attrs = array(
	'imageUrl'    => $pinspot_before,
	'imageAlt'    => $pinspot_before_alt,
	'imageWidth'  => 1200,
	'imageHeight' => 675,
	'layers'      => $pinspot_layers,
	'enableTour'  => true,
	'showList'    => true,
);

return array(
	'title'         => __( 'Before and after', 'pinspot' ),
	'description'   => __( 'The same scene twice in one block, with a switcher so visitors flip between before and after. Each version carries its own annotations. Replace the demo images with your own pair.', 'pinspot' ),
	'categories'    => array( 'pinspot' ),
	'keywords'      => array( 'before after', 'layers', 'comparison', 'renovation' ),
	'viewportWidth' => 1200,
	'content'       => '<!-- wp:pinspot/image-hotspots ' . wp_json_encode( $pinspot_attrs ) . ' /-->',
);
