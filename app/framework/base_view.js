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

    this.modals = {};
  }

  get_element() {
    return $(this.container);
  }

  render() {
    $(this.container).html($(`#${this.template}`).html());

    this.view = rivets.bind($(this.container), this.model);

    this.pre_render();
    this._bind_events();
    this.post_render();
  }

  unload() {
    if(!this.view) return;

    for(let sel in this.modals)
      $(".reveal-overlay").remove();

    this.modals = {};

    this._unbind_events();
    this.view.unbind();
    this.view = null;
  }

  rebind_events() {
    this._unbind_events();
    this._bind_events();
  }

  pre_render() {}

  post_render() {}

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

  create_modal(selector) {
    if(this.modals[selector]) return;

    let new_modal = new Foundation.Reveal($(selector), {});

    this.modals[selector] = new_modal;
  }
}
