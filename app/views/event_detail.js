'use strict';

class EventDetailView extends BaseView {

  constructor(event_id) {
    super();

    this.title = "Event Details";
    this.template = "event-detail";

    this.event = null;
    this.event_id = event_id;

    this.model = {
      'organizer': {},
      'event': {},
      'players': [],
      'rounds': [],
      'ranks': [],
      'round_name': "",
    }

    this.events = {
      "click": {
        ".start-event": (el) => this.onStartEventClicked(el),
        ".cancel-event": (el) => this.onCancelEventClicked(el),
        ".event-rankings": () => {
          router.navigate("player_rankings", {}, this.event_id);
        },
        ".event-edit": () => {
          router.navigate("create_event", {}, this.event_id);
        },
        ".round-create": (el) => this.onRoundCreateClicked(el),
        ".round-start": (el) => this.onRoundStartClicked(el),
        ".round-finish": (el) => this.onRoundFinishClicked(el),
        ".round-details": (el) => this.onRoundDetailsClicked(el),
        ".round-remove": (el) => this.onRoundRemoveClicked(el),
        ".on-close": () => router.navigate("back")
      }
    }
  }

  pre_render() {
    console.log("EventDetail::pre_render()");

    this.event = new Event();

    console.log("Fetching event");
    this.event.fetch_by_id(this.event_id)
      .then( () => {
        this.model.event = this.event.to_view_model();
        this.model.players = [];
        this.model.rounds = [];
        this.model.ranks = [];

        return this.event.fetch_related();
      })
      .then( () => {
        this.model.players = this.event.players.to_view_models();
        this.model.rounds = this.event.rounds.to_view_models();
        this.model.ranks = this.event.ranks.to_view_models();
        this.model.organizer = this.event.organizer.to_view_model();

        this.rebind_events();
      })
      .catch((err) => console.log(err));
  }

  onRoundCreateClicked(el) {
    let new_round = new Round();

    new_round.create();
    new_round.set('name', this.model.round_name);
    new_round.set_related_model('event', this.event);

    new_round.save()
      .then( () => {
        this.event.add_related_by_id('round', new_round.get_id());

        return this.event.save();
      }).then( () => {
        return this.event.fetch_related_set('rounds', Rounds);
      }).then( () => {
        this.model.round_name = "";
        this.model.rounds = this.event.rounds.to_view_models();

        this.rebind_events();
      });
  }

  onRoundRemoveClicked(el) {
    let round_id = $(el.currentTarget).data('id');

    let round = new Round();
    round.fetch_by_id(round_id)
      .then( () => {
        return round.remove();
      })
      .then( () => {
        this.event.remove_related_by_id('round', round_id);

        return this.event.save();
      }).then( () => {
        return this.event.fetch_related_set('rounds', Rounds);
      }).then( () => {
        this.model.rounds = this.event.rounds.to_view_models();

        this.rebind_events();
      });
  }


  onRoundStartClicked(el) {
    let round_id = $(el.currentTarget).data('id');

    let round = new Round();
    round.fetch_by_id(round_id)
      .then( () => {
        round.set('started', true);

        return round.save();
      }).then( () => {
        return this.event.fetch_related_set('rounds', Rounds);
      }).then( () => {
        this.model.rounds = this.event.rounds.to_view_models();

        this.rebind_events();
      });
  }

  onRoundFinishClicked(el) {
    let round_id = $(el.currentTarget).data('id');

    let round = new Round();
    round.fetch_by_id(round_id)
      .then( () => {
        if(round.get('started'))
          round.set('finished', true)

        return round.save();
      }).then( () => {
        return this.event.fetch_related_set('rounds', Rounds);
      }).then( () => {
        this.model.rounds = this.event.rounds.to_view_models();

        this.rebind_events();
      });
  }

  onRoundDetailsClicked(el) {
    let round_id = $(el.currentTarget).data('id');

    router.navigate("round_detail", {}, round_id);
  }

  onStartEventClicked(el) {
    this.event.set('started', true);

    this.event.save()
      .then( () => {
        //after locking the event. Make sure we have all the players.
        this.event.fetch_related_set('players', Users);
      })
      .then( () => {
        let rank_promise = Promise.resolve(true);

        //Generate Ranks Here
        for(let player of this.event.players.models) {
          let new_rank = new Rank();

          new_rank.create();
          new_rank.set_related_model('event', this.event);
          new_rank.set_related_model('player', player);

          rank_promise = rank_promise.then(() => new_rank.save());
        }

        return rank_promise;
      })
      .then( () => {
        return this.event.fetch_related_set('ranks', Ranks);
      }).then( () => {
        this.model.event = this.event.to_view_model();
        this.model.ranks = this.event.ranks.to_view_models();

        this.update();
        this.rebind_events();
      });
  }

  onCancelEventClicked(el) {
    this.event.drop_related_set('ranks', Ranks)
      .then( () => {
        this.event.set('started', false);

        return this.event.save();
      }).then( () => {
        this.model.event = this.event.to_view_model();
        this.model.ranks = [];

        this.update();
        this.rebind_events();
      });
  }
}
