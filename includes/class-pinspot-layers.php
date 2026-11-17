<?php
/**
 * Shared layer normalizer for the pinspot/image-hotspots block.
 *
 * A PinSpot block holds one or more image *layers* — a floor plan's ground and
 * first floor, a before/after pair, a wide shot and a zoomed detail — each with
 * its own image and its own hotspots. Everything else (theme, tooltip styling,
 * zoom, filters, tour settings) stays block-level, so a layer is just an image
 * plus hotspots.
 *
 * Storage is deliberately backward compatible:
 *
 *   - Blocks saved before layers existed keep their flat `imageUrl` /
 *     `imageAlt` / `hotspots` attributes.
 *   - The `layers` attribute is only written once an editor actually adds a
 *     second layer.
 *
 * Both shapes are read through this class, so published posts need no
 * migration and are never silently rewritten, and a block authored with layers
 * still shows its first layer if the plugin is downgraded.
 *
 * Extensions must read hotspots through {@see Pinspot_Layers::all_hotspots()}
 * rather than `$attributes['hotspots']` directly, or they will see nothing on a
 * multi-layer block.
 *
 * @package Pinspot
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Reads the one-or-many image layers of a PinSpot block.
 */
final class Pinspot_Layers {

	/**
	 * Normalize a block's attributes into an ordered list of layers.
	 *
	 * Layers without an image are dropped, so every returned layer is
	 * renderable. The result is always a list (sequential integer keys).
	 *
	 * @param array $attributes Block attributes.
	 * @return array[] Each layer: id, name, imageId, imageUrl, imageAlt,
	 *                 imageWidth, imageHeight, hotspots.
	 */
	public static function get( $attributes ) {
		if ( ! is_array( $attributes ) ) {
			return array();
		}

		$layers = array();

		if ( ! empty( $attributes['layers'] ) && is_array( $attributes['layers'] ) ) {
			$index = 0;
			foreach ( $attributes['layers'] as $raw ) {
				if ( ! is_array( $raw ) ) {
					continue;
				}
				$layer = self::normalize( $raw, $index );
				if ( null !== $layer ) {
					$layers[] = $layer;
					++$index;
				}
			}
			if ( $layers ) {
				return $layers;
			}
			// `layers` held nothing renderable — fall through to the flat shape.
		}

		$legacy = self::normalize(
			array(
				'id'          => 'layer-1',
				'imageId'     => isset( $attributes['imageId'] ) ? $attributes['imageId'] : 0,
				'imageUrl'    => isset( $attributes['imageUrl'] ) ? $attributes['imageUrl'] : '',
				'imageAlt'    => isset( $attributes['imageAlt'] ) ? $attributes['imageAlt'] : '',
				'imageWidth'  => isset( $attributes['imageWidth'] ) ? $attributes['imageWidth'] : 0,
				'imageHeight' => isset( $attributes['imageHeight'] ) ? $attributes['imageHeight'] : 0,
				'hotspots'    => isset( $attributes['hotspots'] ) ? $attributes['hotspots'] : array(),
			),
			0
		);

		return null === $legacy ? array() : array( $legacy );
	}

	/**
	 * Every hotspot across every layer, flattened in layer order.
	 *
	 * Use this anywhere that previously read `$attributes['hotspots']` and does
	 * not care which layer a hotspot belongs to — analytics, exports, counts.
	 *
	 * @param array $attributes Block attributes.
	 * @return array[] Hotspot arrays, in layer then author order.
	 */
	public static function all_hotspots( $attributes ) {
		$all = array();
		foreach ( self::get( $attributes ) as $layer ) {
			foreach ( $layer['hotspots'] as $hotspot ) {
				if ( is_array( $hotspot ) ) {
					$all[] = $hotspot;
				}
			}
		}
		return $all;
	}

	/**
	 * Whether this block has more than one renderable layer.
	 *
	 * The layer switcher is only rendered when this is true, so a
	 * single-image block is byte-for-byte unchanged from before layers existed.
	 *
	 * @param array $attributes Block attributes.
	 * @return bool
	 */
	public static function is_multi( $attributes ) {
		return count( self::get( $attributes ) ) > 1;
	}

	/**
	 * Coerce one raw layer into the canonical shape.
	 *
	 * @param array $raw   Raw layer data (or a synthesized flat-shape layer).
	 * @param int   $index Zero-based position, used for fallback id and name.
	 * @return array|null Null when the layer has no image and cannot render.
	 */
	private static function normalize( $raw, $index ) {
		$url = isset( $raw['imageUrl'] ) ? (string) $raw['imageUrl'] : '';
		if ( '' === trim( $url ) ) {
			return null;
		}

		$id = isset( $raw['id'] ) ? (string) $raw['id'] : '';
		if ( '' === trim( $id ) ) {
			$id = 'layer-' . ( $index + 1 );
		}

		$name = isset( $raw['name'] ) ? (string) $raw['name'] : '';
		if ( '' === trim( $name ) ) {
			/* translators: %d: layer number. */
			$name = sprintf( __( 'Layer %d', 'pinspot' ), $index + 1 );
		}

		$hotspots = ( isset( $raw['hotspots'] ) && is_array( $raw['hotspots'] ) ) ? $raw['hotspots'] : array();

		return array(
			'id'          => $id,
			'name'        => $name,
			'imageId'     => isset( $raw['imageId'] ) ? (int) $raw['imageId'] : 0,
			'imageUrl'    => $url,
			'imageAlt'    => isset( $raw['imageAlt'] ) ? (string) $raw['imageAlt'] : '',
			'imageWidth'  => isset( $raw['imageWidth'] ) ? (int) $raw['imageWidth'] : 0,
			'imageHeight' => isset( $raw['imageHeight'] ) ? (int) $raw['imageHeight'] : 0,
			'hotspots'    => $hotspots,
		);
	}
}
