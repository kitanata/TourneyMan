export default class TableService {

  constructor() {
  }


  async generateTables(num_players) {
    let tables = [];

    let num_3p_tables = ((num_players % 4) * -1) + 4;
    let num_4p_tables = (num_players - (3 * num_3p_tables)) / 4;

    let num_total_tables = num_3p_tables + num_4p_tables;

    let table_num = 1;

    for(let i=0; i < num_3p_tables + num_4p_tables; i++) {
      let num_seats = 4;

      if(i < num_3p_tables)
        num_seats = 3;

      let table = await this.generateSingleTable(table_num, num_seats);
      tables.push(table);

      table_num++;
    }

    return tables;
  }  

  async generateSingleTable(table_num, num_seats) {
    let new_table = new Table();
    new_table.create();
    new_table.set('name', "Table " + table_num);
    new_table.round = this.round;
    new_table.event = this.round.event;
    this.round.add_related_to_set('tables', new_table);

    for(let sn = 1; sn <= num_seats; sn++) {
      let new_seat = new Seat();
      new_seat.create();
      new_seat.set('position', sn);
      new_seat.table = new_table;
      new_table.add_related_to_set('seats', new_seat);

      await new_seat.save();
    }

    await new_table.save();
    return new_table;
  }
  
};
