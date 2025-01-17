import React from 'react';
import {RouteHandler} from 'react-router';

import Toolbar from './navigation/toolbar';
import Navigation from './navigation/index';

class Application extends React.Component {
	static displayName = 'Application';

	render () {
		return (
			<div className="application">
				<input type="checkbox" id="menu-state" className="menu-state" />
				<Toolbar {...this.props} />
				<Navigation {...this.props} />
				<RouteHandler {...this.props} />
			</div>
		);
	}
}

export default Application;
