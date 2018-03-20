import TableService from '../../app/services/table_service.js';
import { expect } from 'chai';

describe("TableService", () => {
  it("should exist", () => {
    const subject = new TableService();

    expect(subject).to.not.be.undefined;
  });
});
