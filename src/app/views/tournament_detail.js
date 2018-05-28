'use strict';

import BaseView from '../framework/base_view';
import Global from '../framework/global';
import logger from '../framework/logger';

import { Tournament } from '../models/tournament';
import { Event } from '../models/event';

export default class TournamentDetailView extends BaseView {

  constructor(tournament_id) {
    super();

    this.title = "Tournament Details";
    this.template = "tournament-detail";

    this.tournament = null;
    this.tournament_id = tournament_id;
    this.event_set = null;

    this.model = {
      'is_superuser': false,
      'can_modify': false,
      'event_templates': [],
      'organizer': {},
      'tournament': {}
    }

    this.events = {
      "click": {
        ".publish-tournament": (el) => this.onPublishTournamentClicked(el),
        ".unpublish-tournament": (el) => this.onUnpublishTournamentClicked(el),
        ".select-event-template": (el) => this.onSelectEventTemplateClicked(el),
        ".event-create": (el) => this.onCreateEventClicked(el),
        ".edit-tournament": () => {
          if(!this.model.can_modify) return; //perm guard
          router.navigate("create_tournament", {}, this.tournament_id);
        },
        ".delete-tournament": () => {
          if(!this.model.can_modify) return; //perm guard
          router.open_dialog("delete_model", () => {
            return this.tournament.destroy();
          }, () => {
            router.navigate("tournament_list");
          });
        },
        ".on-close": () => router.navigate("back")
      }
    }
  }

  async pre_render() {
    logger.info("TournamentDetail::pre_render()");
    router.menu_view.set_active_menu('tournaments');

    this.tournament = new Tournament();
    const user = Global.instance().user;

    logger.info("Fetching tournament");
    await this.tournament.fetch_by_id(this.tournament_id);
    this.model.tournament = this.tournament.to_view_model();
    this.model.players = [];
    this.model.ranks = [];

    await this.tournament.fetch_related();
    //this.model.players = this.tournament.players.to_view_models();
    this.event_set = this.tournament.events;

    this.model.organizer = this.tournament.organizer.to_view_model();
    this.model.is_superuser = user.is_superuser();
    this.model.can_modify = user.is_superuser();

    if(this.tournament.organizer.get_id() !== user.get_id()) {
      this.event_set = this.event_set.filter((e) => {
        return (e.published === true);
      });
    } else {
      this.model.can_modify = true;
    }

    const global = Global.instance();
    await global.user.fetch_related();
    this.model.event_templates = global.user.event_templates.to_view_models();
    this.update();
    this.build_child_views();
  }

  build_child_views() {
    for(let e of this.event_set.models) {
      let event_tile_comp = new EventTileComponentView(e.get_id());

      this.add_child_view('.tiles', event_tile_comp);
    }
  }
  
  onSelectEventTemplateClicked(el) {
    if(!this.model.can_modify) return; //perm guard

    if($(el.currentTarget).hasClass('selected')) {
      $(el.currentTarget).removeClass('selected')
    }
    else {
      $('.select-event-template').removeClass('selected');
      $(el.currentTarget).addClass('selected');
    }
  }

  async onCreateEventClicked(el) {
    if(!this.model.can_modify) return; //perm guard

    let templ = this.get_element().find('.select-event-template.selected');
    let templ_id = templ.data('id');

    let event = new Event();
    let event_template = Global.instance().user.event_templates.find( (x) => {
      return (x.get_id() == templ_id);
    });

    await event.create_from_template(event_template);

    event.tournament = this.tournament;
    await event.save();

    this.tournament.add_related_to_set('events', event);
    await this.tournament.save();
    router.navigate('event_detail', {}, event.get_id());
  }

  async onPublishTournamentClicked(el) {
    if(!this.model.can_modify) return; //perm guard

    this.tournament.set('published', true);
    await this.tournament.save();
    this.render();
  }
  
  async onUnpublishTournamentClicked(el) {
    if(!this.model.can_modify) return; //perm guard

    this.tournament.set('published', false);
    await this.tournament.save();
    this.render();
  }
}
