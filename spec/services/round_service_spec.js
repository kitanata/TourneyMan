import { expect } from 'chai';

import RoundService from '../../app/services/round_service';

import { Round } from '../../app/models/round';

describe("RoundService", () => {

  context("#start_round", () => {

    it("should set started to true", async() => {
      const subject = new RoundService();

      const round = new Round();
      round.create();

      await subject.start_round(round);

      expect(round.get('started')).to.be.true;
    });
  });
});
