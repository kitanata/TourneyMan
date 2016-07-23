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

  it("should have a menu view", function() {
    expect(this.subject.menu_view).not.toBeUndefined();
  });

  describe("When we navigate to a different view", function() {
    beforeEach(function() {
      this.subject.routes = {
        "home": app.HomeView,
        "create_event": app.CreateEventView
      }

      this.subject.navigate('home');

      expect(this.subject.active_view).toEqual(jasmine.any(app.HomeView));
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
      var dummy_view = new app.HomeView();

      spyOn(dummy_view, "render");

      spyOn(this.subject, "_get_view_for_viewname").and.returnValue(dummy_view);

      this.subject.navigate("create_event");

      expect(dummy_view.render).toHaveBeenCalled();
    });

    it("should update and render the menu", function() {
      spyOn(this.subject.menu_view, "update")
      spyOn(this.subject.menu_view, "render")

      var dummy_view = new app.HomeView();

      spyOn(this.subject, "_get_view_for_viewname").and.returnValue(dummy_view);

      this.subject.navigate("create_event");

      expect(this.subject.menu_view.update).toHaveBeenCalledWith(dummy_view);
      expect(this.subject.menu_view.render).toHaveBeenCalled();
    });
  });
});
