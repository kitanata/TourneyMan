'use strict';

class TemplateListView extends BaseView {

  constructor() {
    super();

    this.title = "TourneyMan";
    this.template = "template-list";

    this.model = {
      is_superuser: user.is_superuser(),
      has_tournament_templates: false,
      has_event_templates: false
    }

    this.event_template_set = null;
    this.tournament_template_set = null;

    this.events = {
      "click": {
        ".on-close": () => router.navigate("back"),
        ".tournament_create": () => router.navigate("create_tournament")
      }
    }
  }

  pre_render() {
    router.menu_view.set_active_menu('templates');

    this.event_template_set = new EventTemplates();
    this.tournament_template_set = new TournamentTemplates();

    let p = null;

    if(user.is_superuser()) {
      p = this.event_template_set.all().then( () => {
        return this.tournament_template_set.all();
      });
    }
    else {
      p = this.event_template_set.fetch_where({
          'organizer_id': user.get_id()
      }).then( () => {
        return this.tournament_template_set.fetch_where({
          'organizer_id': user.get_id()
        });
      });
    }
    
    p.then( () => {
      this.model.has_tournament_templates = this.tournament_template_set.count() > 0;
      this.model.has_event_templates = this.event_template_set.count() > 0;
    }).then( () => {
      this.rebind_events();
      this.build_child_views();
      this.render_children();
    });
  }

  build_child_views() {
    this.event_template_set.each( (e) => {
      let tile_comp = new EventTemplateTileComponentView(e.get_id());

      this.add_child_view('.event-template-tiles', tile_comp);
    });

    this.tournament_template_set.each( (t) => {
      let tile_comp = new TournamentTemplateTileComponentView(t.get_id());

      this.add_child_view('.tournament-template-tiles', tile_comp);
    });
  }

}
