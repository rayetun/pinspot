<?php
/**
 * Pattern: Map / floor-plan tour — zoomable image with question pins.
 *
 * Ships with a bundled demo illustration; users replace it with their
 * own map or floor plan after inserting.
 *
 * @package Pinspot
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$pinspot_demo_image = esc_url( PINSPOT_URL . 'patterns/images/map.svg' );

return array(
	'title'         => __( 'Zoomable map tour', 'pinspot' ),
	'description'   => __( 'A zoom-and-pan enabled map with pulsing question-mark pins — ideal for maps, floor plans, or infographics. Replace the demo image with your own.', 'pinspot' ),
	'categories'    => array( 'pinspot' ),
	'viewportWidth' => 1200,
	'content'       => '<!-- wp:pinspot/image-hotspots {"imageUrl":"' . $pinspot_demo_image . '","imageAlt":"' . esc_attr__( 'Map demo image', 'pinspot' ) . '","imageWidth":1200,"imageHeight":675,"enableZoom":true,"maxZoom":4,"hotspots":[{"id":"hs-map-1","x":23,"y":30,"title":"' . esc_attr__( 'City park', 'pinspot' ) . '","description":"' . esc_attr__( 'What visitors will find here.', 'pinspot' ) . '","markerStyle":"question","animation":"pulse"},{"id":"hs-map-2","x":54,"y":42,"title":"' . esc_attr__( 'Point of interest', 'pinspot' ) . '","description":"' . esc_attr__( 'What visitors will find here.', 'pinspot' ) . '","markerStyle":"question","animation":"pulse"},{"id":"hs-map-3","x":82,"y":72,"title":"' . esc_attr__( 'Point of interest', 'pinspot' ) . '","description":"' . esc_attr__( 'What visitors will find here.', 'pinspot' ) . '","markerStyle":"question","animation":"pulse"}]} /-->',
);
