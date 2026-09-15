import { createRoot } from '@wordpress/element';
import App from './app';
import './admin.scss';

const mount = document.getElementById( 'pinspot-admin-root' );
if ( mount ) {
	createRoot( mount ).render( <App /> );
}
