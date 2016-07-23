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

  });

});
