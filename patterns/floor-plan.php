<?php
/**
 * Pattern: Multi-floor plan — two layered floor plans with a switcher.
 *
 * Showcases layers: one block, several images, each with its own hotspots, and
 * a guided tour that walks both floors in order. Ships with bundled demo
 * illustrations; users replace them with their own plans after inserting.
 *
 * The flat `imageUrl` / `imageAlt` fields mirror the first layer purely as a
 * downgrade path — Pinspot_Layers prefers `layers` whenever it is present.
 *
 * @package Pinspot
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$pinspot_ground = esc_url( PINSPOT_URL . 'patterns/images/floor-ground.svg' );
$pinspot_first  = esc_url( PINSPOT_URL . 'patterns/images/floor-first.svg' );

$pinspot_ground_alt = esc_attr__( 'Ground floor plan demo image', 'pinspot' );
$pinspot_first_alt  = esc_attr__( 'First floor plan demo image', 'pinspot' );

$pinspot_desc = esc_attr__( 'What visitors will find here.', 'pinspot' );

$pinspot_layers = array(
	array(
		'id'          => 'pinspot-floor-ground',
		'name'        => esc_attr__( 'Ground floor', 'pinspot' ),
		'imageUrl'    => $pinspot_ground,
		'imageAlt'    => $pinspot_ground_alt,
		'imageWidth'  => 1200,
		'imageHeight' => 800,
		'hotspots'    => array(
			array(
				'id'          => 'hs-fp-g1',
				'x'           => 26,
				'y'           => 33,
				'title'       => esc_attr__( 'Living room', 'pinspot' ),
				'description' => $pinspot_desc,
				'markerStyle' => 'number',
				'group'       => esc_attr__( 'Living', 'pinspot' ),
			),
			array(
				'id'          => 'hs-fp-g2',
				'x'           => 58,
				'y'           => 22,
				'title'       => esc_attr__( 'Kitchen', 'pinspot' ),
				'description' => $pinspot_desc,
				'markerStyle' => 'number',
				'group'       => esc_attr__( 'Service', 'pinspot' ),
			),
			array(
				'id'          => 'hs-fp-g3',
				'x'           => 80,
				'y'           => 47,
				'title'       => esc_attr__( 'Utility', 'pinspot' ),
				'description' => $pinspot_desc,
				'markerStyle' => 'number',
				'group'       => esc_attr__( 'Service', 'pinspot' ),
			),
			array(
				'id'          => 'hs-fp-g4',
				'x'           => 45,
				'y'           => 75,
				'title'       => esc_attr__( 'Terrace', 'pinspot' ),
				'description' => $pinspot_desc,
				'markerStyle' => 'number',
				'group'       => esc_attr__( 'Outdoor', 'pinspot' ),
			),
		),
	),
	array(
		'id'          => 'pinspot-floor-first',
		'name'        => esc_attr__( 'First floor', 'pinspot' ),
		'imageUrl'    => $pinspot_first,
		'imageAlt'    => $pinspot_first_alt,
		'imageWidth'  => 1200,
		'imageHeight' => 800,
		'hotspots'    => array(
			array(
				'id'          => 'hs-fp-f1',
				'x'           => 20,
				'y'           => 26,
				'title'       => esc_attr__( 'Main bedroom', 'pinspot' ),
				'description' => $pinspot_desc,
				'markerStyle' => 'number',
				'group'       => esc_attr__( 'Living', 'pinspot' ),
			),
			array(
				'id'          => 'hs-fp-f2',
				'x'           => 53,
				'y'           => 26,
				'title'       => esc_attr__( 'Second bedroom', 'pinspot' ),
				'description' => $pinspot_desc,
				'markerStyle' => 'number',
				'group'       => esc_attr__( 'Living', 'pinspot' ),
			),
			array(
				'id'          => 'hs-fp-f3',
				'x'           => 81,
				'y'           => 24,
				'title'       => esc_attr__( 'Bathroom', 'pinspot' ),
				'description' => $pinspot_desc,
				'markerStyle' => 'number',
				'group'       => esc_attr__( 'Service', 'pinspot' ),
			),
			array(
				'id'          => 'hs-fp-f4',
				'x'           => 19,
				'y'           => 71,
				'title'       => esc_attr__( 'Study', 'pinspot' ),
				'description' => $pinspot_desc,
				'markerStyle' => 'number',
				'group'       => esc_attr__( 'Living', 'pinspot' ),
			),
		),
	),
);

$pinspot_attrs = array(
	'imageUrl'         => $pinspot_ground,
	'imageAlt'         => $pinspot_ground_alt,
	'imageWidth'       => 1200,
	'imageHeight'      => 800,
	'layers'           => $pinspot_layers,
	'enableZoom'       => true,
	'maxZoom'          => 4,
	'enableFilters'    => true,
	'enableTour'       => true,
	'tourAcrossLayers' => true,
	'showList'         => true,
);

return array(
	'title'         => __( 'Multi-floor plan', 'pinspot' ),
	'description'   => __( 'Two floor plans stacked in one block, with a switcher so visitors can move between floors. Each floor keeps its own pins, room filters work across both, and the guided tour walks the whole building. Replace the demo plans with your own.', 'pinspot' ),
	'categories'    => array( 'pinspot' ),
	'keywords'      => array( 'floor plan', 'layers', 'real estate', 'property' ),
	'viewportWidth' => 1200,
	'content'       => '<!-- wp:pinspot/image-hotspots ' . wp_json_encode( $pinspot_attrs ) . ' /-->',
);
