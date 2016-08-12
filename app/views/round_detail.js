'use strict';

class RoundDetailView extends BaseView {

  constructor(round_id) {
    super();

    this.db = new PouchDB('rounds');

    this.title = "Round Details";
    this.template = "round-detail";

    this.round_id = round_id;
  }

  pre_render() {
    this.db.get(this.round_id)
      .then((result) => {
        this.model = result;
        this.update();
      })
      .catch(
        (err) => console.log(err)
      );
  }
}
