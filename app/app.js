window.$ = window.jQuery = require('jquery');

$(function() {
    window.app = {
        views: {},
        models: {},
        collections: {},
        router: new AppRouter()
    }

    Backbone.history.start();
});
