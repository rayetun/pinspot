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
 * @return array { embed: string, thumb: string } Empty strings when unrecognized.
 */
$pinspot_embed_data = static function ( $type, $url ) {
	if ( 'youtube' === $type && preg_match( '#(?:youtube\.com/(?:watch\?v=|embed/|shorts/)|youtu\.be/)([A-Za-z0-9_-]{6,20})#', $url, $m ) ) {
		return array(
			'embed' => 'https://www.youtube-nocookie.com/embed/' . $m[1] . '?autoplay=1',
			'thumb' => 'https://i.ytimg.com/vi/' . $m[1] . '/hqdefault.jpg',
		);
	}
	if ( 'vimeo' === $type && preg_match( '#vimeo\.com/(?:video/)?(\d+)#', $url, $m ) ) {
		return array(
			'embed' => 'https://player.vimeo.com/video/' . $m[1] . '?autoplay=1',
			'thumb' => '',
		);
	}
	return array(
		'embed' => '',
		'thumb' => '',
	);
};

$pinspot_image_alt = isset( $attributes['imageAlt'] ) ? (string) $attributes['imageAlt'] : '';
$pinspot_hotspots  = ( isset( $attributes['hotspots'] ) && is_array( $attributes['hotspots'] ) ) ? $attributes['hotspots'] : array();

// Block-level display settings.
$pinspot_global_trigger = ( isset( $attributes['globalTrigger'] ) && 'hover' === $attributes['globalTrigger'] ) ? 'hover' : 'click';
$pinspot_global_theme   = ( isset( $attributes['globalTheme'] ) && 'dark' === $attributes['globalTheme'] ) ? 'dark' : 'light';
$pinspot_enable_zoom    = ! empty( $attributes['enableZoom'] );
$pinspot_max_zoom       = isset( $attributes['maxZoom'] ) ? (float) $attributes['maxZoom'] : 3;
$pinspot_max_zoom       = min( 8, max( 1.5, $pinspot_max_zoom ) );

$pinspot_tooltip_width = isset( $attributes['tooltipWidth'] ) ? absint( $attributes['tooltipWidth'] ) : 280;
$pinspot_tooltip_width = min( 480, max( 180, $pinspot_tooltip_width ) );
$pinspot_show_list     = ! empty( $attributes['showList'] );

// Guided tour: step through hotspots in order via prev/next, optional autoplay.
$pinspot_enable_tour   = ! empty( $attributes['enableTour'] );
$pinspot_tour_autoplay = ! empty( $attributes['tourAutoplay'] );
$pinspot_tour_interval = isset( $attributes['tourInterval'] ) ? (float) $attributes['tourInterval'] : 4;
$pinspot_tour_interval = min( 20, max( 2, $pinspot_tour_interval ) );

// Tour appearance.
$pinspot_tour_show_count = ! array_key_exists( 'tourShowCount', $attributes ) || ! empty( $attributes['tourShowCount'] );
$pinspot_tour_color      = isset( $attributes['tourColor'] ) ? sanitize_hex_color( $attributes['tourColor'] ) : '';
$pinspot_tour_position   = ( isset( $attributes['tourPosition'] ) && 'overlay' === $attributes['tourPosition'] ) ? 'overlay' : 'below';
$pinspot_tour_size       = isset( $attributes['tourButtonSize'] ) && in_array( $attributes['tourButtonSize'], array( 'small', 'medium', 'large' ), true )
	? $attributes['tourButtonSize']
	: 'medium';
$pinspot_tour_shape      = ( isset( $attributes['tourButtonShape'] ) && 'rounded' === $attributes['tourButtonShape'] ) ? 'rounded' : 'round';

// Ordered hotspot ids + accessible titles, seeded into context for the tour.
$pinspot_tour_ids    = array();
$pinspot_tour_titles = array();
if ( $pinspot_enable_tour ) {
	foreach ( $pinspot_hotspots as $pinspot_ti => $pinspot_th ) {
		if ( ! is_array( $pinspot_th ) ) {
			continue;
		}
		$pinspot_tour_ids[]      = isset( $pinspot_th['id'] ) ? (string) $pinspot_th['id'] : 'hs-' . $pinspot_ti;
		$pinspot_th_title        = isset( $pinspot_th['title'] ) ? (string) $pinspot_th['title'] : '';
		/* translators: %d: hotspot number. */
		$pinspot_tour_titles[]   = '' !== $pinspot_th_title ? $pinspot_th_title : sprintf( __( 'Hotspot %d', 'pinspot' ), $pinspot_ti + 1 );
	}
}
$pinspot_tour_count = count( $pinspot_tour_ids );

