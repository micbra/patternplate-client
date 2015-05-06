import React from 'react';
import {RouteHandler} from 'react-router';

import Messages from './messages';
import PatternSection from '../pattern/pattern-section';

class Content extends React.Component {
	render () {
		return (
			<main className="content">
				<PatternSection id={this.props.params.splat} data={this.props.patterns} eventEmitter={this.props.eventEmitter} />
				<Messages eventEmitter={this.props.eventEmitter} />
			</main>
		);
	}
}

export default Content;