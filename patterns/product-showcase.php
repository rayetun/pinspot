<?php
/**
 * Pattern: Product showcase — numbered pins with call-to-action buttons.
 *
 * Ships with a bundled demo illustration; users replace it with their
 * own product photo after inserting.
 *
 * @package Pinspot
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$pinspot_demo_image = esc_url( PINSPOT_URL . 'patterns/images/product.svg' );

return array(
	'title'         => __( 'Product showcase hotspots', 'pinspot' ),
	'description'   => __( 'Numbered pins over a product image, each with a title, description, and a call-to-action button. Replace the demo image with your own.', 'pinspot' ),
	'categories'    => array( 'pinspot' ),
	'viewportWidth' => 1200,
	'content'       => '<!-- wp:pinspot/image-hotspots {"imageUrl":"' . $pinspot_demo_image . '","imageAlt":"' . esc_attr__( 'Product demo image', 'pinspot' ) . '","imageWidth":1200,"imageHeight":675,"hotspots":[{"id":"hs-product-1","x":32,"y":68,"title":"' . esc_attr__( 'Feature one', 'pinspot' ) . '","description":"' . esc_attr__( 'Describe the first highlight of your product.', 'pinspot' ) . '","linkText":"' . esc_attr__( 'Shop now', 'pinspot' ) . '","linkUrl":"#"},{"id":"hs-product-2","x":50,"y":36,"title":"' . esc_attr__( 'Feature two', 'pinspot' ) . '","description":"' . esc_attr__( 'Explain what makes this detail special.', 'pinspot' ) . '","linkText":"' . esc_attr__( 'Learn more', 'pinspot' ) . '","linkUrl":"#"},{"id":"hs-product-3","x":68,"y":68,"title":"' . esc_attr__( 'Feature three', 'pinspot' ) . '","description":"' . esc_attr__( 'One more reason to love it.', 'pinspot' ) . '","linkText":"' . esc_attr__( 'Details', 'pinspot' ) . '","linkUrl":"#"}]} /-->',
);
