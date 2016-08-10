'use strict';

class EventDetailView extends BaseView {

  constructor(event_id) {
    super();

    this.db = new PouchDB('events');

    this.title = "Event Details";
    this.template = "event-detail";

    this.event_id = event_id;

    this.db.get(event_id).then(
      (result) => {
        this.model = result;
        console.log(this.model);
        this.rebind_events();
      }
    ).catch(
      (err) => console.log(err)
    );

    this.menu = {
      "home": "Back"
    }
  }
}
