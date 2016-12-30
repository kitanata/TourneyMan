'use strict';

class PrintScoreSheetsDialog extends DialogView {

  constructor(round_id) {
    super();

    this.title = "Print Score Sheets";
    this.template = "print-score-sheets-dialog";

    this.round_id = round_id;

    this.model = { 
    }

    this.events = {
      "click": {
        ".print_score_sheets": () => this.onPrintScoreSheetsClicked()
      }
    }
  }

  pre_render() {
    console.log("PrintScoreSheetsDialog::pre_render()");
  }

  onPrintScoreSheetsClicked() {
    console.log("PrintScoreSheetsDialog::onPrintScoreSheetsClicked()");

    let to_print = $('#score-sheets').html();

    $('#print-area').html(to_print);

    window.print();

    $('#print-area').empty();
  }

}
