'use strict';

class CreateTournamentView extends BaseView {

  constructor() {
    super();

    this.title = "TourneyMan";
    this.template = "create-tournament";

    this.model = {
      is_superuser: user.is_superuser()
    }

    this.event_set = null;

    this.events = {
      "click": {
        ".tournament_create": () => router.navigate("create_tournament"),
      }
    }
  }

  pre_render() {
    this.event_set = new Events();

    this.event_set.all()
      .then( () => {
        this.rebind_events();
        this.build_child_views();
        this.render_children();
      });
  }

  build_child_views() {
    this.event_set.each( (e) => {
      let event_tile_comp = new EventTileComponentView(e.get_id());

      this.add_child_view('.tiles', event_tile_comp);
    });
  }

}
