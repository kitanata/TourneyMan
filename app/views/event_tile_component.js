'use strict';

class EventTileComponentView extends BaseView {

  constructor(event_id) {
    super();

    this.title = "Event Tile";
    this.template = "event-tile-component";

    this.event = null;
    this.event_id = event_id;

    this.model = { 
      event: null,
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
        ".event_register": () => this.onEventRegisterClicked(),
        ".event_delete": () => this.onEventDeleteClicked()
      }
    }
  }

  pre_render() {
    console.log("EventTileComponent::pre_render()");

    this.event = new Event();

    console.log("Fetching event");
    this.event.fetch_by_id(this.event_id)
      .then( () => {
        this.model.event = this.event.to_view_model();
        this.model.num_rounds = this.event.count_related_set('rounds');
        this.model.num_players = this.event.count_related_set('players');

        this.model.is_registered = this.event.is_player_registered(user);
        this.model.can_register = !this.event.get('started') && !this.model.is_registered;
        this.model.can_delete = user.is_superuser();

        this.model.is_closed = false;
        if(!this.model.can_register && !this.model.is_registered)
          this.model.is_closed = true;

        if(this.event.get('organizer_id') === user.get_id())
          this.model.can_delete = true;

        this.rebind_events();
      });
  }

  onEventDeleteClicked() {
    console.log("onEventDeleteClicked");

    if(!this.model.can_delete) return; //perm guard

    router.open_dialog("delete_event", this.event_id);
    router.active_dialog.onClose = () => this.remove_from_parent();
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
