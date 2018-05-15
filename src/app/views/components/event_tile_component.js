'use strict';

import BaseView from '../../framework/base_view';

import { Event } from '../../models/event';

import EventService from '../../services/event_service';

export default class EventTileComponentView extends BaseView {

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
        ".event_publish": () => this.onEventPublishClicked(),
        ".event_register": () => this.onEventRegisterClicked(),
        ".event_delete": () => this.onEventDeleteClicked()
      }
    }
  }

  async pre_render() {
    console.log("EventTileComponent::pre_render()");

    this.event = new Event();

    const service = new EventService();

    console.log("Fetching event");
    await this.event.fetch_by_id(this.event_id);
    this.model.event = this.event.to_view_model();
    this.model.num_rounds = this.event.count_related_set('rounds');
    this.model.num_players = this.event.count_related_set('players');

    this.model.is_registered = service.is_player_registered(this.event, user);
    this.model.is_published = this.event.get('published');
    this.model.can_register = this.event.get('published') && !this.event.get('started') && !this.model.is_registered;
    this.model.can_modify = user.is_superuser();

    this.model.is_closed = false;
    if(!this.model.can_register && !this.model.is_registered)
      this.model.is_closed = true;

    if(this.event.get('organizer_id') === user.get_id())
      this.model.can_modify = true;

    this.rebind_events();
  }

  onEventDeleteClicked() {
    console.log("onEventDeleteClicked");

    if(!this.model.can_modify) return; //perm guard

    router.open_dialog("delete_model", () => {
      return this.event.destroy();
    });
    router.active_dialog.onClose = () => this.remove_from_parent();
  }

  async onEventPublishClicked() {
    console.log("onEventPublishClicked");

    if(!this.model.can_modify) return; //perm guard

    this.event.set('published', true);
    await this.event.save();
    this.render();
  }

  async onEventRegisterClicked() {
    console.log("onEventRegisterClicked");

    if(!this.model.can_register) return; //perm guard

    await this.event.register_player(window.user);
    await this.event.fetch_related_model("tournament");
    await this.event.tournament.register_player(window.user);
    this.render();
  }
}
