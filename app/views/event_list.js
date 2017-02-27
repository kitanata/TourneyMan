'use strict';

class EventListView extends BaseView {

  constructor() {
    super();

    this.title = "TourneyMan";
    this.template = "event-list";

    this.model = {
      is_superuser: user.is_superuser()
    }

    this.event_set = null;

    this.events = {
      "click": {
        ".event_create": () => router.navigate("create_event"),
      }
    }
  }

  pre_render() {
    this.event_set = new Events();

    let p = null;

    if(user.is_superuser()) {
      p = this.event_set.all();
    }
    else {
      p = this.event_set.fetch_where({
        $or: [
          { 'published': true },
          { 'organizer_id': user.get_id()}
        ]
      });
    }

    p.then( () => {
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
