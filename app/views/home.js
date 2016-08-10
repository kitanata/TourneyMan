'use strict';

class HomeView extends BaseView {

  constructor() {
    super();

    this.title = "TourneyMan";
    this.template = "home";

    this.db = new PouchDB('events');

    this.db.allDocs({include_docs: true}).then(
      (result) => {
        this.model.events = _.map(result.rows, (x) => x.doc);
        this.rebind_events();
      }
    ).catch(
      (err) => console.log(err)
    );

    this.model = {
      node_version: process.versions.node,
      chrome_version: process.versions.chrome,
      electron_version: process.versions.electron
    }

    this.menu = {
      "create_event": "Setup an Event"
    }

    this.events = {
      "click": {
        ".event_details": (el) => this.onEventClicked(el),
      }
    }
  }

  onEventClicked(el) {
    console.log("Event Clicked");
    let event_id = $(el.currentTarget).data('id');

    router.navigate("event_detail", event_id);
  }
}
