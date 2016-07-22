"use strict";

import rivets from 'rivets';

window.rivets = rivets;
window.$ = window.jQuery = require('jquery');
window._ = require('lodash');

class BaseView {

  constructor() {
    this.template = "";
    this.model = {};
    this.view = null;
  }

  render() {
    $("#content").html($(`#${this.template}`).html());

    this.view = rivets.bind($("#content"), this.model);

    this._bind_events();
  }

  unload() {
    if(!this.view) return;

    this._unbind_events();
    this.view.unbind();
    this.view = null;
  }

  _bind_events() {
    _.forIn(this.events, function(bindings, ev) {
      _.forIn(bindings, function(action, el) {
        $(el).on(ev, action);
      });
    });
  }

  _unbind_events() {
    _.forIn(this.events, function(bindings, ev) {
      _.forIn(bindings, function(action, el) {
        $(el).off(ev, action);
      });
    });
  }
}
