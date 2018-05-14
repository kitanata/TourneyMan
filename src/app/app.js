'use strict';

import $ from 'jquery';
import Router from './router';
import MessageBus from './framework/message_bus';

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
  // eslint-disable-next-line
  window.eval = global.eval = function () {
    throw new Error(`Sorry, this app does not support window.eval().`)
  }
  
  window.router = new Router();
  window.messenger = new MessageBus();

  router.navigate("login");
});

