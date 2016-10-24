'use strict';

class TableComponentView extends BaseView {

  constructor(table_id) {
    super();

    this.title = "Table";
    this.template = "table-component";

    this.table = null;
    this.table_id = table_id;

    this.model = {
      'table': {},
      'seats': [],
      'num_seats': 0
    }

    this.events = {
      "click": {
        ".record-scores": (el) => this.onRecordScoresClicked(el),
      }
    }
  }

  pre_render() {
    console.log("TableComponent::pre_render()");

    this.table = new Table();

    console.log("Fetching table");
    this.table.fetch_by_id(this.table_id)
      .then( () => {
        this.model.table = this.table.to_view_model();
        this.model.seats = [];

        return this.table.fetch_related();
      })
      .then( () => {
        this.model.seats = this.table.seats.to_view_models();
        this.model.num_seats = this.model.seats.length;

        this.rebind_events();
      })
      .catch((err) => console.log(err));
  }

  onRecordScoresClicked(el) {
  }
}
