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
        return this.event.ranks.each( (r) => {
          return r.fetch_related_model('player');
        });
      })
      .then( () => {
        this.model.players = this.event.players.to_view_models();
        this.model.rounds = this.event.rounds.to_view_models();
        this.model.organizer = this.event.organizer.to_view_model();

        this.model.is_superuser = user.is_superuser();
        this.model.can_modify = user.is_superuser();
        if(this.event.organizer.get_id() === user.get_id())
          this.model.can_modify = true;

        return this.event.ranks.each( (r) => {
          let rm = r.to_view_model();
          console.log(r.player.get('name'));
          rm.player_name = r.player.get('name');
          rm.sum_score = _.sum(r.get('scores'));
          rm.sum_score_pcts = _.sum(r.get('score_pcts'));
          rm.sum_score_pcts = Math.round(rm.sum_score_pcts * 1000) / 1000;
          this.model.ranks.push(rm);
        });
      })
      .then( () => {
        console.log(this.model.ranks);

        let first_rank = this.event.get('first_rank_by');
        let second_rank = this.event.get('second_rank_by');
        let third_rank = this.event.get('third_rank_by');

        let orders = ['dropped'];
        let rank_bys = [first_rank, second_rank, third_rank];

        for(let rb of rank_bys) {
          if(rb == "WINS")
            orders.push('num_wins');
          else if(rb == "POINTS")
            orders.push('sum_score');
          else if(rb == "POINT_PCT")
            orders.push('sum_score_pcts');
        }

        this.model.ranks = _.orderBy(this.model.ranks, orders, ['asc', 'desc', 'desc', 'desc', 'desc']);

        for(let [i, r] of this.model.ranks.entries()) {
          r.rank = numeral(i + 1).format('0o');
        }

        this.update();
        this.rebind_events();
      });
  }

  onRoundCreateClicked(el) {
    if(!this.model.can_modify) return; //perm guard

    let new_round = new Round();

    new_round.create();
    new_round.set('name', this.model.round_name);
    new_round.event = this.event;

    new_round.save()
      .then( () => {
        this.event.add_related_to_set('rounds', new_round);

        return this.event.save();
      }).then( () => {
        return this.event.fetch_related_set('rounds');
      }).then( () => {
        this.model.round_name = "";
        this.model.rounds = this.event.rounds.to_view_models();

        this.rebind_events();
      });
  }

  onRoundRemoveClicked(el) {
    if(!this.model.can_modify) return; //perm guard

    let round_id = $(el.currentTarget).data('id');

    let round = this.event.rounds.get_by_id(round_id);
    return round.destroy()
      .then( () => {
        return this.event.update();
      })
      .then( () => {
        return this.event.fetch_related_set('rounds');
      })
      .then( () => {
        this.model.event = this.event.to_view_model();
        this.model.rounds = this.event.rounds.to_view_models();

        this.rebind_events();
      });
  }


  onRoundStartClicked(el) {
    if(!this.model.can_modify) return; //perm guard

    let round_id = $(el.currentTarget).data('id');

    let round = new Round();
    round.fetch_by_id(round_id)
      .then( () => {
        round.set('started', true);

        return round.save();
      }).then( () => {
        return this.event.fetch_related_set('rounds');
      }).then( () => {
        this.model.rounds = this.event.rounds.to_view_models();

        this.rebind_events();
      });
  }

  onRoundFinishClicked(el) {
    if(!this.model.can_modify) return; //perm guard

    let round_id = $(el.currentTarget).data('id');

    let round = new Round();
    round.fetch_by_id(round_id)
      .then( () => {
        if(round.get('started'))
          round.set('finished', true)

        return round.save();
      }).then( () => {
        return this.event.fetch_related_set('rounds');
      }).then( () => {
        this.model.rounds = this.event.rounds.to_view_models();

        this.rebind_events();
      });
  }

  onRoundDetailsClicked(el) {
    let round_id = $(el.currentTarget).data('id');

    router.navigate("round_detail", {}, round_id);
  }

  onPublishEventClicked(el) {
    if(!this.model.can_modify) return; //perm guard

    this.event.set('published', true);
    this.event.save()
      .then( () => {
        this.render();
      });
  }
  
  onUnpublishEventClicked(el) {
    if(!this.model.can_modify) return; //perm guard

    this.event.set('published', false);
    this.event.save()
      .then( () => {
        this.render();
      });
  }

  onConvertEventClicked(el) {
    if(!this.model.can_modify) return; //perm guard

    let event_template = new EventTemplate();
    event_template.from_unpublished_event(this.event);
    event_template.create();

    let event_template_id = event_template.get_id();

    let p = event_template.save()
      .then( () => {
        return this.event.destroy();
      });

    router.open_dialog('progress_dialog', "Converting the event.", p, () => {
      router.navigate('event_template_list', {replace: true});
    });
  }

  onStartEventClicked(el) {
    if(!this.model.can_modify) return; //perm guard

    this.event.set('started', true);

    //TODO: If there are less than 6 registered players
    // show an error message. A Tournement needs at least 6
    // players to work.

    this.event.save()
      .then( () => {
        //after locking the event. Make sure we have all the players.
        return this.event.fetch_related_set('players');
      })
      .then( () => {
        let rank_promise = Promise.resolve(true);

        //Generate Ranks Here
        for(let player of this.event.players.models) {
          let new_rank = new Rank();

          new_rank.create();
          new_rank.event = this.event;
          new_rank.player = player;

          this.event.add_related_to_set('ranks', new_rank);

          rank_promise = rank_promise
            .then(() => {
              return new_rank.save();
            });
        }

        return rank_promise;
      })
      .then( () => {
        return this.event.save();
      })
      .then( () => {
        return this.event.fetch_related_set('ranks');
      }).then( () => {
        this.model.event = this.event.to_view_model();
        this.model.ranks = this.event.ranks.to_view_models();

        this.render();
      });
  }

  onCancelEventClicked(el) {
    if(!this.model.can_modify) return; //perm guard

    let p = this.event.destroy_related_set('ranks')
      .then( () => {
        return this.event.rounds.each( (r) => {
          r.destroy_related_set('tables')
            .then( () => {
              r.set('started', false);
              r.set('seated', false);
              r.set('finished', false);

              return r.save();
            });
        });
      })
      .then( () => {
        return this.event.update();
      })
      .then( () => {
        this.event.set('started', false);

        return this.event.save();
      }).then( () => {
        return this.event.fetch_related();
      }).then( () => {
        this.model.event = this.event.to_view_model();
        this.model.rounds = this.event.rounds.to_view_models();
        this.model.ranks = this.event.ranks.to_view_models();

        this.render();
      });

    router.open_dialog('progress_dialog', "Cancelling the event.", p);
  }
}
