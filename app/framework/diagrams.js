window.EventDiagramModel = joint.shapes.basic.Rect.extend({

    markup: '<g class="rotatable"><rect class="body"/><text class="label"/></g>',
    portMarkup: '<circle class="port-body"/>',
    portLabelMarkup: '<text class="port-label"/>',

    defaults: _.defaultsDeep({
        size: {
            width: 80,
            height: 80
        },
        ports: {
          groups: {
            'out': {
              position: {
                name: 'absolute',
                args: {
                  x: '100%',
                  y: '50%',
                  angle: 45
                }
              }
            }
          }
        },
        attrs: {
          rect: {
            fill: {
              type: 'linearGradient',
              stops: [
                { offset: '0%', color: '#f7a07b' },
                { offset: '100%', color: '#fe8550' }
              ],
              attrs: { x1: '0%', y1: '0%', x2: '0%', y2: '100%' }
            },
            stroke: '#ed8661',
            'stroke-width': 2
          },
          magnet: true,
          '.label': {
            text: 'Model',
            'ref-x': .5,
            'ref-y': 10,
            'font-size': 18,
            'text-anchor': 'middle',
            fill: '#000'
          },
          '.body': {
            'ref-width': '100%',
            'ref-height': '100%',
            stroke: '#000'
          }
        }
    }, joint.shapes.basic.Generic.prototype.defaults),

    initialize: function() {
      joint.shapes.basic.Generic.prototype.initialize.apply(this, arguments);

      this.addPort({
        id: 'out',
        group: 'out',
        args: {},
        attrs: { 
          '.port-body': {
            fill: '#E74C3C',
            stroke: '#000',
            r: 10,
            magnet: true
          }
        }
      });
    },
});

window.EventDiagramLink = joint.dia.Link.extend({
    defaults: _.defaultsDeep({
        attrs: { '.marker-target': { d: 'M 10 0 L 0 5 L 10 10 z' }},
        router: { name: 'manhattan' },
        connector: { name: 'rounded' },
    }, joint.dia.Link.prototype.defaults)
});
