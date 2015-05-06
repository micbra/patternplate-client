'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRouter = require('react-router');

var _navigationTree = require('./navigation-tree');

var _navigationTree2 = _interopRequireDefault(_navigationTree);

var Navigation = (function (_React$Component) {
	function Navigation() {
		_classCallCheck(this, Navigation);

		if (_React$Component != null) {
			_React$Component.apply(this, arguments);
		}

		this.displayName = 'Navigation';
	}

	_inherits(Navigation, _React$Component);

	_createClass(Navigation, [{
		key: 'render',
		value: function render() {
			return _react2['default'].createElement(
				'nav',
				{ className: 'navigation' },
				_react2['default'].createElement(
					_navigationTree2['default'],
					{ data: this.props.navigation, path: this.props.path, config: this.props.config },
					_react2['default'].createElement(
						'li',
						{ className: 'navigation-item', key: 'root' },
						_react2['default'].createElement(
							_reactRouter.Link,
							{ to: '/' },
							'Home'
						)
					)
				)
			);
		}
	}]);

	return Navigation;
})(_react2['default'].Component);

exports['default'] = Navigation;
module.exports = exports['default'];