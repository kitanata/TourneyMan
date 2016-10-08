'use strict';

class RegisterView extends BaseView {

  constructor() {
    super();

    this.title = "TourneyMan";
    this.template = "register";

    this.db = new PouchDB('users');

    this.model = {
    }

    this.events = {
      "click": {
        ".login_button": (el) => this.onLoginClicked(el),
      }
    }
  }

  pre_render() {
    this.db.allDocs({include_docs: true}).then(
      (result) => {
        this.model.events = _.map(result.rows, (x) => x.doc);
        this.rebind_events();
      }
    ).catch(
      (err) => console.log(err)
    );
  }

  post_render() {
    this.create_modal("#deleteEventConfirm")
  }

  onLoginClicked(el) {
    router.navigate("login", {replace: true});
  }

  onEventDeleteClicked(el) {
    let event_id = $(el.currentTarget).data('id');

    $(".event_delete_confirm").data('id', event_id);
    $("#deleteEventConfirm").foundation('open');
  }

  onEventDeleteConfirmClicked(el) {
    let event_id = $(el.currentTarget).data('id');

    let self = this;

    this.db.get(event_id).then(function(doc) {
      return self.db.remove(doc);
    }).then(function (result) {
      $("#deleteEventConfirm").foundation('close');
      self.render();
    }).catch(function (err) {
      console.log(err);
    });
  }
}
