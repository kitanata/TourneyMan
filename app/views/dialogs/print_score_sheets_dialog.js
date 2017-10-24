'use strict';

class PrintScoreSheetsDialog extends DialogView {

  constructor(round_id) {
    super();

    this.title = "Print Score Sheets";
    this.template = "print-score-sheets-dialog";

    this.round_id = round_id;
    this.round = null;

    this.model = { 
      tables: []
    }

    this.events = {
      "click": {
        ".print_score_sheets": () => this.onPrintScoreSheetsClicked()
      }
    }
  }

  async pre_render() {
    console.log("PrintScoreSheetsDialog::pre_render()");

    this.round = new Round();

    await this.round.fetch_by_id(this.round_id);
    await this.round.fetch_related_set('tables');
    await this.round.tables.each( (t) => {
      await t.fetch_related();
    });

    this.model.tables = [];

    await this.round.tables.each( (t) => {
      let seat_vms = [];

      await t.seats.each( (s) => {
        await s.fetch_related_model('rank');
        await s.rank.fetch_related_model('player');

        seat_vms.push({
          player_name: s.rank.player.get('name'),
          position: s.get('position')
        });

      });
      
      this.model.tables.push({
        table_number: t.get('table_number'),
        seats: seat_vms
      });
    });
  }

  onPrintScoreSheetsClicked() {
    console.log("PrintScoreSheetsDialog::onPrintScoreSheetsClicked()");

    let to_print = $('#score-sheets').html();

    $('#print-area').html("<div id='score-sheets'>" + to_print + "</div>");

    window.print();

    $('#print-area').empty();
  }

}
