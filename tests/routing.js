// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
// ========================================================================
// Em.routes Base Tests
// ========================================================================
/*globals module test ok isObj equals expects */

var router;

Em.routes.wantsHistory = YES;

module('Em.routes setup');

test('Setup', function() {
  equals(Em.routes._didSetup, NO, 'Em.routes should not have been setup yet');
});

module('Em.routes setup', {

  setup: function() {
    router = Em.Object.create({
      route: function() {
        return;
      }
    });
    Em.run(function() {
      Em.routes.add('foo', router, router.route);
    });
  }

});

test('Setup', function() {
  equals(Em.routes._didSetup, YES, 'Em.routes should have been setup');
});

test('Initial route', function() {
  equals(Em.routes.get('location'), '', 'Initial route is an empty string');
});

module('Em.routes._Route', {

  setup: function() {
    Em.routes._firstRoute = null;
    router = Em.Object.create({
      route: function() {
        return;
      }
    });
  }

});

test('Route tree', function() {
  var r = Em.routes._Route.create(),
      abc = ['a', 'b', 'c'],
      abd = ['a', 'b', 'd'],
      abe = ['a', 'b', ':e'],
      fs = ['f', '*foo'],
      a, b, c, d, e, s, p;

  r.add(abc, router, router.route);
  r.add(abd, router, router.route);
  r.add(abe, router, router.route);
  r.add(fs, router, router.route);

  a = r.staticRoutes.a;
  ok(a, 'There should be a staticRoutes tree for a');
  ok(!a.target, 'A node should not have a target');
  ok(!a.method, 'A node should not have a method');

  b = a.staticRoutes.b;
  ok(b, 'There should be a staticRoutes tree for b');
  ok(!b.target, 'A node should not have a target');
  ok(!b.method, 'A node should not have a method');

  c = b.staticRoutes.c;
  ok(c, 'There should be a staticRoutes tree for c');
  equals(c.target, router, 'A leaf should have a target');
  equals(c.method, router.route, 'A leaf should have a method');

  d = b.staticRoutes.d;
  ok(d, 'There should be a staticRoutes tree for d');
  equals(d.target, router, 'A leaf should have a target');
  equals(d.method, router.route, 'A leaf should have a method');

  e = b.dynamicRoutes.e;
  ok(e, 'There should be a dynamicRoutes tree for e');
  equals(d.target, router, 'A leaf should have a target');
  equals(d.method, router.route, 'A leaf should have a method');

  s = r.staticRoutes.f.wildcardRoutes.foo;
  ok(s, 'There should be a wildcardRoutes tree for f');

  equals(r.routeForParts(['a'], {}), null, 'routeForParts should return null for non existant routes');
  equals(r.routeForParts(['a', 'b'], {}), null, 'routeForParts should return null for non existant routes');
  equals(r.routeForParts(abc, {}), c, 'routeForParts should return the correct route for a/b/c');

  equals(r.routeForParts(abd, {}), d, 'routeForParts should return the correct route for a/b/d');

  abe[2] = 'foo';
  p = {};
  equals(r.routeForParts(abe, p), e, 'routeForParts should return the correct route for a/b/:e');
  equals(p.e, 'foo', 'routeForParts should return the params for a/b/:e');

  p = {};
  equals(r.routeForParts(['f', 'double', 'double', 'toil', 'and', 'trouble'], p), s, 'routeForParts should return the correct route for f/*foo');
  equals(p.foo, 'double/double/toil/and/trouble', 'routeForParts should return the params for f/*foo');
});

module('Em.routes location', {

  setup: function() {
    Em.routes._firstRoute = null
  },

  teardown: function() {
    Em.routes.set('location', null);
  }

});

var routeWorks = function(route, name) {
  stop();

  Em.routes.set('location', route);
  equals(Em.routes.get('location'), route, name + ' route has been set');

  setTimeout(function() {
    equals(Em.routes.get('location'), route, name + ' route is still the same');
    start();
  }, 300);
};

test('Null route', function() {
  Em.routes.set('location', null);
  equals(Em.routes.get('location'), '', 'Null route is the empty string');
});

test('Simple route', function() {
  routeWorks('sixty-six', 'simple');
});

test('UTF-8 route', function() {
  routeWorks('éàçùß€', 'UTF-8');
});

test('Already escaped route', function() {
  routeWorks('%C3%A9%C3%A0%20%C3%A7%C3%B9%20%C3%9F%E2%82%AC', 'already escaped');
});

module('Em.routes defined routes', {

  setup: function() {
    Em.routes._firstRoute = null;
    router = Em.Object.create({
      params: null,
      triggered: NO,
      route: function(params) {
        this.set('params', params);
      },
      triggerRoute: function() {
        this.triggered = YES;
      }
    });
  },

  teardown: function() {
    Em.routes.set('location', null);
  }

});

test('setting location triggers function when only passed function', function() {
  var barred = false;

  Em.routes.add('bar', function(params) {
    barred = true;
  });
  Em.routes.set('location', 'bar');

  ok(barred, 'Function was called');
});

test('setting location simply triggers route', function() {
  Em.routes.add("foo", router, "triggerRoute");
  Em.routes.set('location', 'bar');
  ok(!router.triggered, "Router not triggered with nonexistent route.");

  Em.routes.set('location', 'foo');
  ok(router.triggered, "Router triggered.");
});

test('calling trigger() triggers current location (again)', function() {
  Em.routes.add("foo", router, "triggerRoute");
  Em.routes.set('location', 'foo');
  ok(router.triggered, "Router triggered first time.");
  router.triggered = NO;

  Em.routes.trigger();
  ok(router.triggered, "Router triggered (again).");
});

