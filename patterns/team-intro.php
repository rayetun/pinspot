<?php
/**
 * Pattern: Team introduction — hover pins with a dark theme.
 *
 * Ships with a bundled demo illustration; users replace it with their
 * own team photo after inserting.
 *
 * @package Pinspot
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$pinspot_demo_image = esc_url( PINSPOT_URL . 'patterns/images/team.svg' );

return array(
	'title'         => __( 'Team introduction hotspots', 'pinspot' ),
	'description'   => __( 'Hover-triggered dot pins over a team image, each revealing a name and role in a dark tooltip. Replace the demo image with your own.', 'pinspot' ),
	'categories'    => array( 'pinspot' ),
	'viewportWidth' => 1200,
	'content'       => '<!-- wp:pinspot/image-hotspots {"imageUrl":"' . $pinspot_demo_image . '","imageAlt":"' . esc_attr__( 'Team demo image', 'pinspot' ) . '","imageWidth":1200,"imageHeight":675,"globalTrigger":"hover","globalTheme":"dark","hotspots":[{"id":"hs-team-1","x":20,"y":38,"title":"' . esc_attr__( 'Team member', 'pinspot' ) . '","description":"' . esc_attr__( 'Role or fun fact.', 'pinspot' ) . '","markerStyle":"dot"},{"id":"hs-team-2","x":40,"y":34,"title":"' . esc_attr__( 'Team member', 'pinspot' ) . '","description":"' . esc_attr__( 'Role or fun fact.', 'pinspot' ) . '","markerStyle":"dot"},{"id":"hs-team-3","x":60,"y":38,"title":"' . esc_attr__( 'Team member', 'pinspot' ) . '","description":"' . esc_attr__( 'Role or fun fact.', 'pinspot' ) . '","markerStyle":"dot"},{"id":"hs-team-4","x":79,"y":35,"title":"' . esc_attr__( 'Team member', 'pinspot' ) . '","description":"' . esc_attr__( 'Role or fun fact.', 'pinspot' ) . '","markerStyle":"dot"}]} /-->',
);
