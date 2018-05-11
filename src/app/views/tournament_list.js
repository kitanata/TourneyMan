'use strict';

class TournamentListView extends BaseView {

  constructor() {
    super();

    this.title = "TourneyMan";
    this.template = "tournament-list";

    this.model = {
      is_superuser: user.is_superuser()
    }

    this.tournament_set = null;

    this.events = {
      "click": {
        ".on-close": () => router.navigate('back'),
        ".new-tournament": () => router.navigate("create_tournament")
      }
    }
  }

  async pre_render() {
    router.menu_view.set_active_menu('tournaments');
    this.tournament_set = new Tournaments();

    await this.tournament_set.all();
    this.rebind_events();
    this.build_child_views();
    this.render_children();
  }

  build_child_views() {
    for(let e of this.tournament_set.models) {
      let tournament_tile_comp = new TournamentTileComponentView(e.get_id());

      this.add_child_view('.tiles', tournament_tile_comp);
    }
  }

}
