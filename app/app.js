'use strict';

if(window.$ === undefined)
  window.$ = window.jQuery = require('jquery');

PouchDB.plugin(require('pouchdb-find'));

window.app = {
  Router: Router,
  BaseView: BaseView,
  LoginView: LoginView,
  RegisterView: RegisterView,
  AdminDashboardView: AdminDashboardView,
  MainMenuView: MainMenuView,
  CreateEventView: CreateEventView
}

function slugify(text)
{
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

$(function() {
  window.router = new Router();

  router.navigate("login");
});