// Inline tags allowed in tooltip descriptions.
$pinspot_desc_tags = array(
	'a'      => array(
		'href'   => true,
		'target' => true,
		'rel'    => true,
	),
	'strong' => array(),
	'em'     => array(),
	'br'     => array(),
);

$pinspot_context = array(
	'openId'      => '',
	'scale'       => 1,
	'tx'          => 0,
	'ty'          => 0,
	'maxZoom'     => $pinspot_enable_zoom ? $pinspot_max_zoom : 0,
	'lightboxSrc' => '',
);

if ( $pinspot_enable_tour && $pinspot_tour_count > 1 ) {
	$pinspot_context['tourIds']      = $pinspot_tour_ids;
	$pinspot_context['tourTitles']   = $pinspot_tour_titles;
	$pinspot_context['tourPlaying']  = false;
	$pinspot_context['tourAutoplay'] = $pinspot_tour_autoplay;
	$pinspot_context['tourInterval'] = (int) round( $pinspot_tour_interval * 1000 );
}

$pinspot_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => 'pinspot',
		'style' => sprintf( '--pinspot-tooltip-width:%dpx;', $pinspot_tooltip_width ),
	)
);
?>
<figure
	<?php echo wp_kses_data( $pinspot_wrapper_attributes ); ?>
	data-wp-interactive="pinspot"
	<?php echo wp_kses_data( wp_interactivity_data_wp_context( $pinspot_context ) ); ?>
	data-wp-watch="callbacks.syncZoom"
	data-wp-on-document--click="actions.closeAll"
	data-wp-on-document--keydown="actions.onKeydown"
