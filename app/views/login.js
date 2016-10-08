'use strict';

class LoginView extends BaseView {

  constructor() {
    super();

    this.title = "TourneyMan";
    this.template = "login";

    this.db = new PouchDB('users');

    this.model = {
    }

    this.events = {
      "click": {
        ".register_button": (el) => this.onRegisterClicked(el),
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

  onRegisterClicked(el) {
    router.navigate("register", {replace: true});
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