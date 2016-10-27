import util from './util';

const component = {};  //Consider moving to core/_core.js  to normalize

component.create = function (parent, scope, props, events) {
  //We set the primary scope properties
  const $scope = scope;
  $scope.parent = parent;
  $scope.properties = props;
  $scope.id = util.guid();
  $scope.selection = d3.select(parent)
    .append('div')
    .attr('id', `'div_'${scope.id}`)
    .style('width', '100%')
    .style('height', '100%');
  // Adding our dispatch event that the viz will use for any attached callbacks.
  const args = [];
  // Interaction events
  args.push('mouseover');
  args.push('mouseout');
  args.push('mousedown');
  args.push('click');
  args.push('dblclick');
  args.push('touch');
  args.push('zoom');
  args.push('zoomstart');
  args.push('zoomend');

  //Core events
  args.push('initialize');
  args.push('validate');
  args.push('measure');
  args.push('update');

  // Property (from the 'props' array) '_change' events
  // This way anyone can listen for any specific (like data) viz property changes
  Object.getOwnPropertyNames(props).forEach(function (val) {
    args.push(`${val}_change`);
  });
  // Add any custom events that the component may need.
  if (events && events.length > 0) {
    events.forEach(function (d) {
      args.push(d);
    });
  }
  // Sets up all of our dispatch calls by attaching a d3.dispatch to the scope variable
  // For more info on dispatch, see here: https://github.com/mbostock/d3/wiki/Internals#d3_dispatch
  $scope.dispatch = d3.dispatch.apply(this, args);
  //This is our primary constructor that sets all properties
  const $component = function () {
    setProps($component, scope, scope.properties);
    return $component;
  };


  //For each property in our 'props' array create a callback if the property value has changed.
  setProps = function (com, s, p) {
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

  // This is the unique id for the component - most components use this in
  // createing a unique DOM element id.
  component.id = function () {
    return scope.id;
  };

  // This returns the DIV element unique to the component and created at instantiation
  component.selection = function () {
    return scope.selection;
  };

  // This function is used to bind all callbacks to any events emitted by the dispatch object
  component.on = function (event, listener) {
    $scope.dispatch.on(event, listener);
    return component;
  };

  // This function validates that all object properties have been set
  // Typically it is called each time the component calls its 'measure' function.
  component.validate = function () {
    const invalid = [];
    Object.getOwnPropertyNames(props).forEach(function (val) {
      if (!scope[val] && Number(scope[val] !== 0)) {
        invalid.push(val);
      }
    });
    if (invalid.length > 0) {
      throw new Error(`${util.component.validate()}:invalid.concat()need to be declared`);
    }
    //We disptach a 'validate' event so we can hook in callbacks before other work is done.
    scope.dispatch.validate();
  };
  //Attach our component to the disptach object so we have it later on any event
  $scope.dispatch.component = $component();

  //Return our finished component.
  return $scope.dispatch.component;
};
export default component;
