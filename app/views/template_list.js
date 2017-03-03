'use strict';

class TemplateListView extends BaseView {

  constructor() {
    super();

    this.title = "TourneyMan";
    this.template = "template-list";

    this.model = {
      is_superuser: user.is_superuser()
    }

    this.event_template_set = null;

    this.events = {
      "click": {
        ".on-close": () => router.navigate("back"),
      }
    }
  }

  pre_render() {
    this.event_template_set = new EventTemplates();

    let p = null;

    if(user.is_superuser()) {
      p = this.event_template_set.all();
    }
    else {
      p = this.event_set.fetch_where({
          'organizer_id': user.get_id()
      });
    }

    p.then( () => {
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
  }

}
