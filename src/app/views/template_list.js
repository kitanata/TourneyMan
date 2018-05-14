'use strict';

import BaseView from '../framework/base_view';

import { EventTemplates } from '../models/event_template';
import { TournamentTemplates } from '../models/tournament_template';

import EventTemplateTileComponentView from './components/event_template_tile_component';
import TournamentTemplateTileComponentView from './components/tournament_template_tile_component';

export default class TemplateListView extends BaseView {

  constructor() {
    super();

    this.title = "TourneyMan";
    this.template = "template-list";

    this.model = {
      is_superuser: user.is_superuser(),
      has_tournament_templates: false,
      has_event_templates: false
    }

    this.event_template_set = null;
    this.tournament_template_set = null;

    this.events = {
      "click": {
        ".on-close": () => router.navigate("back"),
        ".tournament_create": () => router.navigate("create_tournament")
      }
    }
  }

  async pre_render() {
    router.menu_view.set_active_menu('templates');

    this.event_template_set = new EventTemplates();
    this.tournament_template_set = new TournamentTemplates();

    if(user.is_superuser()) {
      await this.event_template_set.all();
      await this.tournament_template_set.all();
    }
    else {
      await this.event_template_set.fetch_where({
          'organizer_id': user.get_id()
      });
      
      await this.tournament_template_set.fetch_where({
        'organizer_id': user.get_id()
      });
    }
    
    this.model.has_tournament_templates = this.tournament_template_set.count() > 0;
    this.model.has_event_templates = this.event_template_set.count() > 0;
    this.rebind_events();
    this.build_child_views();
    this.render_children();
  }

  build_child_views() {
    for(let e of this.event_template_set.models) {
      let tile_comp = new EventTemplateTileComponentView(e.get_id());

      this.add_child_view('.event-template-tiles', tile_comp);
    }

    for(let t of this.tournament_template_set.models) {
      let tile_comp = new TournamentTemplateTileComponentView(t.get_id());

      this.add_child_view('.tournament-template-tiles', tile_comp);
    }
  }

}
