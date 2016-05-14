/// <reference path="../typings/main.d.ts" />

describe("Given a ProjectionAnalyzer", () => {
    describe("when analyzing a projection", () => {
        it("should check it has a name");
        it("should check it has a source stream definition");
        it("should check it has a snapshotting strategy");
        describe("and there is no snapshotting strategy", () => {
            it("should assign a default snapshotting strategy");
        });
        it("should check it has an event application definition");
        describe("and the definition splits the projection into multiple ones", () => {
            it("should check it has a split definition");
        });
        describe("and one or more checks fail", () => {
            it("should return all the failed checks");
        });
    });
});
