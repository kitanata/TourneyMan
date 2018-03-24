import TableService from '../../app/services/table_service.js';
import { expect } from 'chai';
import { groupBy } from 'lodash';

describe("TableService", () => {
  it("should exist", () => {
    const subject = new TableService();

    expect(subject).to.not.be.undefined;
  });

  context("generateTables()", () => {
    context("there are 2 players", () => {
      it("will generate one table with 2 seats", async () => {
        const subject = new TableService();

        const tables = await subject.generateTables(2);

        expect(tables.length).to.eq(1);
        expect(tables[0].seats.count()).to.eq(2);
      });
    });

    context("there are 3 players", () => {
      it("will generate one table with 3 seats", async () => {
        const subject = new TableService();

        const tables = await subject.generateTables(3);

        expect(tables.length).to.eq(1);
        expect(tables[0].seats.count()).to.eq(3);
      });
    });

    context("there are 4 players", () => {
      it("will generate one table with 4 seats", async () => {
        const subject = new TableService();

        const tables = await subject.generateTables(4);

        expect(tables.length).to.eq(1);
        expect(tables[0].seats.count()).to.eq(4);
      });
    });

    context("there are 5 players", () => {
      it("will generate one table with 3 seats, and one table with 2 seats", async () => {
        const subject = new TableService();

        const tables = await subject.generateTables(5);

        expect(tables.length).to.eq(2);
        expect(tables[0].seats.count()).to.eq(3);
        expect(tables[1].seats.count()).to.eq(2);
      });
    });

    context("there are 6 players", () => {
      it("will generate two tables with 3 seats", async () => {
        const subject = new TableService();

        const tables = await subject.generateTables(6);

        expect(tables.length).to.eq(2);
        expect(tables[0].seats.count()).to.eq(3);
        expect(tables[1].seats.count()).to.eq(3);
      });
    });

    context("there are 7 players", () => {
      it("will generate one table with 4 seats, and one table with 3 seats", async () => {
        const subject = new TableService();

        const tables = await subject.generateTables(7);

        expect(tables.length).to.eq(2);
        expect(tables[0].seats.count()).to.eq(3);
        expect(tables[1].seats.count()).to.eq(4);
      });
    });

    context("there are 8 players", () => {
      it("will generate two tables with 4 seats", async () => {
        const subject = new TableService();

        const tables = await subject.generateTables(8);

        expect(tables.length).to.eq(2);
        expect(tables[0].seats.count()).to.eq(4);
        expect(tables[1].seats.count()).to.eq(4);
      });
    });

    context("there are 9 players", () => {
      it("will generate three tables with 3 seats", async () => {
        const subject = new TableService();

        const tables = await subject.generateTables(9);

        expect(tables.length).to.eq(3);
        expect(tables[0].seats.count()).to.eq(3);
        expect(tables[1].seats.count()).to.eq(3);
        expect(tables[2].seats.count()).to.eq(3);
      });
    });

    context("there are 10 players", () => {
      it("will generate two tables with 3 seats, and one table with 4 seats", async () => {
        const subject = new TableService();

        const tables = await subject.generateTables(10);

        expect(tables.length).to.eq(3);
        expect(tables[0].seats.count()).to.eq(3);
        expect(tables[1].seats.count()).to.eq(3);
        expect(tables[2].seats.count()).to.eq(4);
      });
    });

    context("there are 11 players", () => {
      it("will generate one table with 3 seats, and two tables with 4 seats", async () => {
        const subject = new TableService();

        const tables = await subject.generateTables(11);

        expect(tables.length).to.eq(3);
        expect(tables[0].seats.count()).to.eq(3);
        expect(tables[1].seats.count()).to.eq(4);
        expect(tables[2].seats.count()).to.eq(4);
      });
    });

    context("there are 13 players", () => {
      it("will generate three tables with 3 seats each, and a table with 4 seats", async () => {
        const subject = new TableService();

        const tables = await subject.generateTables(13);

        expect(tables.length).to.eq(4);
        expect(tables[0].seats.count()).to.eq(3);
        expect(tables[1].seats.count()).to.eq(3);
        expect(tables[2].seats.count()).to.eq(3);
        expect(tables[3].seats.count()).to.eq(4);
      });
    });
    
    context("prime number tests", () => {
      it("will generate the correct number of tables", async () => {
        const cases = {
          17: { 'three': 3, 'four': 2 },
          19: { 'three': 1, 'four': 4 },
          23: { 'three': 1, 'four': 5 },
          29: { 'three': 3, 'four': 5 },
          31: { 'three': 1, 'four': 7 },
          37: { 'three': 3, 'four': 7 },
          41: { 'three': 3, 'four': 8 },
          43: { 'three': 1, 'four': 10},
          47: { 'three': 1, 'four': 11},
          53: { 'three': 3, 'four': 11},
          59: { 'three': 1, 'four': 14},
        }

        const subject = new TableService();

        for(let num in cases) {
          let counts = cases[num];

          const tables = await subject.generateTables(num);

          expect(tables.length).to.eq(counts.three + counts.four);

          const g = groupBy(tables, (t) => {
            return t.seats.count();
          });

          expect(g[3].length).to.eq(counts.three);
          expect(g[4].length).to.eq(counts.four);
        }
      });
    });
  });
});
