class AppRouter extends Backbone.Router {
  constructor(options) {
    super();

    this.routes = {
      "": "main"
    };
  }

  help() {
  }
}

window.router = new AppRouter();
