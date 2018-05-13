import TableService from '../../src/app/services/table_service.js';
import { expect } from 'chai';
import { groupBy } from 'lodash';

describe("TableService", () => {
  it("should exist", () => {
    const subject = new TableService();

    expect(subject).to.not.be.undefined;
  });

  context("generate_tables()", () => {
    context("there are 2 players", () => {
      it("will generate one table with 2 seats", async () => {
        const subject = new TableService();

        const tables = await subject.generate_tables(2);

        expect(tables.count()).to.eq(1);
        expect(tables.models[0].seats.count()).to.eq(2);
      });
    });

    context("there are 3 players", () => {
      it("will generate one table with 3 seats", async () => {
        const subject = new TableService();

        const tables = await subject.generate_tables(3);

        expect(tables.count()).to.eq(1);
        expect(tables.models[0].seats.count()).to.eq(3);
      });
    });

    context("there are 4 players", () => {
      it("will generate one table with 4 seats", async () => {
        const subject = new TableService();

        const tables = await subject.generate_tables(4);

        expect(tables.count()).to.eq(1);
        expect(tables.models[0].seats.count()).to.eq(4);
      });
    });

    context("there are 5 players", () => {
      it("will generate one table with 3 seats, and one table with 2 seats", async () => {
        const subject = new TableService();

        const tables = await subject.generate_tables(5);

        expect(tables.count()).to.eq(2);
        expect(tables.models[0].seats.count()).to.eq(3);
        expect(tables.models[1].seats.count()).to.eq(2);
      });
    });

    context("there are 6 players", () => {
      it("will generate two tables with 3 seats", async () => {
        const subject = new TableService();

        const tables = await subject.generate_tables(6);

        expect(tables.count()).to.eq(2);
        expect(tables.models[0].seats.count()).to.eq(3);
        expect(tables.models[1].seats.count()).to.eq(3);
      });
    });

    context("there are 7 players", () => {
      it("will generate one table with 4 seats, and one table with 3 seats", async () => {
        const subject = new TableService();

        const tables = await subject.generate_tables(7);

        expect(tables.count()).to.eq(2);
        expect(tables.models[0].seats.count()).to.eq(3);
        expect(tables.models[1].seats.count()).to.eq(4);
      });
    });

    context("there are 8 players", () => {
      it("will generate two tables with 4 seats", async () => {
        const subject = new TableService();

        const tables = await subject.generate_tables(8);

        expect(tables.count()).to.eq(2);
        expect(tables.models[0].seats.count()).to.eq(4);
        expect(tables.models[1].seats.count()).to.eq(4);
      });
    });

    context("there are 9 players", () => {
      it("will generate three tables with 3 seats", async () => {
        const subject = new TableService();

        const tables = await subject.generate_tables(9);

        expect(tables.count()).to.eq(3);
        expect(tables.models[0].seats.count()).to.eq(3);
        expect(tables.models[1].seats.count()).to.eq(3);
        expect(tables.models[2].seats.count()).to.eq(3);
      });
    });

    context("there are 10 players", () => {
      it("will generate two tables with 3 seats, and one table with 4 seats", async () => {
        const subject = new TableService();

        const tables = await subject.generate_tables(10);

        expect(tables.count()).to.eq(3);
        expect(tables.models[0].seats.count()).to.eq(3);
        expect(tables.models[1].seats.count()).to.eq(3);
        expect(tables.models[2].seats.count()).to.eq(4);
      });
    });

    context("there are 11 players", () => {
      it("will generate one table with 3 seats, and two tables with 4 seats", async () => {
        const subject = new TableService();

        const tables = await subject.generate_tables(11);

        expect(tables.count()).to.eq(3);
        expect(tables.models[0].seats.count()).to.eq(3);
        expect(tables.models[1].seats.count()).to.eq(4);
        expect(tables.models[2].seats.count()).to.eq(4);
      });
    });

    context("there are 13 players", () => {
      it("will generate three tables with 3 seats each, and a table with 4 seats", async () => {
        const subject = new TableService();

        const tables = await subject.generate_tables(13);

        expect(tables.count()).to.eq(4);
        expect(tables.models[0].seats.count()).to.eq(3);
        expect(tables.models[1].seats.count()).to.eq(3);
        expect(tables.models[2].seats.count()).to.eq(3);
        expect(tables.models[3].seats.count()).to.eq(4);
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

          const tables = await subject.generate_tables(num);

          expect(tables.count()).to.eq(counts.three + counts.four);

          const g = tables.group_by((t) => {
            return t.seats.count();
          });

          expect(g[3].length).to.eq(counts.three);
          expect(g[4].length).to.eq(counts.four);
        }
      });
    });
  });
});
