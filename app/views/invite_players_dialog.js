'use strict';

class InvitePlayersDialog extends DialogView {

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
      show_invite_amount: false,
      invite_amount: 8,
      method_is_events: false,
      method_is_tournaments: false,
      process: "BY_RANK"
    }

    this.events = {
      "click": {
        ".from-event": () => this.onFromEventClicked(),
        ".from-tournament": () => this.onFromTournamentClicked(),
        ".select-event": (el) => this.onSelectEventClicked(el),
        ".sources-chosen": () => this.onSourcesChosenClicked(),
        ".invite-by-rank": () => this.onInviteByRankClicked(),
        ".invite-by-random": () => this.onInviteByRandomClicked(),
        ".invite-all": () => this.onInviteAllClicked(),
        ".finalize-invites": () => this.onFinalizeInvitesClicked(),
        ".ok-button": () => this.onOkClicked()
      }
    }
  }

  pre_render() {
    console.log("InvitePlayersDialog::pre_render()");

    window.user.fetch_related().then( () => {
      let organized_events = window.user.organized_events.filter( (e) => {
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
    });
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
    this.model.process = "ALL";
  }

  onFinalizeInvitesClicked() {
    console.log("InvitePlayersDialog::onFinalizeInvitesClicked");
    console.log(this.model.invite_amount);
    console.log(this.model.process);
    console.log(this.selected_event_sources);
  }

  onOkClicked() {
    console.log("InvitePlayersDialog::onOkClicked");

    let value = this.get_element().find('input').val();

    this.callback(value);
  }
}
