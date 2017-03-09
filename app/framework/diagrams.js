joint.shapes.html = {};
joint.shapes.html.EventDiagramModel = joint.shapes.basic.Rect.extend({

  markup: '<g class="rotatable"><rect class="body"/><text class="label"/></g>',
  portMarkup: '<circle class="port-body"/>',
  portLabelMarkup: '<text class="port-label"/>',

  defaults: joint.util.deepSupplement({
    type: 'html.EventDiagramModel',
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
  }, joint.shapes.basic.Rect.prototype.defaults),

  initialize: function() {
    joint.shapes.basic.Rect.prototype.initialize.apply(this, arguments);

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

joint.shapes.html.EventDiagramLink = joint.dia.Link.extend({
  defaults: _.defaultsDeep({
    attrs: { 
      '.marker-target': { d: 'M 10 0 L 0 5 L 10 10 z' },
      '.connection': { 
        stroke: '#000000',
        'stroke-width': 5
      }
    },
    router: { name: 'manhattan' },
    connector: { name: 'rounded' },
  }, joint.dia.Link.prototype.defaults)
});


joint.shapes.html.EventDiagramModelView = joint.dia.ElementView.extend({

  template: [
    '<div class="event-diagram-element">',
    '<button class="delete">x</button>',
    '<label></label>',
    '<span></span>', '<br/>',
    '<select><option>--</option><option>one</option><option>two</option></select>',
    '<input type="text" value="I\'m HTML input" />',
    '</div>'
  ].join(''),

  initialize: function() {
    _.bindAll(this, 'updateBox');
    joint.dia.ElementView.prototype.initialize.apply(this, arguments);

    this.$box = $(_.template(this.template)());
    // Prevent paper from handling pointerdown.
    this.$box.find('input,select').on('mousedown click', function(evt) {
      evt.stopPropagation();
    });
    // This is an example of reacting on the input change and storing the input data in the cell model.
    this.$box.find('input').on('change', _.bind(function(evt) {
      this.model.set('input', $(evt.target).val());
    }, this));
    this.$box.find('select').on('change', _.bind(function(evt) {
      this.model.set('select', $(evt.target).val());
    }, this));
    this.$box.find('select').val(this.model.get('select'));
    this.$box.find('.delete').on('click', _.bind(this.model.remove, this.model));
    // Update the box position whenever the underlying model changes.
    this.model.on('change', this.updateBox, this);
    // Remove the box when the model gets removed from the graph.
    this.model.on('remove', this.removeBox, this);

    this.updateBox();
  },
  render: function() {
    joint.dia.ElementView.prototype.render.apply(this, arguments);
    this.paper.$el.prepend(this.$box);
    this.updateBox();
    return this;
  },
  updateBox: function() {
    // Set the position and dimension of the box so that it covers the JointJS element.
    var bbox = this.model.getBBox();
    // Example of updating the HTML with a data stored in the cell model.
    this.$box.find('label').text(this.model.get('label'));
    this.$box.find('span').text(this.model.get('select'));
    this.$box.css({
      width: bbox.width,
      height: bbox.height,
      left: bbox.x,
      top: bbox.y,
      transform: 'rotate(' + (this.model.get('angle') || 0) + 'deg)'
    });
  },
  removeBox: function(evt) {
    this.$box.remove();
  }
});
