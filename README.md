Ember Routing
------------------

Em.routes manages the browser location. You can change the hash part of the
current location. The following code

```javascript
Em.routes.set('location', 'notes/edit/4');
```

will change the location to http://domain.tld/my_app#notes/edit/4. Adding
routes will register a handler that will be called whenever the location
changes and matches the route:

```javascript
Em.routes.add(':controller/:action/:id', MyApp, MyApp.route);
```

You can pass additional parameters in the location hash that will be relayed
to the route handler:

```javascript
Em.routes.set('location', 'notes/show/4?format=xml&language=fr');
```

The syntax for the location hash is described in the location property
documentation, and the syntax for adding handlers is described in the
add method documentation.

Browsers keep track of the locations in their history, so when the user
presses the 'back' or 'forward' button, the location is changed, Em.route
catches it and calls your handler. Except for Internet Explorer versions 7
and earlier, which do not modify the history stack when the location hash
changes.

Em.routes also supports HTML5 history, which uses a '/' instead of a '#'
in the URLs, so that all your website's URLs are consistent.
