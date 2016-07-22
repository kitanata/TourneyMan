describe("A Router", function() {

  beforeEach(function() {
    this.subject = new app.Router();
  });

  it("should have a list of routes", function() {
    expect(this.subject.routes).not.toBeUndefined();
  });

  it("should have an active view", function() {
    expect(this.subject.active_view).not.toBeUndefined();
  });

  describe("When we navigate to a different view", function() {
    beforeEach(function() {
      this.subject.routes = {
        "main_menu": app.MainMenuView,
        "create_event": app.CreateEventView
      }

      this.subject.navigate('main_menu');

      expect(this.subject.active_view).toEqual(jasmine.any(app.MainMenuView));
    });

    it("should load the correct view", function() {
      this.subject.navigate("create_event");

      expect(this.subject.active_view).toEqual(jasmine.any(app.CreateEventView));
    });

    it("should unload the current view", function() {
      var active_view = this.subject.active_view;

      spyOn(active_view, 'unload');

      this.subject.navigate("create_event");

      expect(active_view.unload).toHaveBeenCalled();
    });

    it("should render the new view", function() {
      var dummy_view = new app.MainMenuView();

      spyOn(dummy_view, "render");

      spyOn(this.subject, "_get_view_for_viewname").and.returnValue(dummy_view);

      this.subject.navigate("create_event");

      expect(dummy_view.render).toHaveBeenCalled();
    });

  });

});
