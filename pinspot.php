<?php
/**
 * Plugin Name:       PinSpot - Interactive Image Hotspots
 * Plugin URI:        https://wordpress.org/plugins/pinspot/
 * Description:       Create interactive image hotspots with rich, accessible tooltips. Easily drop pins on photos, maps, or diagrams using a fast, native block.
 * Version:           1.1.0
 * Requires at least: 6.6
 * Requires PHP:      7.4
 * Author:            Md Rayhan Uddin
 * Author URI:        https://rayetun.com/
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       pinspot
 *
 * @package Pinspot
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'PINSPOT_VERSION', '1.1.0' );
define( 'PINSPOT_DIR', plugin_dir_path( __FILE__ ) );
define( 'PINSPOT_URL', plugin_dir_url( __FILE__ ) );

// Minimum PinSpot Pro version this build's extension API is compatible with.
if ( ! defined( 'PINSPOT_MIN_PRO_VERSION' ) ) {
	define( 'PINSPOT_MIN_PRO_VERSION', '1.0.0' );
}

require_once PINSPOT_DIR . 'includes/class-pinspot-plugin.php';

Pinspot_Plugin::get_instance();

if ( ! function_exists( 'pinspot_is_pro_active' ) ) {
	/**
	 * Whether a licensed PinSpot Pro add-on is active.
	 *
	 * Pro defines the PINSPOT_PRO_ACTIVE constant ONLY after its Freemius
	 * licence gate passes, so this reflects a genuine licence — not merely the
	 * Pro plugin being installed. Call it at render/admin time (Pro bootstraps
	 * on `plugins_loaded`, after the free plugin's own `init`), never at include
	 * time.
	 *
	 * @return bool
	 */
	function pinspot_is_pro_active() {
		return defined( 'PINSPOT_PRO_ACTIVE' ) && PINSPOT_PRO_ACTIVE;
	}
}
