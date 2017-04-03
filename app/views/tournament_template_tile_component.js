'use strict';

class TournamentTemplateTileComponentView extends BaseView {

  constructor(template_id) {
    super();

    this.title = "Tournament Template Tile";
    this.template = "tournament-template-tile-component";

    this.tournament_template = null;
    this.tournament_template_id = template_id;

    this.model = { 
      template: null,
      num_events: 0,
      event_template_names: [],
      can_delete: false
    }

    this.events = {
      "click": {
        ".create_tournament": () => this.onCreateTournmanetClicked(),
        ".template_delete": () => this.onDeleteTemplateClicked()
      }
    }
  }

  pre_render() {
    console.log("TournamentTemplateTileComponent::pre_render()");

    this.tournament_template = new TournamentTemplate();

    console.log("Fetching tournament template");
    this.tournament_template.fetch_by_id(this.tournament_template_id)
      .then( () => {
        this.model.template = this.tournament_template.to_view_model();

        let event_templates = this.tournament_template.get('event_templates')
        this.model.num_events = event_templates.length;

        for(let e of event_templates) {
          this.model.event_template_names.push(e.event_template_name);
        }

        this.model.can_modify = user.is_superuser();

        if(this.tournament_template.get('organizer_id') === user.get_id())
          this.model.can_modify = true;

        this.rebind_events();
      });
  }

  onCreateTournamentClicked() {
    console.log("onCreateTournamentClicked");

    /*let event = new Event();
    event.create();
    this.event_template.to_unpublished_event(event);

    event.organizer = window.user;
    event.set('date', moment().format('L'));

    event.save().then( () => {
      let round_names = this.event_template.get('round_names');

      let save_promises = [];

      for(name of round_names) {
        let new_round = new Round();
        new_round.create();
        new_round.event = event;
        new_round.set('name', name);
        event.add_related_to_set('rounds', new_round);
        save_promises.push(new_round.save());
      }

      return Promise.all(save_promises);
    }).then( () => {
      return event.save();
    }).then( () => {
      router.navigate('event_detail', {}, event.get_id());
    });*/
  }

  onDeleteTemplateClicked() {
    console.log("onDeleteTemplateClicked");

    if(!this.model.can_modify) return; //perm guard

    router.open_dialog("delete_model", this.tournament_template);
    router.active_dialog.onClose = () => this.remove_from_parent();
  }
}
