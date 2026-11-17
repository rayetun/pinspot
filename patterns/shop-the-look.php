<?php
/**
 * Pattern: Shop the look — a room scene with a pin on each item.
 *
 * Each pin carries a title, a short line and a call-to-action button pointing
 * at the item's own page, which is how the free plugin builds a shoppable
 * image. Ships with a bundled demo illustration; users replace it with their
 * own photo and point each button at a real product.
 *
 * @package Pinspot
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$pinspot_room = esc_url( PINSPOT_URL . 'patterns/images/room.svg' );

$pinspot_cta = esc_attr__( 'View product', 'pinspot' );

$pinspot_attrs = array(
	'imageUrl'      => $pinspot_room,
	'imageAlt'      => esc_attr__( 'Room scene demo image', 'pinspot' ),
	'imageWidth'    => 1200,
	'imageHeight'   => 675,
	'globalTheme'   => 'light',
	'enableFilters' => true,
	'showList'      => true,
	'hotspots'      => array(
		array(
			'id'          => 'hs-stl-1',
			'x'           => 50,
			'y'           => 52,
			'title'       => esc_attr__( 'Three-seat sofa', 'pinspot' ),
			'description' => esc_attr__( 'Linen weave, walnut legs.', 'pinspot' ),
			'markerStyle' => 'dot',
			'linkText'    => $pinspot_cta,
			'linkUrl'     => '#',
			'group'       => esc_attr__( 'Seating', 'pinspot' ),
		),
		array(
			'id'          => 'hs-stl-2',
			'x'           => 83,
			'y'           => 46,
			'title'       => esc_attr__( 'Floor lamp', 'pinspot' ),
			'description' => esc_attr__( 'Brushed brass, linen shade.', 'pinspot' ),
			'markerStyle' => 'dot',
			'linkText'    => $pinspot_cta,
			'linkUrl'     => '#',
			'group'       => esc_attr__( 'Lighting', 'pinspot' ),
		),
		array(
			'id'          => 'hs-stl-3',
			'x'           => 15,
			'y'           => 66,
			'title'       => esc_attr__( 'Side table', 'pinspot' ),
			'description' => esc_attr__( 'Solid oak, oiled finish.', 'pinspot' ),
			'markerStyle' => 'dot',
			'linkText'    => $pinspot_cta,
			'linkUrl'     => '#',
			'group'       => esc_attr__( 'Tables', 'pinspot' ),
		),
		array(
			'id'          => 'hs-stl-4',
			'x'           => 65,
			'y'           => 32,
			'title'       => esc_attr__( 'Framed print', 'pinspot' ),
			'description' => esc_attr__( 'Giclee print, oak frame.', 'pinspot' ),
			'markerStyle' => 'dot',
			'linkText'    => $pinspot_cta,
			'linkUrl'     => '#',
			'group'       => esc_attr__( 'Decor', 'pinspot' ),
		),
		array(
			'id'          => 'hs-stl-5',
			'x'           => 15,
			'y'           => 53,
			'title'       => esc_attr__( 'Potted fig', 'pinspot' ),
			'description' => esc_attr__( 'Live plant, ceramic pot.', 'pinspot' ),
			'markerStyle' => 'dot',
			'linkText'    => $pinspot_cta,
			'linkUrl'     => '#',
			'group'       => esc_attr__( 'Decor', 'pinspot' ),
		),
	),
);

return array(
	'title'         => __( 'Shop the look', 'pinspot' ),
	'description'   => __( 'A room photo with a pin on every item, each opening a tooltip with a short description and a button linking to that product. Category filters let visitors narrow to seating, lighting or decor. Replace the demo scene with your own photo.', 'pinspot' ),
	'categories'    => array( 'pinspot' ),
	'keywords'      => array( 'shoppable', 'shop the look', 'lookbook', 'product' ),
	'viewportWidth' => 1200,
	'content'       => '<!-- wp:pinspot/image-hotspots ' . wp_json_encode( $pinspot_attrs ) . ' /-->',
);
