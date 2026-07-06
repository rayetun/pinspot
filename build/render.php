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

/**
 * Build a privacy-friendly embed URL from a YouTube or Vimeo page URL.
 *
 * @param string $type Either 'youtube' or 'vimeo'.
 * @param string $url  The video page URL as entered by the editor.
 * @return string Embed URL, or '' when the URL is not recognized.
 */
$pinspot_embed_url = static function ( $type, $url ) {
	if ( 'youtube' === $type && preg_match( '#(?:youtube\.com/(?:watch\?v=|embed/|shorts/)|youtu\.be/)([A-Za-z0-9_-]{6,20})#', $url, $m ) ) {
		return 'https://www.youtube-nocookie.com/embed/' . $m[1];
	}
	if ( 'vimeo' === $type && preg_match( '#vimeo\.com/(?:video/)?(\d+)#', $url, $m ) ) {
		return 'https://player.vimeo.com/video/' . $m[1];
	}
	return '';
};

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

		// Marker appearance.
		$pinspot_marker_style = isset( $pinspot_hotspot['markerStyle'] ) ? (string) $pinspot_hotspot['markerStyle'] : 'number';
		$pinspot_marker_size  = isset( $pinspot_hotspot['markerSize'] ) ? (string) $pinspot_hotspot['markerSize'] : 'medium';
		$pinspot_marker_color = isset( $pinspot_hotspot['markerColor'] ) ? sanitize_hex_color( $pinspot_hotspot['markerColor'] ) : '';

		if ( ! in_array( $pinspot_marker_style, array( 'number', 'dot', 'plus', 'info', 'question' ), true ) ) {
			$pinspot_marker_style = 'number';
		}
		if ( ! in_array( $pinspot_marker_size, array( 'small', 'medium', 'large' ), true ) ) {
			$pinspot_marker_size = 'medium';
		}

		$pinspot_glyphs = array(
			'dot'      => '',
			'plus'     => '+',
			'info'     => 'i',
			'question' => '?',
		);
		$pinspot_glyph  = isset( $pinspot_glyphs[ $pinspot_marker_style ] ) ? $pinspot_glyphs[ $pinspot_marker_style ] : (string) $pinspot_num;

		// Tooltip media.
		$pinspot_media_type = isset( $pinspot_hotspot['mediaType'] ) ? (string) $pinspot_hotspot['mediaType'] : '';
		$pinspot_media_url  = isset( $pinspot_hotspot['mediaUrl'] ) ? (string) $pinspot_hotspot['mediaUrl'] : '';
		$pinspot_embed      = ( 'youtube' === $pinspot_media_type || 'vimeo' === $pinspot_media_type ) ? $pinspot_embed_url( $pinspot_media_type, $pinspot_media_url ) : '';

		// Call to action.
		$pinspot_link_url  = isset( $pinspot_hotspot['linkUrl'] ) ? (string) $pinspot_hotspot['linkUrl'] : '';
		$pinspot_link_text = isset( $pinspot_hotspot['linkText'] ) ? (string) $pinspot_hotspot['linkText'] : '';
		$pinspot_link_new  = ! empty( $pinspot_hotspot['linkNewTab'] );

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
				class="<?php echo esc_attr( sprintf( 'pinspot__marker pinspot__marker--%s pinspot__marker--%s', $pinspot_marker_style, $pinspot_marker_size ) ); ?>"
				<?php if ( $pinspot_marker_color ) : ?>
				style="<?php echo esc_attr( '--pinspot-marker-color:' . $pinspot_marker_color . ';' ); ?>"
				<?php endif; ?>
				data-wp-on--click="actions.toggle"
				data-wp-bind--aria-expanded="state.isOpen"
				aria-controls="<?php echo esc_attr( $pinspot_tip_dom ); ?>"
				aria-label="<?php echo esc_attr( $pinspot_label ); ?>"
			>
				<span aria-hidden="true"><?php echo esc_html( $pinspot_glyph ); ?></span>
			</button>
			<div
				id="<?php echo esc_attr( $pinspot_tip_dom ); ?>"
				class="pinspot__tooltip"
				data-wp-bind--hidden="!state.isOpen"
				hidden
			>
				<?php if ( 'image' === $pinspot_media_type && '' !== $pinspot_media_url ) : ?>
					<img class="pinspot__tooltip-media" src="<?php echo esc_url( $pinspot_media_url ); ?>" alt="" loading="lazy" />
				<?php elseif ( 'video' === $pinspot_media_type && '' !== $pinspot_media_url ) : ?>
					<video class="pinspot__tooltip-media" src="<?php echo esc_url( $pinspot_media_url ); ?>" controls playsinline preload="metadata"></video>
				<?php elseif ( '' !== $pinspot_embed ) : ?>
					<iframe
						class="pinspot__tooltip-media pinspot__tooltip-embed"
						src="<?php echo esc_url( $pinspot_embed ); ?>"
						title="<?php echo esc_attr( $pinspot_label ); ?>"
						loading="lazy"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						allowfullscreen
					></iframe>
				<?php endif; ?>
				<?php if ( '' !== $pinspot_title ) : ?>
					<strong class="pinspot__tooltip-title"><?php echo esc_html( $pinspot_title ); ?></strong>
				<?php endif; ?>
				<?php if ( '' !== $pinspot_desc ) : ?>
					<p class="pinspot__tooltip-desc"><?php echo esc_html( $pinspot_desc ); ?></p>
				<?php endif; ?>
				<?php if ( '' !== $pinspot_link_url && '' !== $pinspot_link_text ) : ?>
					<a
						class="pinspot__tooltip-cta"
						href="<?php echo esc_url( $pinspot_link_url ); ?>"
						<?php if ( $pinspot_link_new ) : ?>
						target="_blank" rel="noopener noreferrer"
						<?php endif; ?>
					><?php echo esc_html( $pinspot_link_text ); ?></a>
				<?php endif; ?>
			</div>
		</div>
	<?php endforeach; ?>
</figure>
