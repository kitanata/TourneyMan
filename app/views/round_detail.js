'use strict';

class RoundDetailView extends BaseView {

  constructor(round_id) {
    super();

    this.db = new PouchDB('rounds');

    this.title = "Round Details";
    this.template = "round-detail";

    this.round_id = round_id;

    this.events = {
      "click": {
        ".record_scores": (el) => this.onRecordScoresClicked(el),
        ".drop_player": (el) => this.onDropPlayerClicked(el)
      }
    }
  }

  pre_render() {
    this.db.get(this.round_id)
      .then((result) => {
        this.model = result;
        this.update();
        this.rebind_events();
      })
      .catch(
        (err) => console.log(err)
      );
  }

  onRecordScoresClicked(el) {
    this.db.put(this.model);
    this.render();
  }

  onDropPlayerClicked(el) {
    let table_id = $(el.currentTarget).data('id');
    let seat_idx = $(el.currentTarget).data('idx');

    let table = _.find(this.model.tables, function(item) { return item.id == table_id; });

    table.players[seat_idx] = -1;
    this.db.put(this.model);
    this.render();
  }
}
