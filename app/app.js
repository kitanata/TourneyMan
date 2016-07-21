'use strict';

import $ from 'jquery';

$(function() {
  console.log("Hello World!");

  window.router = new Router();

  window.router.navigate("main_menu");
});
