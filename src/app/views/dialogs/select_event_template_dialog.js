'use strict';

import DialogView from '../../framework/dialog_view';

export default class SelectEventTemplateDialog extends DialogView {

  constructor() {
    super();

    this.title = "Select Event Template";
    this.template = "select-event-template-dialog";

    this.event_template_set = new EventTemplates();
    this.model = {}
    this.selected_template = null;

    this.events = {
      "click": {
      }
    }
  }

  async pre_render() {
    console.log("SelectEventTemplateDialog::pre_render()");

    this.event_template_set = new EventTemplates();

    let p = null;

    if(user.is_superuser()) {
      await this.event_template_set.all();
    }
    else {
      await this.event_set.fetch_where({
        'organizer_id': user.get_id()
      });
    }

    this.rebind_events();
    this.build_child_views();
    this.render_children();
  }

  build_child_views() {
    for(let e of this.event_template_set.models) {
      let tile_comp = new EventTemplateTileSelectionComponentView(this, e.get_id());

      this.add_child_view('.event-template-tiles', tile_comp);
    }
  }

  onTemplateSelected(selected_template) {
    this.selected_template = selected_template;

    this.close();
  }
}
