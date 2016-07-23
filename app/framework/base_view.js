"use strict";

import rivets from 'rivets';

window.rivets = rivets;
window.$ = window.jQuery = require('jquery');
window._ = require('lodash');

class BaseView {

  constructor() {
    this.title = "";
    this.template = "";
    this.container = "#content";
    this.model = {};
    this.view = null;
  }

  get_element() {
    return $(this.container);
  }

  render() {
    $(this.container).html($(`#${this.template}`).html());

    this.view = rivets.bind($(this.container), this.model);

    this._bind_events();
  }

  unload() {
    if(!this.view) return;

    this._unbind_events();
    this.view.unbind();
    this.view = null;
  }

  _bind_events() {
    let self = this;

    _.forIn(this.events, function(bindings, ev) {
      _.forIn(bindings, function(action, el) {
        self.get_element().find(el).on(ev, action);
      });
    });
  }

  _unbind_events() {
    let self = this;

    _.forIn(this.events, function(bindings, ev) {
      _.forIn(bindings, function(action, el) {
        self.get_element().find(el).off(ev, action);
      });
    });
  }
}
