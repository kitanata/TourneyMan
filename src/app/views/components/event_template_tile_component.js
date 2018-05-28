'use strict';

import BaseView from '../../framework/base_view';
import Global from '../../framework/global';
import logger from '../../framework/logger';

import { Event } from '../../models/event';
import { EventTemplate } from '../../models/event_Template';

import EventService from '../../services/event_service';

export default class EventTemplateTileComponentView extends BaseView {

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

  async pre_render() {
    logger.info("EventTemplateTileComponent::pre_render()");

    this.event_template = new EventTemplate();

    logger.info("Fetching event template");
    await this.event_template.fetch_by_id(this.event_template_id);

    this.model.template = this.event_template.to_view_model();
    this.model.round_names = this.event_template.get('round_names');

    const user = Global.instance().user;

    this.model.can_modify = user.is_superuser();

    if(this.event_template.get('organizer_id') === user.get_id())
      this.model.can_modify = true;
  }

  async onCreateEventClicked() {
    logger.info("onCreateEventClicked");

    const service = new EventService();
    const event = await service.create_from_template(this.event_template);

    router.navigate('event_detail', {}, event.get_id());
  }

  onDeleteTemplateClicked() {
    logger.info("onDeleteTemplateClicked");

    if(!this.model.can_modify) return; //perm guard

    router.open_dialog("delete_model", () => {
      this.remove_from_parent();
      return this.event_template.destroy();
    });
  }
}
