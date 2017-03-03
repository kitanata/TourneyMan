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
        ".event_publish": () => this.onEventPublishClicked(),
        ".event_register": () => this.onEventRegisterClicked(),
        ".event_delete": () => this.onEventDeleteClicked()
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
        this.model.num_rounds = this.event_template.get('round_names').length;

        this.model.can_modify = user.is_superuser();

        if(this.event_template.get('organizer_id') === user.get_id())
          this.model.can_modify = true;

        this.rebind_events();
      });
  }

  onEventDeleteClicked() {
    console.log("onEventDeleteClicked");

    if(!this.model.can_modify) return; //perm guard

    router.open_dialog("delete_event", this.event_template_id);
    router.active_dialog.onClose = () => this.remove_from_parent();
  }

  onEventPublishClicked() {
    console.log("onEventPublishClicked");

    if(!this.model.can_modify) return; //perm guard

    this.event.set('published', true);
    this.event.save()
      .then( () => {
        this.render();
      });
  }

  onEventRegisterClicked() {
    console.log("onEventRegisterClicked");

    if(!this.model.can_register) return; //perm guard

    this.event.add_related_to_set('players', window.user);
    this.event.save()
      .then( () => {
        this.render();
      });
  }
}
