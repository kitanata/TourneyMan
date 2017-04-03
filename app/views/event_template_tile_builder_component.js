'use strict';

class EventTemplateTileBuilderComponentView extends BaseView {

  constructor(parent_view, template_id) {
    super();

    this.title = "Event Tile";
    this.template = "event-template-tile-builder-component";

    this.event_template = null;
    this.event_template_id = template_id;
    this.parent_view = parent_view;

    this.model = { 
      template: null,
      round_names: []
    }

    this.events = {
      "click": {
        ".select_event_template": () => {
          this.parent_view.onTemplateSelected(this.event_template);
        }
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
}