test('A mix of static, dynamic and wildcard route', function() {
  stop();

  var timer = setTimeout(function() {
    ok(false, 'Route change was not notified within 2 seconds');
    start();
  }, 2000);

  router.addObserver('params', function() {
    router.removeObserver('params', this);
    same(router.get('params'), { controller: 'users', action: 'éàçùß€', id: '5', witches: 'double/double/toil/and/trouble' });
    clearTimeout(timer);
    start();
  });

  Em.routes.add('foo/:controller/:action/bar/:id/*witches', router, router.route);
  Em.routes.set('location', 'foo/users/éàçùß€/bar/5/double/double/toil/and/trouble');
});

test('Route with parameters defined in a string', function() {
  stop();

  var timer = setTimeout(function() {
    ok(false, 'Route change was not notified within 2 seconds');
    start();
  }, 2000);

  router.addObserver('params', function() {
    router.removeObserver('params', this);
    same(router.get('params'), { cuisine: 'french', party: '4', url: '' });
    clearTimeout(timer);
    start();
  });

  Em.routes.add('*url', router, router.route);
  Em.routes.set('location', '?cuisine=french&party=4');
});

test('Route with parameters defined in a hash', function() {
  stop();

  var timer = setTimeout(function() {
    ok(false, 'Route change was not notified within 2 seconds');
    start();
  }, 2000);

  router.addObserver('params', function() {
    router.removeObserver('params', this);
    same(router.get('params'), { cuisine: 'french', party: '4', url: '' });
    clearTimeout(timer);
    start();
  });

  Em.routes.add('*url', router, router.route);
  Em.routes.set('location', { cuisine: 'french', party: '4' });
});

test('A mix of everything', function() {
  stop();

  var timer = setTimeout(function() {
    ok(false, 'Route change was not notified within 2 seconds');
    start();
  }, 2000);

  router.addObserver('params', function() {
    router.removeObserver('params', this);
    same(router.get('params'), { controller: 'users', action: 'éàçùß€', id: '5', witches: 'double/double/toil/and/trouble', cuisine: 'french', party: '4' });
    clearTimeout(timer);
    start();
  });

  Em.routes.add('foo/:controller/:action/bar/:id/*witches', router, router.route);
  Em.routes.set('location', 'foo/users/éàçùß€/bar/5/double/double/toil/and/trouble?cuisine=french&party=4');
});

test('calling exists() returns whether the route is defined or not', function() {
  equal(Em.routes.exists('foo'), false, 'Route /foo should not exist');

  Em.routes.add("foo", router, "triggerRoute");

  equal(Em.routes.exists('foo'), true, 'Route /foo should exist');
  equal(Em.routes.exists('bar'), false, 'Route /bar should not exist');

});

module('Em.routes location observing', {

  setup: function() {
    Em.routes._firstRoute = null;

    router = Em.Object.create({
      hasBeenNotified: NO,
      route: function(params) {
        this.set('hasBeenNotified', YES);
      }
    });
  },

  teardown: function() {
    Em.routes.set('location', null);
  }

});

test('Location change', function() {
  if (!Em.routes.get('usesHistory')) {
    stop();

    var timer = setTimeout(function() {
      ok(false, 'Route change was not notified within 2 seconds');
      start();
    }, 2000);

    router.addObserver('hasBeenNotified', function() {
      clearTimeout(timer);
      equals(router.get('hasBeenNotified'), YES, 'router should have been notified');
      start();
    });

    Em.routes.add('foo', router, router.route);
    window.location.hash = 'foo';
  }
});

module('_extractParametersAndRoute');

test('_extractParametersAndRoute with ? syntax', function() {
  same(Em.routes._extractParametersAndRoute({ route: 'videos/5?format=h264' }),
       { route: 'videos/5', params:'?format=h264', format: 'h264' },
       'route parameters should be correctly extracted');

  same(Em.routes._extractParametersAndRoute({ route: 'videos/5?format=h264&size=small' }),
       { route: 'videos/5', params:'?format=h264&size=small', format: 'h264', size: 'small' },
       'route parameters should be correctly extracted');

  same(Em.routes._extractParametersAndRoute({ route: 'videos/5?format=h264&size=small', format: 'ogg' }),
       { route: 'videos/5', params:'?format=ogg&size=small', format: 'ogg', size: 'small' },
       'route parameters should be extracted and overwritten');

  same(Em.routes._extractParametersAndRoute({ route: 'videos/5', format: 'h264', size: 'small' }),
       { route: 'videos/5', params:'?format=h264&size=small', format: 'h264', size: 'small' },
       'route should be well formatted with the given parameters');

  same(Em.routes._extractParametersAndRoute({ format: 'h264', size: 'small' }),
       { route: '', params:'?format=h264&size=small', format: 'h264', size: 'small' },
       'route should be well formatted with the given parameters even if there is no initial route');
});

test('_extractParametersAndRoute with & syntax', function() {
  same(Em.routes._extractParametersAndRoute({ route: 'videos/5&format=h264' }),
       { route: 'videos/5', params:'&format=h264', format: 'h264' },
       'route parameters should be correctly extracted');

  same(Em.routes._extractParametersAndRoute({ route: 'videos/5&format=h264&size=small' }),
       { route: 'videos/5', params:'&format=h264&size=small', format: 'h264', size: 'small' },
       'route parameters should be correctly extracted');

  same(Em.routes._extractParametersAndRoute({ route: 'videos/5&format=h264&size=small', format: 'ogg' }),
       { route: 'videos/5', params:'&format=ogg&size=small', format: 'ogg', size: 'small' },
       'route parameters should be extracted and overwritten');
});
