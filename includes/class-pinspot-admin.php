<?php
/**
 * Admin dashboard: the top-level "PinSpot" menu, the React app, and the
 * settings REST endpoint.
 *
 * @package Pinspot
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers and renders the PinSpot admin app.
 */
final class Pinspot_Admin {

	const OPTION   = 'pinspot_settings';
	const REST_NS  = 'pinspot/v1';
	const CAP      = 'manage_options';
	const MENU_POS = 58;

	/**
	 * The admin page hook suffix, for scoping the asset enqueue.
	 *
	 * @var string
	 */
	private $hook = '';

	/**
	 * Wire hooks.
	 */
	public function __construct() {
		add_action( 'admin_menu', array( $this, 'register_menu' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue' ) );
		add_action( 'rest_api_init', array( $this, 'register_rest' ) );
		add_action( 'enqueue_block_editor_assets', array( $this, 'expose_settings_to_editor' ) );
		// Keep the PinSpot dashboard clean: suppress unrelated plugins' admin notices
		// on our own screen only (never site-wide). Fires just before notices render.
		add_action( 'in_admin_header', array( $this, 'silence_foreign_notices' ), 1000 );
	}

	/**
	 * Remove third-party admin notices on the PinSpot admin page so the dashboard
	 * stays focused. Scoped strictly to our screen — other admin pages are untouched.
	 *
	 * @return void
	 */
	public function silence_foreign_notices() {
		$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;
		if ( ! $screen || $this->hook === '' || $screen->id !== $this->hook ) {
			return;
		}
		remove_all_actions( 'admin_notices' );
		remove_all_actions( 'all_admin_notices' );
		remove_all_actions( 'user_admin_notices' );
	}

	/**
	 * Expose the saved defaults to the block editor so new blocks inherit them.
	 * Printed before wp-blocks so it is set before the block registers.
	 */
	public function expose_settings_to_editor() {
		wp_add_inline_script(
			'wp-blocks',
			'window.pinspotSettings = ' . wp_json_encode( $this->get_settings() ) . ';',
			'before'
		);
	}

	/**
	 * Default settings.
	 *
	 * @return array
	 */
	private function defaults() {
		return array(
			'defaultTrigger'      => 'click',
			'defaultTheme'        => 'light',
			'defaultMarkerColor'  => '#3a5df0',
			'defaultTooltipWidth' => 280,
		);
	}

	/**
	 * Current, sanitized settings.
	 *
	 * @return array
	 */
	public function get_settings() {
		$saved = get_option( self::OPTION, array() );
		return $this->sanitize_settings( is_array( $saved ) ? $saved : array() );
	}

	/**
	 * Sanitize a settings array against the schema.
	 *
	 * @param array $input Raw settings.
	 * @return array
	 */
	private function sanitize_settings( $input ) {
		$defaults = $this->defaults();
		$out      = $defaults;

		if ( isset( $input['defaultTrigger'] ) && in_array( $input['defaultTrigger'], array( 'click', 'hover' ), true ) ) {
			$out['defaultTrigger'] = $input['defaultTrigger'];
		}
		if ( isset( $input['defaultTheme'] ) && in_array( $input['defaultTheme'], array( 'light', 'dark' ), true ) ) {
			$out['defaultTheme'] = $input['defaultTheme'];
		}
		if ( isset( $input['defaultMarkerColor'] ) ) {
			$color = sanitize_hex_color( $input['defaultMarkerColor'] );
			if ( $color ) {
				$out['defaultMarkerColor'] = $color;
			}
		}
		if ( isset( $input['defaultTooltipWidth'] ) ) {
			// Clamp to the same range the block inspector allows.
			$width = (int) $input['defaultTooltipWidth'];
			if ( $width >= 180 && $width <= 480 ) {
				$out['defaultTooltipWidth'] = $width;
			}
		}

		return $out;
	}

	/**
	 * Register the top-level menu.
	 */
	public function register_menu() {
		$this->hook = add_menu_page(
			__( 'PinSpot', 'pinspot' ),
			__( 'PinSpot', 'pinspot' ),
			self::CAP,
			'pinspot',
			array( $this, 'render_page' ),
			'dashicons-location',
			self::MENU_POS
		);
	}

	/**
	 * Render the mount point for the React app.
	 */
	public function render_page() {
		echo '<div id="pinspot-admin-root" class="pinspot-admin-root"></div>';
	}

	/**
	 * Enqueue the app assets on the PinSpot admin page only.
	 *
	 * @param string $hook Current admin page hook.
	 */
	public function enqueue( $hook ) {
		if ( $hook !== $this->hook ) {
			return;
		}

		$asset_file = PINSPOT_DIR . 'build/admin.asset.php';
		if ( ! file_exists( $asset_file ) ) {
			return;
		}
		$asset = require $asset_file;

		wp_enqueue_script(
			'pinspot-admin',
			PINSPOT_URL . 'build/admin.js',
			$asset['dependencies'],
			$asset['version'],
			true
		);
		wp_enqueue_style( 'dashicons' );
		wp_enqueue_style(
			'pinspot-admin',
			PINSPOT_URL . 'build/admin.css',
			array( 'wp-components' ),
			$asset['version']
		);
		wp_set_script_translations( 'pinspot-admin', 'pinspot' );

		wp_localize_script( 'pinspot-admin', 'pinspotAdmin', $this->app_data() );
	}

	/**
	 * Data handed to the React app.
	 *
	 * @return array
	 */
	private function app_data() {
		/**
		 * Filter the storefront/pricing URL the dashboard links to. Defaults to the
		 * Freemius checkout for PinSpot Pro (product 40383, plan 69621); the checkout
		 * lets the buyer pick a site tier.
		 *
		 * @param string $url Upgrade URL.
		 */
		$upgrade = apply_filters( 'pinspot_upgrade_url', 'https://checkout.freemius.com/plugin/40383/plan/69621/' );

		/**
		 * Whether the dashboard shows PinSpot Pro advertising (feature list, plans,
		 * upgrade button, "Pro"/"Planned" block badges). Off until PinSpot Pro is
		 * publicly purchasable — advertising a product that cannot yet be bought
		 * frustrates users and breaches WordPress.org's upsell guidance. Flip the
		 * default to true (or return true from this filter) when Pro goes live.
		 *
		 * @param bool $show Whether to show Pro advertising.
		 */
		$show_pro = (bool) apply_filters( 'pinspot_show_pro', true );

		return array(
			'version'   => PINSPOT_VERSION,
			'proActive' => function_exists( 'pinspot_is_pro_active' ) && pinspot_is_pro_active(),
			'showPro'   => $show_pro,
			'settings'  => $this->get_settings(),
			'stats'     => $this->stats(),
			'links'     => array(
				'upgrade' => esc_url( $upgrade ),
				'review'  => 'https://wordpress.org/support/plugin/pinspot/reviews/#new-post',
				'donate'  => 'https://wise.com/pay/me/mdrayhanu2',
				'support' => 'https://wordpress.org/support/plugin/pinspot/',
				'docs'    => 'https://wordpress.org/plugins/pinspot/',
				'newPost' => esc_url( admin_url( 'post-new.php?post_type=page' ) ),
			),
		);
	}

	/**
	 * Cheap overview stats.
	 *
	 * @return array
	 */
	private function stats() {
		global $wpdb;

		// Count published posts/pages whose content contains the block.
		$like = '%' . $wpdb->esc_like( 'wp:pinspot/image-hotspots' ) . '%';
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$in_use = (int) $wpdb->get_var(
			$wpdb->prepare(
				"SELECT COUNT(ID) FROM {$wpdb->posts} WHERE post_status = 'publish' AND post_content LIKE %s",
				$like
			)
		);

		return array(
			'blocksInUse'  => $in_use,
			'patterns'     => 3,
			'markerStyles' => 7,
		);
	}

	/**
	 * Register the settings REST route.
	 */
	public function register_rest() {
		register_rest_route(
			self::REST_NS,
			'/settings',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'rest_get' ),
					'permission_callback' => array( $this, 'rest_permission' ),
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'rest_save' ),
					'permission_callback' => array( $this, 'rest_permission' ),
				),
			)
		);
	}

	/**
	 * REST permission: administrators only.
	 *
	 * @return bool
	 */
	public function rest_permission() {
		return current_user_can( self::CAP );
	}

	/**
	 * GET /settings.
	 *
	 * @return WP_REST_Response
	 */
	public function rest_get() {
		return rest_ensure_response( $this->get_settings() );
	}

	/**
	 * POST /settings.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public function rest_save( $request ) {
		$clean = $this->sanitize_settings( (array) $request->get_json_params() );
		update_option( self::OPTION, $clean );
		return rest_ensure_response( $clean );
	}
}
