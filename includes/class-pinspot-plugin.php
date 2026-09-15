<?php
/**
 * Main plugin class.
 *
 * @package Pinspot
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Boots the Pinspot block.
 */
final class Pinspot_Plugin {

	/**
	 * Singleton instance.
	 *
	 * @var Pinspot_Plugin|null
	 */
	private static $instance = null;

	/**
	 * Get the singleton instance.
	 *
	 * @return Pinspot_Plugin
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Wire hooks.
	 */
	private function __construct() {
		add_action( 'init', array( $this, 'register_block' ) );
		add_action( 'init', array( $this, 'register_patterns' ) );
	}

	/**
	 * Register the block from the compiled build metadata.
	 *
	 * Translations load automatically for WP.org-hosted plugins (WP ≥ 4.6);
	 * editor/view script translations are handled via block.json "textdomain".
	 */
	public function register_block() {
		// Extension seam: let add-ons (e.g. PinSpot Pro) register extra block
		// attributes without editing the free plugin. Guarded by block name.
		add_filter( 'block_type_metadata', array( $this, 'extend_block_metadata' ) );
		register_block_type( PINSPOT_DIR . 'build' );
	}

	/**
	 * Merge add-on attributes into the block metadata at registration.
	 *
	 * Add-ons hook `pinspot_block_attributes` and return an attribute schema
	 * array; it is merged onto (never over) the built-in attributes.
	 *
	 * @param array $metadata Block metadata from block.json.
	 * @return array
	 */
	public function extend_block_metadata( $metadata ) {
		if ( ! is_array( $metadata ) || 'pinspot/image-hotspots' !== ( isset( $metadata['name'] ) ? $metadata['name'] : '' ) ) {
			return $metadata;
		}

		/**
		 * Filter the extra attributes registered on the Image Hotspots block.
		 *
		 * @param array $attributes Map of attribute name => schema. Default empty.
		 */
		$extra = apply_filters( 'pinspot_block_attributes', array() );
		if ( ! empty( $extra ) && is_array( $extra ) ) {
			$existing               = isset( $metadata['attributes'] ) && is_array( $metadata['attributes'] ) ? $metadata['attributes'] : array();
			$metadata['attributes'] = array_merge( $extra, $existing );
		}

		return $metadata;
	}

	/**
	 * Register the Pinspot pattern category and starter patterns.
	 */
	public function register_patterns() {
		register_block_pattern_category(
			'pinspot',
			array( 'label' => __( 'PinSpot', 'pinspot' ) )
		);

		$patterns = array( 'product-showcase', 'team-intro', 'map-tour' );
		foreach ( $patterns as $slug ) {
			$file = PINSPOT_DIR . 'patterns/' . $slug . '.php';
			if ( ! file_exists( $file ) ) {
				continue;
			}
			$pattern = include $file;
			if ( is_array( $pattern ) && ! empty( $pattern['content'] ) ) {
				register_block_pattern( 'pinspot/' . $slug, $pattern );
			}
		}
	}
}
