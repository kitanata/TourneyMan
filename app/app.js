'use strict';

window.$ = window.jQuery = require('jquery');

$(function() {
  console.log("Hello World!");

  window.router = new Router();

  router.navigate("main_menu");

});
