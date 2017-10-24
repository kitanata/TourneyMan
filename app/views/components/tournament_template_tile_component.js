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
        ".create_tournament": () => this.onCreateTournamentClicked(),
        ".template_delete": () => this.onDeleteTemplateClicked()
      }
    }
  }

  async pre_render() {
    console.log("TournamentTemplateTileComponent::pre_render()");

    this.tournament_template = new TournamentTemplate();

    console.log("Fetching tournament template");
    await this.tournament_template.fetch_by_id(this.tournament_template_id);
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
  }

  async onCreateTournamentClicked() {
    console.log("onCreateTournamentClicked");

    let tournament = new Tournament();
    await tournament.create_from_template(this.tournament_template);
    router.navigate('tournament_list');
  }

  onDeleteTemplateClicked() {
    console.log("onDeleteTemplateClicked");

    if(!this.model.can_modify) return; //perm guard

    router.open_dialog("delete_model", () => {
      return this.tournament_template.destroy(); 
    });
    router.active_dialog.onClose = () => this.remove_from_parent();
  }
}
