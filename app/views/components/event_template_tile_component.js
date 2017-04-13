'use strict';

class EventTemplateTileComponentView extends BaseView {

  constructor(template_id) {
    super();

    this.title = "Event Tile";
    this.template = "event-template-tile-component";

    this.event_template = null;
    this.event_template_id = template_id;

    this.model = { 
      template: null,
      round_names: [],
      can_delete: false,
      can_register: false,
      is_registered: false,
      is_closed: false
    }

    this.events = {
      "click": {
        ".event_details": () => {
          router.navigate("event_detail", {}, this.event_id);
        },
        ".create_event": () => this.onCreateEventClicked(),
        ".template_delete": () => this.onDeleteTemplateClicked()
      }
    }
  }

  pre_render() {
    console.log("EventTemplateTileComponent::pre_render()");

    this.event_template = new EventTemplate();

    console.log("Fetching event template");
    this.event_template.fetch_by_id(this.event_template_id)
      .then( () => {
        this.model.template = this.event_template.to_view_model();
        this.model.round_names = this.event_template.get('round_names');

        this.model.can_modify = user.is_superuser();

        if(this.event_template.get('organizer_id') === user.get_id())
          this.model.can_modify = true;

        this.rebind_events();
      });
  }

  onCreateEventClicked() {
    console.log("onCreateEventClicked");

    let event = new Event();
    event.create_from_template(this.event_template).then( () => {
      router.navigate('event_detail', {}, event.get_id());
    });
  }

  onDeleteTemplateClicked() {
    console.log("onDeleteTemplateClicked");

    if(!this.model.can_modify) return; //perm guard

    router.open_dialog("delete_model", this.event_template);
    router.active_dialog.onClose = () => this.remove_from_parent();
  }
}
