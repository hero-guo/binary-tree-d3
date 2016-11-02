import {uniq, concat, set} from 'lodash';
import util from './util';

const component = {};  //Consider moving to core/_core.js  to normalize

component.create = function (parent, scope, props, events, opt = {}) {
  set(props, 'margin', {
    ...props.margin,
    ...opt.margin
  });
  console.log(opt, props);

  //We set the primary scope properties
  const $scope = scope;
  $scope.parent = parent;
  $scope.properties = props;
  $scope.id = util.guid();
  $scope.selection = d3.select(parent)
    .append('div')
    .attr('id', `'div_'${$scope.id}`);
  const args = uniq(concat([
    'mouseover',
    'mouseout',
    'mousedown',
    'click',
    'zoom',
    'drag',
    //Core events
    'initialize',
    'validate',
    'measure',
    'update'
  ], events));
  Object.getOwnPropertyNames(props).forEach(function (val) {
    args.push(`${val}_change`);
  });
  $scope.dispatch = d3.dispatch.apply(this, args);
  const setProps = function (com, s, p) {
    const $s = s;
    const $com = com;
    Object.getOwnPropertyNames(p).forEach(function (val) {
      if (typeof ($s[val]) === 'undefined') {
        $s[val] = p[val];
        $com[val] = function (_) {
          if (!arguments.length) {
            return $s[val];
          }
          const oldVal = $s[val];
          $s[val] = _;
          if ($s[val] !== oldVal) {
            $s.dispatch[`${val}_change`].apply(this, [$s[val], oldVal]);
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
    const invalid = [];
    Object.getOwnPropertyNames(props).forEach(function (val) {
      if (!$scope[val] && Number($scope[val] !== 0)) {
        invalid.push(val);
      }
    });
    if (invalid.length > 0) {
      throw new Error(`${component.validate()}:invalid.concat()need to be declared`);
    }
    $scope.dispatch.validate();
  };
  component.scope = $scope;
  const $component = function () {
    setProps(component, $scope, $scope.properties);
    return component;
  };
  $scope.dispatch.component = $component();
  //Return our finished component.
  return $scope.dispatch.component;
};
export default component;
