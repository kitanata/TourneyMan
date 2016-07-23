describe("The menu view", function() {

  beforeEach(function() {
    loadFixtures('main_menu.html');

    this.subject = new app.MainMenuView();
  });

  describe("when the menu is updated", function() {

    beforeEach(function() {
      affix("#menu-container");

      this.dummy_view = new app.MainMenuView();
    });

    it("should update the display title", function() {
      this.dummy_view.title = "Test Title";

      this.subject.update(this.dummy_view);
      this.subject.render();

      expect(this.subject.get_element().find('.title')).toContainText("Test Title");
    });

    it("should update the menu items", function() {
      this.dummy_view.menu = {
        'one': "One",
        'two': "Two",
        'three': "Three",
      }

      this.subject.update(this.dummy_view);
      this.subject.render();

      expect(this.subject.get_element().find('ul li #one')).toBeInDOM();
      expect(this.subject.get_element().find('ul li #two')).toBeInDOM();
      expect(this.subject.get_element().find('ul li #three')).toBeInDOM();
    });

    it("should bind the menu items to events which navigate to the appropriate view", function() {
      this.dummy_view.menu = {
        'one': "One",
        'two': "Two",
        'three': "Three",
      }

      this.subject.update(this.dummy_view);
      this.subject.render();

      window.router = new app.Router();

      spyOn(router, "navigate");

      this.subject.get_element().find('ul li #two').click();

      expect(router.navigate).toHaveBeenCalledWith('two');
    });
  });
});