>
	<?php if ( $pinspot_enable_zoom ) : ?>
		<div class="pinspot__zoom-controls">
			<button type="button" class="pinspot__zoom-btn" data-wp-on--click="actions.zoomIn" aria-label="<?php esc_attr_e( 'Zoom in', 'pinspot' ); ?>">+</button>
			<button type="button" class="pinspot__zoom-btn" data-wp-on--click="actions.zoomOut" aria-label="<?php esc_attr_e( 'Zoom out', 'pinspot' ); ?>">&minus;</button>
			<button type="button" class="pinspot__zoom-btn" data-wp-on--click="actions.resetZoom" data-wp-bind--hidden="!state.isZoomed" aria-label="<?php esc_attr_e( 'Reset zoom', 'pinspot' ); ?>" hidden>&#8634;</button>
		</div>
	<?php endif; ?>
	<div class="pinspot__viewport-wrap">
	<div
		class="pinspot__viewport<?php echo $pinspot_enable_zoom ? ' pinspot__viewport--zoomable' : ''; ?>"
		data-wp-class--is-zoomed="state.isZoomed"
		<?php if ( $pinspot_enable_zoom ) : ?>
		data-wp-on--wheel="actions.onWheel"
		data-wp-on--dblclick="actions.onDblClick"
		data-wp-on--pointerdown="actions.onPanStart"
		data-wp-on--pointermove="actions.onPanMove"
		data-wp-on--pointerup="actions.onPanEnd"
		data-wp-on--pointercancel="actions.onPanEnd"
		<?php endif; ?>
	>
		<div class="pinspot__stage" data-wp-style--transform="state.stageTransform">
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
				$pinspot_animation    = isset( $pinspot_hotspot['animation'] ) ? (string) $pinspot_hotspot['animation'] : '';

				if ( ! in_array( $pinspot_marker_style, array( 'number', 'dot', 'plus', 'info', 'question' ), true ) ) {
					$pinspot_marker_style = 'number';
				}
				if ( ! in_array( $pinspot_marker_size, array( 'small', 'medium', 'large' ), true ) ) {
					$pinspot_marker_size = 'medium';
				}
				if ( ! in_array( $pinspot_animation, array( 'pulse', 'bounce' ), true ) ) {
					$pinspot_animation = '';
				}

				// Behavior: effective values (hotspot override, else block default).
				$pinspot_trigger   = isset( $pinspot_hotspot['trigger'] ) && in_array( $pinspot_hotspot['trigger'], array( 'click', 'hover' ), true )
					? $pinspot_hotspot['trigger']
					: $pinspot_global_trigger;
				$pinspot_theme     = isset( $pinspot_hotspot['theme'] ) && in_array( $pinspot_hotspot['theme'], array( 'light', 'dark' ), true )
					? $pinspot_hotspot['theme']
					: $pinspot_global_theme;
				$pinspot_placement = isset( $pinspot_hotspot['placement'] ) && in_array( $pinspot_hotspot['placement'], array( 'top', 'bottom', 'left', 'right' ), true )
					? $pinspot_hotspot['placement']
					: 'auto';
				$pinspot_lightbox  = ! empty( $pinspot_hotspot['lightbox'] );

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
				$pinspot_embed      = array(
					'embed' => '',
					'thumb' => '',
				);
				if ( 'youtube' === $pinspot_media_type || 'vimeo' === $pinspot_media_type ) {
					$pinspot_embed = $pinspot_embed_data( $pinspot_media_type, $pinspot_media_url );
				}

				// Call to action.
				$pinspot_link_url  = isset( $pinspot_hotspot['linkUrl'] ) ? (string) $pinspot_hotspot['linkUrl'] : '';
				$pinspot_link_text = isset( $pinspot_hotspot['linkText'] ) ? (string) $pinspot_hotspot['linkText'] : '';
				$pinspot_link_new  = ! empty( $pinspot_hotspot['linkNewTab'] );

				/* translators: %d: hotspot number. */
				$pinspot_label   = '' !== $pinspot_title ? $pinspot_title : sprintf( __( 'Hotspot %d', 'pinspot' ), $pinspot_num );
				$pinspot_tip_dom = wp_unique_id( 'pinspot-tip-' );

				$pinspot_hotspot_context = array(
					'id'        => $pinspot_id,
					'trigger'   => $pinspot_trigger,
					'placement' => $pinspot_placement,
					'videoOpen' => false,
					'embedUrl'  => $pinspot_embed['embed'],
					'mediaFull' => ( $pinspot_lightbox && 'image' === $pinspot_media_type ) ? $pinspot_media_url : '',
				);

				$pinspot_marker_classes = sprintf(
					'pinspot__marker pinspot__marker--%s pinspot__marker--%s%s',
					$pinspot_marker_style,
					$pinspot_marker_size,
					$pinspot_animation ? ' pinspot__marker--anim-' . $pinspot_animation : ''
				);

				$pinspot_tooltip_classes = 'pinspot__tooltip pinspot__tooltip--' . $pinspot_theme;
				if ( 'auto' !== $pinspot_placement ) {
					$pinspot_tooltip_classes .= ' pinspot__tooltip--' . $pinspot_placement;
				}
				?>
				<div
					class="pinspot__hotspot"
					style="<?php echo esc_attr( sprintf( 'left:%F%%;top:%F%%;', $pinspot_x, $pinspot_y ) ); ?>"
					<?php echo wp_kses_data( wp_interactivity_data_wp_context( $pinspot_hotspot_context ) ); ?>
					data-wp-class--is-open="state.isOpen"
					data-wp-init="callbacks.initHotspot"
					<?php if ( 'hover' === $pinspot_trigger ) : ?>
					data-wp-on--mouseenter="actions.hoverOpen"
					data-wp-on--mouseleave="actions.hoverClose"
					data-wp-on--focusin="actions.hoverOpen"
					data-wp-on--focusout="actions.hoverClose"
					<?php endif; ?>
				>
					<button
						type="button"
						class="<?php echo esc_attr( $pinspot_marker_classes ); ?>"
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
						class="<?php echo esc_attr( $pinspot_tooltip_classes ); ?>"
						data-wp-bind--hidden="!state.isOpen"
						data-wp-watch="callbacks.autoPlace"
						data-wp-on--click="actions.stop"
						hidden
					>
						<div class="pinspot__tooltip-body">
						<?php if ( 'image' === $pinspot_media_type && '' !== $pinspot_media_url ) : ?>
							<?php if ( $pinspot_lightbox ) : ?>
								<button type="button" class="pinspot__media-btn" data-wp-on--click="actions.openLightbox" aria-label="<?php esc_attr_e( 'View image full size', 'pinspot' ); ?>">
									<img class="pinspot__tooltip-media" src="<?php echo esc_url( $pinspot_media_url ); ?>" alt="" loading="lazy" />
								</button>
							<?php else : ?>
								<img class="pinspot__tooltip-media" src="<?php echo esc_url( $pinspot_media_url ); ?>" alt="" loading="lazy" />
							<?php endif; ?>
						<?php elseif ( 'video' === $pinspot_media_type && '' !== $pinspot_media_url ) : ?>
							<video class="pinspot__tooltip-media" src="<?php echo esc_url( $pinspot_media_url ); ?>" controls playsinline preload="metadata"></video>
						<?php elseif ( '' !== $pinspot_embed['embed'] ) : ?>
							<button
								type="button"
								class="pinspot__facade"
								data-wp-on--click="actions.playVideo"
								data-wp-bind--hidden="context.videoOpen"
								aria-label="<?php esc_attr_e( 'Play video', 'pinspot' ); ?>"
								<?php if ( '' !== $pinspot_embed['thumb'] ) : ?>
								style="<?php echo esc_attr( 'background-image:url(' . esc_url( $pinspot_embed['thumb'] ) . ');' ); ?>"
								<?php endif; ?>
							>
								<span class="pinspot__facade-play" aria-hidden="true"></span>
							</button>
							<iframe
								class="pinspot__tooltip-media pinspot__tooltip-embed"
								data-wp-bind--src="state.videoSrc"
								data-wp-bind--hidden="!context.videoOpen"
								title="<?php echo esc_attr( $pinspot_label ); ?>"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
								allowfullscreen
								hidden
							></iframe>
						<?php endif; ?>
						<?php if ( '' !== $pinspot_title ) : ?>
							<strong class="pinspot__tooltip-title"><?php echo esc_html( $pinspot_title ); ?></strong>
						<?php endif; ?>
						<?php if ( '' !== $pinspot_desc ) : ?>
							<p class="pinspot__tooltip-desc"><?php echo wp_kses( nl2br( $pinspot_desc ), $pinspot_desc_tags ); ?></p>
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
				</div>
			<?php endforeach; ?>
		</div>
	</div>
	<?php if ( $pinspot_enable_tour && $pinspot_tour_count > 1 ) : ?>
		<?php
		$pinspot_tour_classes = sprintf(
			'pinspot__tour pinspot__tour--%s pinspot__tour--size-%s pinspot__tour--shape-%s',
			$pinspot_tour_position,
			$pinspot_tour_size,
			$pinspot_tour_shape
		);
		?>
		<div
			class="<?php echo esc_attr( $pinspot_tour_classes ); ?>"
			<?php if ( $pinspot_tour_color ) : ?>
			style="<?php echo esc_attr( '--pinspot-tour-color:' . $pinspot_tour_color . ';' ); ?>"
			<?php endif; ?>
			role="group"
			aria-label="<?php esc_attr_e( 'Hotspot tour', 'pinspot' ); ?>"
			<?php if ( $pinspot_tour_autoplay ) : ?>
			data-wp-init="callbacks.tourInit"
			data-wp-watch="callbacks.tourAutoplay"
			<?php endif; ?>
		>
			<?php if ( $pinspot_tour_autoplay ) : ?>
				<button
					type="button"
					class="pinspot__tour-btn pinspot__tour-play"
					data-wp-on--click="actions.tourTogglePlay"
					data-wp-bind--aria-pressed="context.tourPlaying"
					aria-label="<?php esc_attr_e( 'Play or pause the tour', 'pinspot' ); ?>"
				>
					<span class="pinspot__tour-icon-play" aria-hidden="true" data-wp-bind--hidden="context.tourPlaying"></span>
					<span class="pinspot__tour-icon-pause" aria-hidden="true" data-wp-bind--hidden="!context.tourPlaying" hidden></span>
				</button>
			<?php endif; ?>
			<button type="button" class="pinspot__tour-btn pinspot__tour-prev" data-wp-on--click="actions.tourPrev" aria-label="<?php esc_attr_e( 'Previous hotspot', 'pinspot' ); ?>">
				<span class="pinspot__tour-chevron" aria-hidden="true"></span>
			</button>
			<?php if ( $pinspot_tour_show_count ) : ?>
			<span class="pinspot__tour-count" aria-hidden="true"><span data-wp-text="state.tourCurrent">0</span> / <?php echo absint( $pinspot_tour_count ); ?></span>
			<?php endif; ?>
			<button type="button" class="pinspot__tour-btn pinspot__tour-next" data-wp-on--click="actions.tourNext" aria-label="<?php esc_attr_e( 'Next hotspot', 'pinspot' ); ?>">
				<span class="pinspot__tour-chevron" aria-hidden="true"></span>
			</button>
			<span class="pinspot__tour-status" aria-live="polite" data-wp-text="state.tourStatus"></span>
		</div>
	<?php endif; ?>
	</div>
	<div
		class="pinspot__lightbox"
		data-wp-bind--hidden="!state.lightboxOpen"
		data-wp-on--click="actions.closeLightbox"
		hidden
	>
		<img class="pinspot__lightbox-img" data-wp-bind--src="state.lightboxSrc" alt="" />
		<button type="button" class="pinspot__lightbox-close" data-wp-on--click="actions.closeLightbox" aria-label="<?php esc_attr_e( 'Close', 'pinspot' ); ?>">&times;</button>
	</div>
	<?php if ( $pinspot_show_list && ! empty( $pinspot_hotspots ) ) : ?>
		<div class="pinspot__list-wrap">
			<p class="pinspot__list-heading"><?php esc_html_e( 'On this image', 'pinspot' ); ?></p>
			<ol class="pinspot__list">
				<?php foreach ( $pinspot_hotspots as $pinspot_index => $pinspot_hotspot ) : ?>
					<?php
					if ( ! is_array( $pinspot_hotspot ) ) {
						continue;
					}
					$pinspot_item_title = isset( $pinspot_hotspot['title'] ) ? (string) $pinspot_hotspot['title'] : '';
					$pinspot_item_desc  = isset( $pinspot_hotspot['description'] ) ? (string) $pinspot_hotspot['description'] : '';
					$pinspot_item_url   = isset( $pinspot_hotspot['linkUrl'] ) ? (string) $pinspot_hotspot['linkUrl'] : '';
					$pinspot_item_text  = isset( $pinspot_hotspot['linkText'] ) ? (string) $pinspot_hotspot['linkText'] : '';
					$pinspot_item_color = isset( $pinspot_hotspot['markerColor'] ) ? sanitize_hex_color( $pinspot_hotspot['markerColor'] ) : '';
					if ( '' === $pinspot_item_title ) {
						/* translators: %d: hotspot number. */
						$pinspot_item_title = sprintf( __( 'Hotspot %d', 'pinspot' ), $pinspot_index + 1 );
					}
					?>
					<li class="pinspot__list-item">
						<span
							class="pinspot__list-num"
							aria-hidden="true"
							<?php if ( $pinspot_item_color ) : ?>
							style="<?php echo esc_attr( '--pinspot-marker-color:' . $pinspot_item_color . ';' ); ?>"
							<?php endif; ?>
						><?php echo absint( $pinspot_index + 1 ); ?></span>
						<div class="pinspot__list-body">
							<strong class="pinspot__list-title"><?php echo esc_html( $pinspot_item_title ); ?></strong>
							<?php if ( '' !== $pinspot_item_desc ) : ?>
								<span class="pinspot__list-desc"><?php echo wp_kses( nl2br( $pinspot_item_desc ), $pinspot_desc_tags ); ?></span>
							<?php endif; ?>
							<?php if ( '' !== $pinspot_item_url && '' !== $pinspot_item_text ) : ?>
								<a class="pinspot__list-link" href="<?php echo esc_url( $pinspot_item_url ); ?>"><?php echo esc_html( $pinspot_item_text ); ?></a>
							<?php endif; ?>
						</div>
					</li>
				<?php endforeach; ?>
			</ol>
		</div>
	<?php endif; ?>
</figure>
