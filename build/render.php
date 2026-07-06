<?php
/**
 * Server render for the pinspot/image-hotspots block.
 *
 * Markup is generated at request time (dynamic block), so it can evolve
 * without block deprecations. Interactivity is wired via data-wp-*
 * directives handled by the store in view.js.
 *
 * Available in scope: $attributes, $content, $block.
 *
 * @package Pinspot
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( empty( $attributes['imageUrl'] ) ) {
	return;
}

$pinspot_image_alt = isset( $attributes['imageAlt'] ) ? (string) $attributes['imageAlt'] : '';
$pinspot_hotspots  = ( isset( $attributes['hotspots'] ) && is_array( $attributes['hotspots'] ) ) ? $attributes['hotspots'] : array();

$pinspot_wrapper_attributes = get_block_wrapper_attributes( array( 'class' => 'pinspot' ) );
?>
<figure
	<?php echo wp_kses_data( $pinspot_wrapper_attributes ); ?>
	data-wp-interactive="pinspot"
	<?php echo wp_kses_data( wp_interactivity_data_wp_context( array( 'openId' => '' ) ) ); ?>
	data-wp-on-document--click="actions.closeAll"
	data-wp-on-document--keydown="actions.onKeydown"
>
	<img
		class="pinspot__image"
		src="<?php echo esc_url( $attributes['imageUrl'] ); ?>"
		alt="<?php echo esc_attr( $pinspot_image_alt ); ?>"
		<?php if ( ! empty( $attributes['imageWidth'] ) && ! empty( $attributes['imageHeight'] ) ) : ?>
		width="<?php echo absint( $attributes['imageWidth'] ); ?>"
		height="<?php echo absint( $attributes['imageHeight'] ); ?>"
		<?php endif; ?>
	/>
	<?php foreach ( $pinspot_hotspots as $pinspot_index => $pinspot_hotspot ) : ?>
		<?php
		if ( ! is_array( $pinspot_hotspot ) ) {
			continue;
		}

		$pinspot_id    = isset( $pinspot_hotspot['id'] ) ? (string) $pinspot_hotspot['id'] : 'hs-' . $pinspot_index;
		$pinspot_x     = isset( $pinspot_hotspot['x'] ) ? (float) $pinspot_hotspot['x'] : 50;
		$pinspot_y     = isset( $pinspot_hotspot['y'] ) ? (float) $pinspot_hotspot['y'] : 50;
		$pinspot_title = isset( $pinspot_hotspot['title'] ) ? (string) $pinspot_hotspot['title'] : '';
		$pinspot_desc  = isset( $pinspot_hotspot['description'] ) ? (string) $pinspot_hotspot['description'] : '';
		$pinspot_num   = $pinspot_index + 1;

		/* translators: %d: hotspot number. */
		$pinspot_label   = '' !== $pinspot_title ? $pinspot_title : sprintf( __( 'Hotspot %d', 'pinspot' ), $pinspot_num );
		$pinspot_tip_dom = wp_unique_id( 'pinspot-tip-' );
		?>
		<div
			class="pinspot__hotspot"
			style="<?php echo esc_attr( sprintf( 'left:%F%%;top:%F%%;', $pinspot_x, $pinspot_y ) ); ?>"
			<?php echo wp_kses_data( wp_interactivity_data_wp_context( array( 'id' => $pinspot_id ) ) ); ?>
		>
			<button
				type="button"
				class="pinspot__marker"
				data-wp-on--click="actions.toggle"
				data-wp-bind--aria-expanded="state.isOpen"
				aria-controls="<?php echo esc_attr( $pinspot_tip_dom ); ?>"
				aria-label="<?php echo esc_attr( $pinspot_label ); ?>"
			>
				<span aria-hidden="true"><?php echo absint( $pinspot_num ); ?></span>
			</button>
			<div
				id="<?php echo esc_attr( $pinspot_tip_dom ); ?>"
				class="pinspot__tooltip"
				data-wp-bind--hidden="!state.isOpen"
				hidden
			>
				<?php if ( '' !== $pinspot_title ) : ?>
					<strong class="pinspot__tooltip-title"><?php echo esc_html( $pinspot_title ); ?></strong>
				<?php endif; ?>
				<?php if ( '' !== $pinspot_desc ) : ?>
					<p class="pinspot__tooltip-desc"><?php echo esc_html( $pinspot_desc ); ?></p>
				<?php endif; ?>
			</div>
		</div>
	<?php endforeach; ?>
</figure>
