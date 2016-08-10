'use strict';

if(window.$ === undefined)
  window.$ = window.jQuery = require('jquery');

window.app = {
  Router: Router,
  BaseView: BaseView,
  HomeView: HomeView,
  MainMenuView: MainMenuView,
  CreateEventView: CreateEventView
}

$(function() {
  window.router = new Router();

  router.navigate("home");
});
