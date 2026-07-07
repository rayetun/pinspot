<?php
/**
 * Pattern: Team introduction — hover pins with a dark theme.
 *
 * @package Pinspot
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

return array(
	'title'       => __( 'Team introduction hotspots', 'pinspot' ),
	'description' => __( 'Hover-triggered dot pins over a team photo, each revealing a name and role in a dark tooltip. Add your own image after inserting.', 'pinspot' ),
	'categories'  => array( 'pinspot' ),
	'content'     => '<!-- wp:pinspot/image-hotspots {"globalTrigger":"hover","globalTheme":"dark","hotspots":[{"id":"hs-team-1","x":22,"y":40,"title":"' . esc_attr__( 'Team member', 'pinspot' ) . '","description":"' . esc_attr__( 'Role or fun fact.', 'pinspot' ) . '","markerStyle":"dot"},{"id":"hs-team-2","x":50,"y":38,"title":"' . esc_attr__( 'Team member', 'pinspot' ) . '","description":"' . esc_attr__( 'Role or fun fact.', 'pinspot' ) . '","markerStyle":"dot"},{"id":"hs-team-3","x":76,"y":42,"title":"' . esc_attr__( 'Team member', 'pinspot' ) . '","description":"' . esc_attr__( 'Role or fun fact.', 'pinspot' ) . '","markerStyle":"dot"}]} /-->',
);
