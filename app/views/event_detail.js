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
          router.open_dialog("delete_model", this.event, () => {
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

  pre_render() {
    console.log("EventDetail::pre_render()");
    router.menu_view.set_active_menu('events');

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
      })
      .then( () => {
        this.model.ranks = this.event.get_ordered_ranks();

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
    event_template.create();

    let p = event_template.from_unpublished_event(this.event);

    p = p.then( () => {
      return event_template.save()
    }).then( () => {
      window.user.add_related_to_set('event_templates', event_template);
      return window.user.save();
    }).then( () => {
      return this.event.destroy();
    });

    router.open_dialog('progress_dialog', "Converting the event.", p, () => {
      router.navigate('template_list', {replace: true});
    });
  }

  onStartEventClicked(el) {
    if(!this.model.can_modify) return; //perm guard

    this.event.set('started', true);

    this.event.save()
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

    let players = new Users(this.event.players.models.slice(0));

    let p = this.event.destroy_related_set('ranks')
      .then( () => {
        return this.event.remove_all_players();
      })
      .then( () => {
        return this.event.rounds.each( (r) => {
          return r.destroy_related_set('tables')
            .then( () => {
              return r.update();
            }).then( () => {
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
        return players.each( (p) => {
          return p.update().then( () => {
            let new_rank = new Rank();

            new_rank.create();
            new_rank.event = this.event;
            new_rank.player = p;

            this.event.add_related_to_set('players', p);
            this.event.add_related_to_set('ranks', new_rank);

            return new_rank.save();
          }).then( () => {
            p.add_related_to_set('events', this.event);
            return p.save();
          });
        });
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


  onRemoveAllPlayersClicked(el) {
    console.log("EventDetail::onRemoveAllPlayersClicked");

    this.event.remove_all_players()
      .then( () => {
        this.render();
      });
  }

  onInvitePlayersClicked(el) {
    console.log("EventDetail::onInvitePlayersClicked");

    router.open_dialog('invite_players_dialog', this.event, () => {
      this.render();
    });
  }

  onRemovePlayerClicked(el) {
    console.log("EventDetail::onRemovePlayerClicked");

    let player_id = $(el.currentTarget).data('id')
    let player = new Player();

    return player.fetch_by_id(player_id)
      .then( () => {
        return this.event.remove_player(player);
      }).then( () => {
        this.render();
      });
  }
}
