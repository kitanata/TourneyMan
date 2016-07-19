class AppRouter extends Backbone.Router {
  constructor(options) {
    super();

    this.routes = {
      "": "main"
    };
  }

  main() {
    console.log("Hello World!");
  }
}
