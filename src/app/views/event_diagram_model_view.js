'use strict';

import BaseView from '../framework/base_view';

export default class EventDiagramModelView extends joint.dia.ElementView {

  constructor(options) {
    super(options);

    this.event_template_tile_view = options.event_template_tile_view;
  }

  initialize() {
    _.bindAll(this, 'updateBox');
    joint.dia.ElementView.prototype.initialize.apply(this, arguments);

    this.box_template = [
      '<div class="event-diagram-element">',
      '<button class="delete">x</button>',
      '</div>'
    ].join('');

    this.$box = $(_.template(this.box_template)());
    this.$box.find('.delete').on('click', () => this.model.remove(this.model));

    // Update the box position whenever the underlying model changes.
    this.model.on('change', this.updateBox, this);
    // Remove the box when the model gets removed from the graph.
    this.model.on('remove', this.removeBox, this);

    this.updateBox();
  }

  render() {
    joint.dia.ElementView.prototype.render.apply(this, arguments);

    this.event_template_tile_view.render(this.$box);
    this.paper.$el.prepend(this.$box);
    this.updateBox();

    return this;
  }

  updateBox() {
    // Set the position and dimension of the box so that it covers the JointJS element.
    var bbox = this.model.getBBox();

    this.$box.css({
      width: bbox.width,
      height: bbox.height,
      left: bbox.x,
      top: bbox.y,
      transform: 'rotate(' + (this.model.get('angle') || 0) + 'deg)'
    });
  }

  removeBox(evt) {
    this.$box.remove();
  }
}
