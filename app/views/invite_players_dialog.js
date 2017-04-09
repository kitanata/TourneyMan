'use strict';

class InvitePlayersDialog extends DialogView {

  constructor(event, callback) {
    super();

    this.title = "Hey, there. I have a question...";
    this.template = "invite-players-dialog";

    this.event = event;
    this.callback = callback;

    this.model = { 
      event: this.event.to_view_model(),
      event_choices: [],
      method_chosen: false,
      source_chosen: false,
      process_chosen: false,
      method_is_events: false,
      method_is_tournaments: false,
      process: "BY_RANK"
    }

    this.events = {
      "click": {
        ".from-event": () => this.onFromEventClicked(),
        ".from-tournament": () => this.onFromTournamentClicked(),
        ".select-event": (el) => this.onSelectEventClicked(el),
        ".invite-from-selected-events": () => this.onInviteFromSelectedEventsClicked(),
        ".ok-button": () => this.onOkClicked()
      }
    }
  }

  pre_render() {
    console.log("InvitePlayersDialog::pre_render()");

    window.user.fetch_related().then( () => {
      this.model.event_choices = window.user.events.map( (e) => {
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

    choice.selected = !choice.selected;
  }

  onInviteFromSelectedEventsClicked() {
    console.log("InvitePlayersDialog::onInviteFromSelectedEventsClicked");
  }

  onOkClicked() {
    console.log("InvitePlayersDialog::onOkClicked");

    let value = this.get_element().find('input').val();

    this.callback(value);
  }
}
