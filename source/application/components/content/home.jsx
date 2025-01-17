import React from 'react';
import {RouteHandler} from 'react-router';

import Messages from './messages';

class Home extends React.Component {
	displayName = 'Home';

	render () {
		let readme = this.props.schema.readme || '';
		return (
			<main className="content home">
				<div className="markdown" dangerouslySetInnerHTML={{'__html': readme}} />
				<Messages eventEmitter={this.props.eventEmitter} messages={this.props.messages} />
			</main>
		);
	}
}

export default Home;
