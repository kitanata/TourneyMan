'use strict';

import $ from 'jquery';
import numeral from 'numeral';

import BaseView from '../framework/base_view';
import Global from '../framework/global';
import logger from '../framework/logger';

import { User, Users } from '../models/user';
import { Event } from '../models/event';
import { Round } from '../models/round';
import { EventTemplate } from '../models/event_template';

import EventService from '../services/event_service';

export default class EventDetailView extends BaseView {

  constructor(event_id) {
    super();

    this.title = "Event Details";
    this.template = "event-detail";

    this.event = null;
    this.event_id = event_id;

    this.model = {
      'is_superuser': false,
      'can_modify': false,
      'organizer': {},
      'event': {},
      'players': [],
      'rounds': [],
      'ranks': [],
      'round_name': "",
      'quick_reg': {
        'player_name': "",
        'player_email': ""
      },
      'last_quick_reg_player_name': null
    }

    this.events = {
      "click": {
        ".event_list": () => router.navigate("event_list"),
        ".user_list": () => router.navigate("list_users"),
        ".open_admin": () => router.navigate("admin"),
        ".my_profile": () => this.onMyProfileClicked(),
        ".logout": () => {
          Global.instance().user = null;
          router.navigate("login");
        },
        ".publish-event": (el) => this.onPublishEventClicked(el),
        ".unpublish-event": (el) => this.onUnpublishEventClicked(el),
        ".convert-event": (el) => this.onConvertEventClicked(el),
        ".start-event": (el) => this.onStartEventClicked(el),
        ".cancel-event": (el) => this.onCancelEventClicked(el),
        ".event-edit": () => {
          if(!this.model.can_modify) return; //perm guard
          router.navigate("create_event", {}, this.event_id);
        },
        ".delete-event": () => {
          if(!this.model.can_modify) return; //perm guard
          router.open_dialog("delete_model", () => {
            return this.event.destroy();
          }, () => {
            router.navigate("event_list");
          });
        },
        ".quick-reg-player": (el) => this.onQuickRegPlayer(el),
        ".round-create": (el) => this.onRoundCreateClicked(el),
        ".round-start": (el) => this.onRoundStartClicked(el),
        ".round-finish": (el) => this.onRoundFinishClicked(el),
        ".round-details": (el) => this.onRoundDetailsClicked(el),
        ".round-remove": (el) => this.onRoundRemoveClicked(el),
        ".remove-all-players": (el) => this.onRemoveAllPlayersClicked(el),
        ".invite-players": (el) => this.onInvitePlayersClicked(el),
        ".remove-player": (el) => this.onRemovePlayerClicked(el),
        ".on-close": () => router.navigate("back")
      }
    }
  }

  async pre_render() {
    logger.info("EventDetail::pre_render()");
    const service = new EventService();
    const user = Global.instance().user;

    router.menu_view.set_active_menu('events');

    this.event = new Event();

    logger.debug("Fetching event");
    await this.event.fetch_by_id(this.event_id);

    this.model.event = this.event.to_view_model();
    this.model.players = [];
    this.model.rounds = [];
    this.model.ranks = [];

    await this.event.fetch_related();

    for(let r of this.event.ranks.models) {
      await r.fetch_related_model('player');
    }

    this.model.players = this.event.players.to_view_models();
    this.model.rounds = this.event.rounds.to_view_models();
    this.model.organizer = this.event.organizer.to_view_model();

    this.model.is_superuser = user.is_superuser();
    this.model.can_modify = user.is_superuser();
    if(this.event.organizer.get_id() === user.get_id())
      this.model.can_modify = true;

    this.model.ranks = await service.get_ordered_ranks(this.event);

    for(let [i, r] of this.model.ranks.entries()) {
      r.rank = numeral(i + 1).format('0o');
    }

    this.update();
  }
  
  async onQuickRegPlayer(el) {
    if(!this.model.can_modify) return; //perm guard

    const name = this.model.quick_reg.player_name;
    const email = this.model.quick_reg.player_email;

    const users = new Users();
      
    await users.fetch_where({
      'email': email
    });

    let user = null;

    if(users.models.length === 0) {
      user = new User();
      await user.register(name, email, user.generate_random_password());
    } else {
      user = users.models[0];
    }

    const ev_service = new EventService();
    await ev_service.register_player(this.event, user);

    this.model.last_quick_reg_player_name = name;

    this.render();
  }

