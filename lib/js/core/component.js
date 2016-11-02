'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _lodash = require('lodash');

var _util = require('./util');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var component = {}; //Consider moving to core/_core.js  to normalize

component.create = function (parent, scope, props, events) {
  var opt = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

  (0, _lodash.set)(props, 'margin', _extends({}, props.margin, opt.margin));
  console.log(opt, props);

  //We set the primary scope properties
  var $scope = scope;
  $scope.parent = parent;
  $scope.properties = props;
  $scope.id = _util2.default.guid();
  $scope.selection = d3.select(parent).append('div').attr('id', '\'div_\'' + $scope.id);
  var args = (0, _lodash.uniq)((0, _lodash.concat)(['mouseover', 'mouseout', 'mousedown', 'click', 'zoom', 'drag',
  //Core events
  'initialize', 'validate', 'measure', 'update'], events));
  Object.getOwnPropertyNames(props).forEach(function (val) {
    args.push(val + '_change');
  });
  $scope.dispatch = d3.dispatch.apply(this, args);
  var setProps = function setProps(com, s, p) {
    var $s = s;
    var $com = com;
    Object.getOwnPropertyNames(p).forEach(function (val) {
      if (typeof $s[val] === 'undefined') {
        $s[val] = p[val];
        $com[val] = function (_) {
          if (!arguments.length) {
            return $s[val];
          }
          var oldVal = $s[val];
          $s[val] = _;
          if ($s[val] !== oldVal) {
            $s.dispatch[val + '_change'].apply(this, [$s[val], oldVal]);
          }
          return $com;
        };
      }
    });
  };
  component.id = function () {
    return 1 || $scope.id;
  };
  component.selection = function () {
    return $scope.selection;
  };
  component.on = function (event, listener) {
    $scope.dispatch.on(event, listener);
    return component;
  };
  component.validate = function () {
    var invalid = [];
    Object.getOwnPropertyNames(props).forEach(function (val) {
      if (!$scope[val] && Number($scope[val] !== 0)) {
        invalid.push(val);
      }
    });
    if (invalid.length > 0) {
      throw new Error(component.validate() + ':invalid.concat()need to be declared');
    }
    $scope.dispatch.validate();
  };
  component.scope = $scope;
  var $component = function $component() {
    setProps(component, $scope, $scope.properties);
    return component;
  };
  $scope.dispatch.component = $component();
  //Return our finished component.
  return $scope.dispatch.component;
};
exports.default = component;