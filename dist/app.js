"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AppRouter = function (_Backbone$Router) {
  _inherits(AppRouter, _Backbone$Router);

  function AppRouter(options) {
    _classCallCheck(this, AppRouter);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(AppRouter).call(this));

    _this.routes = {
      "": "main"
    };
    return _this;
  }

  _createClass(AppRouter, [{
    key: "main",
    value: function main() {
      console.log("Hello World!");
    }
  }]);

  return AppRouter;
}(Backbone.Router);
'use strict';

window.$ = window.jQuery = require('jquery');

$(function () {
    window.app = {
        views: {},
        models: {},
        collections: {},
        router: new AppRouter()
    };

    Backbone.history.start();
});
//# sourceMappingURL=app.js.map
