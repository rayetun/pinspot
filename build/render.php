<?php
/**
 * Server render for the pinspot/image-hotspots block.
 *
 * Phase 0 stub — Phase 1 adds hotspot markers + tooltip markup with
 * Interactivity API directives. Available in scope: $attributes, $content, $block.
 *
 * @package Pinspot
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( empty( $attributes['imageUrl'] ) ) {
	return;
}

$pinspot_image_alt = isset( $attributes['imageAlt'] ) ? $attributes['imageAlt'] : '';
?>
<figure <?php echo wp_kses_data( get_block_wrapper_attributes( array( 'class' => 'pinspot' ) ) ); ?>>
	<img
		src="<?php echo esc_url( $attributes['imageUrl'] ); ?>"
		alt="<?php echo esc_attr( $pinspot_image_alt ); ?>"
	/>
</figure>
