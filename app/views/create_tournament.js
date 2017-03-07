'use strict';

class CreateTournamentView extends BaseView {

  constructor() {
    super();

    this.title = "TourneyMan";
    this.template = "create-tournament";

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
      }
    }
  }

  pre_render() {

    this.paper = new joint.dia.Paper({
        el: $('#tournament-builder-paper'),
        width: "100%",
        height: 600,
        model: this.graph,
        gridSize: 1,
        snapLinks: true,
        defaultLink: new EventDiagramLink,
        validateConnection: (cellViewS, magnetS, cellViewT, magnetT, end, linkView) => {

          // Prevent linking from output ports to input ports within one element.
          if (cellViewS === cellViewT) return false;

          if(magnetS.getAttribute('port-group') !== 'out')
            return false;

          if(magnetT !== null && magnetT.getAttribute('port-group') === 'out')
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

    this.make_event_node();
  }

  onAddEvent() {
    this.make_event_node();
  }

  make_event_node() {
    let new_event_node = new EventDiagramModel({
      position: { x: 50, y: 50 },
      size: { width: 90, height: 90 },
      attrs: {
        '.label': { text: 'Model', 'ref-x': .5, 'ref-y': .2 },
        rect: { fill: '#2ECC71' }
      }
    });

    this.obstacles.push(new_event_node);

    this.graph.addCell(new_event_node);
  }

  build_child_views() {
    this.event_set.each( (e) => {
      let event_tile_comp = new EventTileComponentView(e.get_id());

      this.add_child_view('.tiles', event_tile_comp);
    });
  }

}
