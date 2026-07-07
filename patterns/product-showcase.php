<?php
/**
 * Pattern: Product showcase — numbered pins with call-to-action buttons.
 *
 * @package Pinspot
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

return array(
	'title'       => __( 'Product showcase hotspots', 'pinspot' ),
	'description' => __( 'Numbered pins over a product photo, each with a title, description, and a call-to-action button. Add your own image after inserting.', 'pinspot' ),
	'categories'  => array( 'pinspot' ),
	'content'     => '<!-- wp:pinspot/image-hotspots {"hotspots":[{"id":"hs-product-1","x":25,"y":30,"title":"' . esc_attr__( 'Feature one', 'pinspot' ) . '","description":"' . esc_attr__( 'Describe the first highlight of your product.', 'pinspot' ) . '","linkText":"' . esc_attr__( 'Shop now', 'pinspot' ) . '","linkUrl":"#"},{"id":"hs-product-2","x":55,"y":50,"title":"' . esc_attr__( 'Feature two', 'pinspot' ) . '","description":"' . esc_attr__( 'Explain what makes this detail special.', 'pinspot' ) . '","linkText":"' . esc_attr__( 'Learn more', 'pinspot' ) . '","linkUrl":"#"},{"id":"hs-product-3","x":78,"y":68,"title":"' . esc_attr__( 'Feature three', 'pinspot' ) . '","description":"' . esc_attr__( 'One more reason to love it.', 'pinspot' ) . '","linkText":"' . esc_attr__( 'Details', 'pinspot' ) . '","linkUrl":"#"}]} /-->',
);
