'use strict';

class CreateTournamentTemplateView extends BaseView {

  constructor() {
    super();

    this.title = "TourneyMan";
    this.template = "create-tournament-template";

    this.model = {
      is_superuser: user.is_superuser()
    }

    this.graph = new joint.dia.Graph;
    this.paper = null;
    this.obstacles = [];
    this.links = [];

    this.events = {
      "click": {
        ".add_event": () => this.onAddEvent(),
        ".save_tournament": () => this.onSaveTournament(),
        ".on-close": () => {
          router.navigate("back");
        }
      }
    }
  }

  pre_render() {
    router.menu_view.set_active_menu('templates');

    this.paper = new joint.dia.Paper({
        el: $('#tournament-builder-paper'),
        width: "100%",
        height: 600,
        model: this.graph,
        elementView: (cell, options) => this.getViewForModel(cell, options),
        gridSize: 1,
        snapLinks: true,
        defaultLink: new joint.shapes.html.EventDiagramLink,
        validateConnection: (cellViewS, magnetS, cellViewT, magnetT, end, linkView) => {

          // Prevent linking from output ports to input ports within one element.
          if (cellViewS === cellViewT) return false;

          if(magnetS.getAttribute('port-group') !== 'out')
            return false;

          if(magnetT !== null && magnetT.getAttribute('port-group') === 'out')
            return false;

          //ensure only 1 outboun element
          let outbound_els = this.graph.getNeighbors(cellViewS.model, {outbound: true});

          if(outbound_els.length > 0 && outbound_els[0] != cellViewT.model)
            return false;

          //ensure DAG
          let predecessors = this.graph.getPredecessors(cellViewS.model);

          for(let p of predecessors) {
            if(p === cellViewT.model)
              return false;
          }
          //end ensure DAG

          return true;
        },
        validateMagnet: (cellView, magnet) => {
          return true;
          // Note that this is the default behaviour. Just showing it here for reference.
          // Disable linking interaction for magnets marked as passive (see below `.inPorts circle`).
          return magnet.getAttribute('magnet') !== 'passive';
        }
    });

    /*var rect = new joint.shapes.basic.Rect({
        position: { x: 100, y: 30 },
        size: { width: 100, height: 30 },
        attrs: { rect: { fill: 'blue' }, text: { text: 'my box', fill: 'white' } }
    });

    var rect2 = rect.clone();
    rect2.translate(300);

    var link = new joint.dia.Link({
        source: { id: rect.id },
        target: { id: rect2.id }
        });*/
  }

  onAddEvent() {
    let selected_template = null;

    router.open_dialog("select_event_template");
    router.active_dialog.onClose = () => {
      selected_template = router.active_dialog.selected_template;

      this.make_event_node(selected_template);
    };
  }

  async onSaveTournament() {
    console.log(this.paper);

    let elements = this.graph.getElements()

    let root_elements = []
    for(let el of elements) {
      let outbound_elements = this.graph.getNeighbors(el, {outbound: true});

      if(outbound_elements.length == 0)
        root_elements.push(el);
    }

    if(root_elements.length > 1) {
      console.log("Too many root elements. Show Popup.");

      return;
    } else if(root_elements.length <= 0) {
      console.log("Nothing to save. Show popup.");

      return;
    }

    let event_templates = [];

    for(let el of elements) {
      let inbound_elements = this.graph.getNeighbors(el, {inbound: true});
      let outbound_elements = this.graph.getNeighbors(el, {outbound: true});

      if(outbound_elements.length > 1) {
        console.log("FATAL: THIS SHOULDN'T HAPPEN");
      }

      let inbound_event_temp_ids = [];

      for(let in_el of inbound_elements) {
        inbound_event_temp_ids.push(in_el.get('event_template').get_id());
      }

      let outbound_event_id = null;

      if(outbound_elements.length == 1) {
        outbound_event_id = outbound_elements[0].get('event_template').get_id();
      }

      event_templates.push({
        event_template_id: el.get('event_template').get_id(),
        event_template_name: el.get('event_template').get('event_name'),
        previous_event_ids: inbound_event_temp_ids,
        next_event_id: outbound_event_id
      });
    }

    //show a popup that allows the user to name the tournament template.
    router.open_dialog('single_input_dialog', 
      "What do you want to name this tournament template?",
      "text", "Save Tournament Template", async (value) => {

        let new_tournament_template = new TournamentTemplate();
        new_tournament_template.create();
        new_tournament_template.organizer = window.user;
        new_tournament_template.set('name', value);
        new_tournament_template.set('event_templates', event_templates);

        await new_tournament_template.save();
        router.active_dialog.close();
        router.navigate('template_list');
      });
  }

  getViewForModel(bb_model, options) {
    let event_template_id = bb_model.get('event_template').get_id();

    let event_template_tile = new EventTemplateTileBuilderComponentView(
      this, event_template_id);

    return new EventDiagramModelView({
      model: bb_model,
      interactive: options.interactive,
      event_template_tile_view: event_template_tile
    });
  }

  make_event_node(selected_template) {
    let new_event_node = new joint.shapes.html.EventDiagramModel({
      event_template: selected_template,
      position: { x: 50, y: 50 },
      size: { width: 170, height: 170 },
      attrs: {
        '.label': { text: 'Model', 'ref-x': .5, 'ref-y': .2 },
        rect: { fill: '#2ECC71' }
      }
    });

    this.obstacles.push(new_event_node);

    this.graph.addCell(new_event_node);
  }

  build_child_views() {
    for(let e of this.event_set.models) {
      let event_tile_comp = new EventTileComponentView(e.get_id());

      this.add_child_view('.tiles', event_tile_comp);
    }
  }

}
