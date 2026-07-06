<?php
/**
 * Plugin Name:       Pinspot — Interactive Image Hotspots
 * Plugin URI:        https://wordpress.org/plugins/pinspot/
 * Description:       Place clickable hotspot pins on any image — rich, accessible tooltips with text, media, and links.
 * Version:           1.0.0
 * Requires at least: 6.6
 * Requires PHP:      7.4
 * Author:            Rayetun
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       pinspot
 *
 * @package Pinspot
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'PINSPOT_VERSION', '1.0.0' );
define( 'PINSPOT_DIR', plugin_dir_path( __FILE__ ) );
define( 'PINSPOT_URL', plugin_dir_url( __FILE__ ) );

require_once PINSPOT_DIR . 'includes/class-pinspot-plugin.php';

Pinspot_Plugin::get_instance();
