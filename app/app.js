'use strict';

window.$ = window.jQuery = require('jquery');

window.app = {
  Router: Router,
  BaseView: BaseView,
  HomeView: HomeView,
  MainMenuView: MainMenuView,
  CreateEventView: CreateEventView
}

$(function() {
  console.log("Hello World!");

  window.router = new Router();

  router.navigate("home");

});
