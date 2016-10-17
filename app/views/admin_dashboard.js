'use strict';

class AdminDashboardView extends BaseView {

  constructor() {
    super();

    this.title = "TourneyMan";
    this.template = "admin-dashboard";

    this.db = new PouchDB('events');

    this.model = {
    }

    this.events = {
      "click": {
        ".event_create": () => router.navigate("create_event"),
        ".user_list": () => router.navigate("list_users"),
        ".open_dev_tools": () => router.navigate("dev_tools"),
        ".logout": () => {
          window.user = null;
          router.navigate("login");
        },
        ".event_details": (el) => {
          let event_id = $(el.currentTarget).data('id');
          router.navigate("event_detail", {}, event_id);
        },
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
