'use strict';

import DialogView from '../../framework/dialog_view';
import Global from '../../framework/global';

export default class InvitePlayersDialog extends DialogView {

  constructor(event, callback) {
    super();

    this.title = "Hey, there. I have a question...";
    this.template = "invite-players-dialog";

    this.event = event;
    this.callback = callback;

    this.selected_event_sources = [];

    this.model = { 
      event: this.event.to_view_model(),
      event_choices: [],
      method_chosen: false,
      source_chosen: false,
      process_chosen: false,
      search_name: "",
      searched_players: [],
      name_search_done: false,
      show_invite_amount: false,
      invite_amount: 8,
      method_is_events: false,
      method_is_tournaments: false,
      method_is_search_name: false,
      process: "BY_RANK"
    }

    this.events = {
      "click": {
        ".from-event": () => this.onFromEventClicked(),
        ".from-tournament": () => this.onFromTournamentClicked(),
        ".from-search-name": () => this.onFromSearchNameClicked(),
        ".select-event": (el) => this.onSelectEventClicked(el),
        ".sources-chosen": () => this.onSourcesChosenClicked(),
        ".begin-search-by-name": () => this.onBeginSearchByNameClicked(),
        ".invite-by-rank": () => this.onInviteByRankClicked(),
        ".invite-by-random": () => this.onInviteByRandomClicked(),
        ".invite-all": () => this.onInviteAllClicked(),
        ".invite-player": (el) => this.onInvitePlayerClicked(el),
        ".finalize-invites": () => this.onFinalizeInvitesClicked()
      }
    }
  }

  async pre_render() {
    console.log("InvitePlayersDialog::pre_render()");

    const global = Global.instance();

    await global.user.fetch_related();
      
    let organized_events = global.user.organized_events.filter( (e) => {
      return (e.get_id() !== this.event.get_id());
    });

    this.model.event_choices = organized_events.map( (e) => {
      let res = e.to_view_model();
      res.num_players = e.get('player_ids').length;
      res.num_rounds = e.get('round_ids').length;
      res.selected = false;

      return res;
    });

    this.rebind_events();
  }

  onFromEventClicked() {
    console.log("InvitePlayersDialog::onFromEventClicked");
    this.model.method_chosen = true;
    this.model.method_is_events = true;
  }

  onFromTournamentClicked() {
    console.log("InvitePlayersDialog::onFromTournamentClicked");
    console.log("TODO: NOT YET SUPPORTED!");
    this.model.method_chosen = true;
    this.model.method_is_tournaments = true;
  }

  onFromSearchNameClicked() {
    console.log("InvitePlayersDialog::onFromTournamentClicked");
    console.log("TODO: NOT YET SUPPORTED!");
    this.model.method_chosen = true;
    this.model.method_is_search_name = true;
  }

  onSelectEventClicked(el) {
    console.log("InvitePlayersDialog::onSelectEventClicked");
    let selected_id = $(el.currentTarget).data('id');

    let choice = _.find(this.model.event_choices, (x) => {
      return (x._id === selected_id);
    });

    if(choice.selected) {
      choice.selected = false;

      _.remove(this.selected_event_sources, (x) => {
        return (x === selected_id);
      });
    } else {
      choice.selected = true;

      this.selected_event_sources.push(selected_id);
    }
  }

  onSourcesChosenClicked() {
    console.log("InvitePlayersDialog::onSourcesChosenClicked");

    this.model.source_chosen = true;
  }

  async onBeginSearchByNameClicked() {
    console.log("InvitePlayersDialog::onBeginSearchByNameClicked");

    let players = new Users();
    let pattern = new RegExp(".*" + this.model.search_name + ".*", "gi");

    await players.fetch_where({
      name: {
        $regex: pattern
      }
    });
    
    this.model.searched_players = players.to_view_models();
    this.model.name_search_done = true;
    this.rebind_events();
  }

  onInviteByRankClicked() {
    console.log("InvitePlayersDialog::onInviteByRankClicked");

    this.model.process_chosen = true;
    this.model.show_invite_amount = true;
    this.model.process = "BY_RANK";
  }

  onInviteByRandomClicked() {
    console.log("InvitePlayersDialog::onInviteByRandomClicked");

    this.model.process_chosen = true;
    this.model.show_invite_amount = true;
    this.model.process = "RANDOM";
  }

  onInviteAllClicked() {
    console.log("InvitePlayersDialog::onInviteAllClicked");

    this.model.process_chosen = true;
    this.model.show_invite_amount = false;
    this.model.process = "ALL";
  }

  async onFinalizeInvitesClicked() {
    console.log("InvitePlayersDialog::onFinalizeInvitesClicked");
    console.log(this.model.invite_amount);
    console.log(this.model.process);
    console.log(this.selected_event_sources);

    let invite_from = Global.instance().user.organized_events.filter( (e) => {
      return _.includes(this.selected_event_sources, e.get_id());
    });

    let player_ids_to_invite = []
    let cur_player_ids = this.event.get('player_ids');

    if(this.model.process === "ALL") {
      for(let e of invite_from.models) {
        player_ids_to_invite = _.union(player_ids_to_invite, e.get('player_ids'));
      }
    } 
    else if(this.model.process === "RANDOM") {
      let all_player_ids = [];

      for(let e of invite_from.models) {
        all_player_ids = _.union(all_player_ids, e.get('player_ids'));
      }

      player_ids_to_invite = _.take(chance.shuffle(_.union(all_player_ids)), this.model.invite_amount);

    } else if(this.model.process === "BY_RANK") {

      let all_player_ranks = [];

      for(let e of invite_from.models) {
        await e.fetch_related_set('ranks');

        for(let r of e.ranks.models) {
          await r.fetch_related_model('player');
        }

        all_player_ranks = _.union(all_player_ranks, e.get_ordered_ranks());
      }

      let ordered_ranks = this.event.order_rank_models(all_player_ranks);

      let new_ids = ordered_ranks.map( (r) => {
        return r.player_id;
      });

      player_ids_to_invite = _.take(_.union(new_ids), this.model.invite_amount);
    }

    let players = new Users();

    await this.start_progress("Inviting Players...");
    await players.fetch_by_ids(player_ids_to_invite);

    for(let player of players) {
      await this.event.register_player(player);
      await this.event.tournament.register_player(player);
    }

    this.get_element().find('.progress-text').text("Finished");
    this.finish_progress();

    this.close();
    this.callback();
  }
  
  async onInvitePlayerClicked(el) {
    let player_id = $(el.currentTarget).data('id');

    let player = new User();

    await this.start_progress("Inviting Player...");
    await player.fetch_by_id(player_id);
    await this.event.register_player(player);

    this.get_element().find('.progress-text').text("Finished");
    this.finish_progress();

    this.close();
    this.callback();
  }
}
