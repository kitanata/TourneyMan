'use strict';

class TournamentDetailView extends BaseView {

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
          router.open_dialog("delete_model", this.tournament, () => {
            router.navigate("tournament_list");
          });
        },
        ".on-close": () => router.navigate("back")
      }
    }
  }

  pre_render() {
    console.log("TournamentDetail::pre_render()");
    router.menu_view.set_active_menu('tournaments');

    this.tournament = new Tournament();

    console.log("Fetching tournament");
    this.tournament.fetch_by_id(this.tournament_id)
      .then( () => {
        this.model.tournament = this.tournament.to_view_model();
        this.model.players = [];
        this.model.ranks = [];

        return this.tournament.fetch_related();
      })
      /*.then( () => {
        return this.tournament.ranks.each( (r) => {
          return r.fetch_related_model('player');
        });
      })*/
      .then( () => {
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

        /*return this.tournament.ranks.each( (r) => {
          let rm = r.to_view_model();
          console.log(r.player.get('name'));
          rm.player_name = r.player.get('name');
          rm.sum_score = _.sum(r.get('scores'));
          rm.sum_score_pcts = _.sum(r.get('score_pcts'));
          rm.sum_score_pcts = Math.round(rm.sum_score_pcts * 1000) / 1000;
          this.model.ranks.push(rm);
        });*/
      })
      /*.then( () => {
        let first_rank = this.tournament.get('first_rank_by');
        let second_rank = this.tournament.get('second_rank_by');
        let third_rank = this.tournament.get('third_rank_by');

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
        this.build_child_views();
        this.rebind_events();
        });*/
      .then( () => {
        return window.user.fetch_related();
      })
      .then( () => {
        this.model.event_templates = window.user.event_templates.to_view_models();
      })
      .then( () => {
        this.update();
        this.build_child_views();
        this.rebind_events();
      });
  }

  build_child_views() {
    this.event_set.each( (e) => {
      let event_tile_comp = new EventTileComponentView(e.get_id());

      this.add_child_view('.tiles', event_tile_comp);
    });
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

  onCreateEventClicked(el) {
    if(!this.model.can_modify) return; //perm guard

    let templ = this.get_element().find('.select-event-template.selected');
    let templ_id = templ.data('id');

    let event = new Event();
    let event_template = window.user.event_templates.find( (x) => {
      return (x.get_id() == templ_id);
    });

    event.create_from_template(event_template).then( () => {
      event.tournament = this.tournament;
      return event.save();
    }).then( () => {
      this.tournament.add_related_to_set('events', event);
      return this.tournament.save();
    }).then( () => {
      router.navigate('event_detail', {}, event.get_id());
    });
  }

  onPublishTournamentClicked(el) {
    if(!this.model.can_modify) return; //perm guard

    this.tournament.set('published', true);
    this.tournament.save()
      .then( () => {
        this.render();
      });
  }
  
  onUnpublishTournamentClicked(el) {
    if(!this.model.can_modify) return; //perm guard

    this.tournament.set('published', false);
    this.tournament.save()
      .then( () => {
        this.render();
      });
  }
}