  async onRoundCreateClicked(el) {
    if(!this.model.can_modify) return; //perm guard

    let new_round = new Round();

    new_round.create();
    new_round.set('name', this.model.round_name);

    const event_service = new EventService();
    await event_service.add_round(this.event, new_round);

    await this.event.fetch_related_set('rounds');

    this.model.round_name = "";
    this.model.rounds = this.event.rounds.to_view_models();

    this.render();
  }

  async onRoundRemoveClicked(el) {
    if(!this.model.can_modify) return; //perm guard

    let round_id = $(el.currentTarget).data('id');

    let round = this.event.rounds.get_by_id(round_id);
    await round.destroy();

    await this.event.update();
    await this.event.fetch_related_set('rounds');

    this.model.event = this.event.to_view_model();
    this.model.rounds = this.event.rounds.to_view_models();

    this.render();
  }


  async onRoundStartClicked(el) {
    if(!this.model.can_modify) return; //perm guard

    let round_id = $(el.currentTarget).data('id');

    let round = new Round();
    await round.fetch_by_id(round_id);

    round.set('started', true);
    await round.save();

    await this.event.fetch_related_set('rounds');

    this.model.rounds = this.event.rounds.to_view_models();
    this.rebind_events();
  }

  async onRoundFinishClicked(el) {
    if(!this.model.can_modify) return; //perm guard

    let round_id = $(el.currentTarget).data('id');

    let round = new Round();
    await round.fetch_by_id(round_id);
    if(round.get('started'))
      round.set('finished', true)

    await round.save();
    await this.event.fetch_related_set('rounds');

    this.model.rounds = this.event.rounds.to_view_models();
    this.rebind_events();
  }

  onRoundDetailsClicked(el) {
    let round_id = $(el.currentTarget).data('id');

    router.navigate("round_detail", {}, round_id);
  }

  async onPublishEventClicked(el) {
    if(!this.model.can_modify) return; //perm guard

    this.event.set('published', true);
    await this.event.save();
    this.render();
  }
  
  async onUnpublishEventClicked(el) {
    if(!this.model.can_modify) return; //perm guard

    this.event.set('published', false);
    await this.event.save();
    this.render();
  }

  async onConvertEventClicked(el) {
    if(!this.model.can_modify) return; //perm guard

    let event_template = new EventTemplate();
    event_template.create();

    const p = async () => {
      await event_template.from_unpublished_event(this.event);
      await event_template.save();

      const global = Global.instance();

      global.user.add_related_to_set('event_templates', event_template);
      await global.user.save();
      return this.event.destroy();
    };

    router.open_dialog('progress_dialog', "Converting the event.", p, () => {
      router.navigate('template_list', {replace: true});
    });
  }

  async onStartEventClicked(el) {
    if(!this.model.can_modify) return; //perm guard

    const service = new EventService();
    service.start_event(this.event);

    await this.event.fetch_related_set('ranks');
    this.model.event = this.event.to_view_model();
    this.model.ranks = this.event.ranks.to_view_models();

    this.render();
  }

  async onCancelEventClicked(el) {
    if(!this.model.can_modify) return; //perm guard

    const ev_service = new EventService();

    router.open_dialog('progress_dialog', "Cancelling the event.", async () => {
      return ev_service.cancel_event(this.event);
    }, () => {
      this.model.event = this.event.to_view_model();
      this.model.rounds = this.event.rounds.to_view_models();
      this.model.ranks = this.event.ranks.to_view_models();

      this.render();
    });
  }


  async onRemoveAllPlayersClicked(el) {
    logger.info("EventDetail::onRemoveAllPlayersClicked");

    const ev_service = new EventService();
    await ev_service.remove_all_players(this.event);

    this.render();
  }

  onInvitePlayersClicked(el) {
    logger.info("EventDetail::onInvitePlayersClicked");

    router.open_dialog('invite_players_dialog', this.event, () => {
      this.render();
    });
  }

  async onRemovePlayerClicked(el) {
    logger.info("EventDetail::onRemovePlayerClicked");

    let ev_service = new EventService();

    let player_id = $(el.currentTarget).data('id')
    let player = new User();

    await player.fetch_by_id(player_id);
    await ev_service.remove_player(this.event, player);
    this.render();
  }
}
