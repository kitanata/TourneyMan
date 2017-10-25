'use strict';

class EventDetailView extends BaseView {

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
    }

    this.events = {
      "click": {
        ".event_list": () => router.navigate("event_list"),
        ".user_list": () => router.navigate("list_users"),
        ".open_admin": () => router.navigate("admin"),
        ".my_profile": () => this.onMyProfileClicked(),
        ".logout": () => {
          window.user = null;
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
    console.log("EventDetail::pre_render()");
    router.menu_view.set_active_menu('events');

    this.event = new Event();

    console.log("Fetching event");
    await this.event.fetch_by_id(this.event_id);

    this.model.event = this.event.to_view_model();
    this.model.players = [];
    this.model.rounds = [];
    this.model.ranks = [];

    await this.event.fetch_related();

    for(let r of this.event.ranks) {
      await r.fetch_related_model('player');
    }

    this.model.players = this.event.players.to_view_models();
    this.model.rounds = this.event.rounds.to_view_models();
    this.model.organizer = this.event.organizer.to_view_model();

    this.model.is_superuser = user.is_superuser();
    this.model.can_modify = user.is_superuser();
    if(this.event.organizer.get_id() === user.get_id())
      this.model.can_modify = true;

    this.model.ranks = this.event.get_ordered_ranks();

    for(let [i, r] of this.model.ranks.entries()) {
      r.rank = numeral(i + 1).format('0o');
    }

    this.update();
    this.rebind_events();
  }

  async onRoundCreateClicked(el) {
    if(!this.model.can_modify) return; //perm guard

    let new_round = new Round();

    new_round.create();
    new_round.set('name', this.model.round_name);
    new_round.event = this.event;

    await new_round.save();
    this.event.add_related_to_set('rounds', new_round);

    await this.event.save();
    await this.event.fetch_related_set('rounds');

    this.model.round_name = "";
    this.model.rounds = this.event.rounds.to_view_models();

    this.rebind_events();
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

    this.rebind_events();
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

    await event_template.from_unpublished_event(this.event);
    await event_template.save();

    window.user.add_related_to_set('event_templates', event_template);
    await window.user.save();
    await this.event.destroy();

    router.open_dialog('progress_dialog', "Converting the event.", p, () => {
      router.navigate('template_list', {replace: true});
    });
  }

  async onStartEventClicked(el) {
    if(!this.model.can_modify) return; //perm guard

    this.event.set('started', true);

    await this.event.save();
    await this.event.fetch_related_set('ranks');
    this.model.event = this.event.to_view_model();
    this.model.ranks = this.event.ranks.to_view_models();

    this.render();
  }

  async onCancelEventClicked(el) {
    if(!this.model.can_modify) return; //perm guard

    let players = new Users(this.event.players.models.slice(0));

    await this.event.destroy_related_set('ranks');
    await this.event.remove_all_players();

    for(let r of this.event.rounds.models) {
      await r.destroy_related_set('tables');
      await r.update();
      r.set('started', false);
      r.set('seated', false);
      r.set('finished', false);

      await r.save();
    }

    await this.event.update();

    for(let p of players.models) {
      await p.update();
      let new_rank = new Rank();

      new_rank.create();
      new_rank.event = this.event;
      new_rank.player = p;

      this.event.add_related_to_set('players', p);
      this.event.add_related_to_set('ranks', new_rank);

      await new_rank.save();

      p.add_related_to_set('events', this.event);
      await p.save();
    }

    this.event.set('started', false);
    await this.event.save();
    await this.event.fetch_related();

    this.model.event = this.event.to_view_model();
    this.model.rounds = this.event.rounds.to_view_models();
    this.model.ranks = this.event.ranks.to_view_models();

    this.render();

    router.open_dialog('progress_dialog', "Cancelling the event.", p);
  }


  async onRemoveAllPlayersClicked(el) {
    console.log("EventDetail::onRemoveAllPlayersClicked");

    await this.event.remove_all_players();
    this.render();
  }

  onInvitePlayersClicked(el) {
    console.log("EventDetail::onInvitePlayersClicked");

    router.open_dialog('invite_players_dialog', this.event, () => {
      this.render();
    });
  }

  async onRemovePlayerClicked(el) {
    console.log("EventDetail::onRemovePlayerClicked");

    let player_id = $(el.currentTarget).data('id')
    let player = new User();

    await player.fetch_by_id(player_id);
    await this.event.remove_player(player);
    this.render();
  }
}
