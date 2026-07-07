<?php
/**
 * Pattern: Map / floor-plan tour — zoomable image with question pins.
 *
 * @package Pinspot
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

return array(
	'title'       => __( 'Zoomable map tour', 'pinspot' ),
	'description' => __( 'A zoom-and-pan enabled image with pulsing question-mark pins — ideal for maps, floor plans, or infographics. Add your own image after inserting.', 'pinspot' ),
	'categories'  => array( 'pinspot' ),
	'content'     => '<!-- wp:pinspot/image-hotspots {"enableZoom":true,"maxZoom":4,"hotspots":[{"id":"hs-map-1","x":30,"y":30,"title":"' . esc_attr__( 'Point of interest', 'pinspot' ) . '","description":"' . esc_attr__( 'What visitors will find here.', 'pinspot' ) . '","markerStyle":"question","animation":"pulse"},{"id":"hs-map-2","x":62,"y":55,"title":"' . esc_attr__( 'Point of interest', 'pinspot' ) . '","description":"' . esc_attr__( 'What visitors will find here.', 'pinspot' ) . '","markerStyle":"question","animation":"pulse"},{"id":"hs-map-3","x":45,"y":75,"title":"' . esc_attr__( 'Point of interest', 'pinspot' ) . '","description":"' . esc_attr__( 'What visitors will find here.', 'pinspot' ) . '","markerStyle":"question","animation":"pulse"}]} /-->',
);
