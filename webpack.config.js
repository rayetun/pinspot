/**
 * Extends the default @wordpress/scripts webpack config to add the admin
 * dashboard app (src/admin) as a second script entry.
 *
 * With --experimental-modules the default export is an ARRAY of configs
 * (a scripts config and a module config for viewScriptModule). We add the
 * admin entry only to the scripts config and leave the module build alone.
 */
const path = require( 'path' );
const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );

const addAdmin = ( config ) => {
	const baseEntry =
		typeof config.entry === 'function' ? config.entry() : config.entry;
	return {
		...config,
		entry: {
			...baseEntry,
			admin: path.resolve( process.cwd(), 'src', 'admin', 'index.js' ),
		},
	};
};

const isModuleConfig = ( config ) =>
	Boolean( config.experiments && config.experiments.outputModule ) ||
	Boolean( config.output && config.output.module );

module.exports = Array.isArray( defaultConfig )
	? defaultConfig.map( ( config ) =>
			isModuleConfig( config ) ? config : addAdmin( config )
	  )
	: addAdmin( defaultConfig );
