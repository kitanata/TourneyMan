"use strict";

import rivets from 'rivets';

window.$ = window.jQuery = require('jquery');

class BaseView {

  constructor() {
    this.template = "";
    this.model = {};
    this.view = null;

    this.initialize();
  }

  initialize() { }

  unload() {
    if(this.view) {
      this.view.unbind();
      this.view = null;
    }
  }

  render() {
    $("#content").html($(`#${this.template}`).html());

    this.view = rivets.bind($("#content"), this.model)
  }
}
