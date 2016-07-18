'use strict';

(function (app) {
  app.AppComponent = ng.core.Component({
    selector: 'my-app',
    template: '<h1>My First Angular 2 App</h1>'
  }).Class({
    constructor: function constructor() {}
  });
})(window.app || (window.app = {}));
'use strict';

(function (app) {
  document.addEventListener('DOMContentLoaded', function () {
    ng.platformBrowserDynamic.bootstrap(app.AppComponent);
  });
})(window.app || (window.app = {}));
//# sourceMappingURL=all.js.map
