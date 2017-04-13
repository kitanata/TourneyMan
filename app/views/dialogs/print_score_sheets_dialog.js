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

  pre_render() {
    console.log("PrintScoreSheetsDialog::pre_render()");

    this.round = new Round();

    this.round.fetch_by_id(this.round_id)
      .then( () => {
        return this.round.fetch_related_set('tables')
      })
      .then( () => {
        return this.round.tables.each( (t) => {
          return t.fetch_related();
        });
      })
      .then( () => {
        this.model.tables = [];

        return this.round.tables.each( (t) => {
          let seat_vms = [];

          return t.seats.each( (s) => {
            return s.fetch_related_model('rank')
              .then( () => {
                return s.rank.fetch_related_model('player');
              })
              .then( () => {
                seat_vms.push({
                  player_name: s.rank.player.get('name'),
                  position: s.get('position')
                });
              })
          }).then( () => {
            this.model.tables.push({
              table_number: t.get('table_number'),
              seats: seat_vms
            });
          })
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
