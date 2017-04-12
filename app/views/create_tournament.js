'use strict';

class CreateTournamentView extends BaseView {

  constructor(tournament_id) {
    super();

    this.title = "Create Tournament";
    this.template = "create-tournament";

    this.model = {
      tournament: {},
      errors: []
    }

    this.tournament_id = tournament_id || -1;
    this.tournament = null;

    this.events = {
      "click": {
        "#on-submit": (el) => this.on_submit(el),
        ".on-close": () => router.navigate('back')
      }
    }

    this.form_constraints = {
      name: {
        presence: true,
      }
    }
  }

  pre_render() {
    this.tournament = new Tournament();

    if(this.tournament_id == -1) {
      this.tournament.create();

      this.model.tournament = this.tournament.to_view_model();
      return;
    } 

    this.tournament.fetch_by_id(this.tournament_id)
      .then( () => {
        this.model.tournament = this.tournament.to_view_model();
      });
  }

  on_submit(el) {
    let errors = validate(this.model.tournament, this.form_constraints);

    if(errors) {
      this.model.errors = errors;
    } else {
      this.tournament.from_view_model(this.model.tournament);
      this.tournament.organizer = user;
      this.tournament.save();

      router.navigate('back');
    }
  }
}
