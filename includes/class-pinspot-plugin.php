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
	}

	/**
	 * Register the block from the compiled build metadata.
	 *
	 * Translations load automatically for WP.org-hosted plugins (WP ≥ 4.6);
	 * editor/view script translations are handled via block.json "textdomain".
	 */
	public function register_block() {
		register_block_type( PINSPOT_DIR . 'build' );
	}
}
