describe("A Basic View", function() {

  beforeEach(function() {
    this.subject = new app.BaseView();
  });

  it("should have a title", function() {
    expect(this.subject.title).not.toBeUndefined();
  });

  it("should have a template", function() {
    expect(this.subject.template).not.toBeUndefined();
  });

  it("should have a default container to the content div", function() {
    expect(this.subject.container).toEqual("#content");
  });

  it("should have a model", function() {
    expect(this.subject.model).not.toBeUndefined();
  });

  it("should have a binding view", function() {
    expect(this.subject.view).not.toBeUndefined();
  });

  it("should be able to return it's DOM element", function() {
    affix('#test-el');
    affix('#template .inner-div');

    this.subject.container = '#test-el';
    this.subject.template = "template";
    this.subject.render();

    expect(this.subject.get_element()).toEqual($("#test-el"));
  });

  describe("when we render to the screen", function() {
    it("should add the template to the container div in the dom", function() {
      affix('#not-content');
      affix('#template .inner-div');

      expect($('#not-content')).toBeInDOM(); //sanity check

      this.subject.container = "#not-content";
      this.subject.template = "template";
      this.subject.render();

      expect($('#not-content')).toContainElement('div.inner-div');
    });

    it("should bind the view model with the dom", function() {
      affix('#not-content');

      spyOn(rivets, 'bind');

      this.subject.container = "#not-content";
      this.subject.template = "template";
      this.subject.render();

      expect(rivets.bind).toHaveBeenCalledWith($("#not-content"), this.subject.model);
    });

    it("should bind all specified events", function() {
      affix('#not-content');

      var templ = affix('#template');
      templ.affix('#some-el');
      templ.affix('#some-other-el');

      var num_calls = 0;
      var dummy_func = function() {
        num_calls += 1;
      };

      this.subject.container = "#not-content";
      this.subject.template = "template";

      this.subject.events = {
        'click' : {
          '#some-el' : function() { num_calls +=1; },
          '#some-other-el': function() { num_calls += 2}
        }
      }

      this.subject.render();

      $('#not-content #some-el').click();
      $('#not-content #some-other-el').click();
      $('#not-content #some-other-el').click();

      expect(num_calls).toEqual(5);
    });

  });

  describe("when the view is unloaded from the dom", function() {
    it("should no longer respond to events", function() {
      affix('#not-content');

      var templ = affix('#template');
      templ.affix('#some-el');
      templ.affix('#some-other-el');

      var num_calls = 0;
      var dummy_func = function() {
        num_calls += 1;
      };

      this.subject.template = "template";
      this.subject.container = "#not-content";

      this.subject.events = {
        'click' : {
          '#some-el' : function() { num_calls +=1; },
          '#some-other-el': function() { num_calls += 2}
        }
      }

      this.subject.render();
      this.subject.unload();

      $('#not-content #some-el').click();
      $('#not-content #some-other-el').click();
      $('#not-content #some-other-el').click();

      expect(num_calls).toEqual(0);
    });

    it("should no longer bind to the model", function() {
      affix('#content');

      this.subject.template = "template";

      this.subject.render();

      var int_view = this.subject.view;

      spyOn(int_view, 'unbind');

      this.subject.unload();

      expect(int_view.unbind).toHaveBeenCalled();
      expect(this.subject.view).toBeNull();
    });
  });

  it("shouldn't blow up just because it was told to unload", function() {
    this.subject.unload();
  });


});
