import RankingService from '../../app/services/ranking_service.js';
import { expect } from 'chai';

describe("RankingService", () => {
  it("should exist", () => {
    const subject = new RankingService();

    expect(subject).to.not.be.undefined;
  });
});
