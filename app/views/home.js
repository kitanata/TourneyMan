'use strict';

class HomeView extends BaseView {

  constructor() {
    super();

    this.title = "TourneyMan";
    this.template = "home";

    this.db = new PouchDB('events');

    this.model = {
    }

    this.menu = {
      "Create an Event": "create_event",
      "Player Registration": "list_players",
      "Dev Tools": "dev_tools"
    }

    this.events = {
      "click": {
        ".event_details": (el) => this.onEventClicked(el),
        ".event_delete": (el) => this.onEventDeleteClicked(el),
        ".event_delete_confirm": (el) => this.onEventDeleteConfirmClicked(el)
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

  onEventClicked(el) {
    let event_id = $(el.currentTarget).data('id');

    router.navigate("event_detail", event_id);
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
