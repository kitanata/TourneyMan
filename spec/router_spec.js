describe("A Router", function() {

  beforeEach(function() {
    this.subject = new app.Router();
  });

  it("should have a list of routes", function() {
    expect(this.subject.routes).not.toBeUndefined();
  });

});

/*class Router {

  constructor() {
    this.active_view = null;

    this.routes = {
      "main_menu": MainMenuView,
      "create_event": CreateEventView
    }
  }

  navigate(view_name) {
    console.log(`Navigate called with ${view_name}`);

    let view_cls = this.routes[view_name];

    if(this.active_view)
      this.active_view.unload();

    this.active_view = new view_cls();

    this.active_view.render()
  }
}*/
