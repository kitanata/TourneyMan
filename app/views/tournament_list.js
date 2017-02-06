'use strict';

class TournamentListView extends BaseView {

  constructor() {
    super();

    this.title = "TourneyMan";
    this.template = "tournament-list";

    this.model = {
      is_superuser: user.is_superuser()
    }

    this.event_set = null;

    this.events = {
      "click": {
        ".event_create": () => router.navigate("create_event"),
        ".event_list": () => router.navigate("event_list"),
        ".user_list": () => router.navigate("list_users"),
        ".open_admin": () => router.navigate("admin"),
        ".my_profile": () => this.onMyProfileClicked(),
        ".logout": () => {
          window.user = null;
          router.navigate("login");
        }
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
