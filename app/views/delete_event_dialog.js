'use strict';

class DeleteEventDialog extends DialogView {

  constructor(event_id) {
    super();

    this.title = "Delete Event";
    this.template = "delete-event-dialog";

    this.event_id = event_id;
    this.event = null;

    this.model = { 
      can_delete: false
    }

    this.events = {
      "click": {
        ".event_delete_confirm": () => this.onEventDeleteConfirmClicked()
      }
    }
  }

  pre_render() {
    console.log("DeleteEventDialog::pre_render()");

    this.event = new Event();
    this.event.fetch_by_id(this.event_id)
      .then( () => {
        this.model.can_delete = user.is_superuser();

        if(this.event.get('organizer_id') === user.get_id())
          this.model.can_delete = true;
      });
  }

  onEventDeleteConfirmClicked() {
    console.log("DeleteEventDialog::onEventDeleteConfirmClicked");
    console.log(this.event_id);

    if(!this.model.can_delete) return; //perm guard

    this.event.destroy()
      .then( () => {
        this.close();
      });
  }

}
