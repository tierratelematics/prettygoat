/// <reference path="../typings/main.d.ts" />

describe("Given a ProjectionRunner", () => {
    describe("when initializing a projection", () => {
        describe("and a snapshot is present", () => {
            it("should consider the snapshot as the initial state");
            it("should subscribe to the event stream starting from the projection point in time");
        });
        describe("and a snapshot is not present", () => {
            it("should create an initial state based on the projection definition");
            it("should subscribe to the event stream starting from the stream's beginning");
        });
        it("should consider the initial state as the projection state");
        it("should notify that the projection has been initialized");
    });
    describe("when receiving an event from a stream", () => {
        it("should match the event with the projection definition");
        it("should apply the event to the current state");
        it("should consider the returned state as the projection state");
        it("should notify that the projection has been updated");
    });
    describe("when stopping a projection", () => {
        it("should unsubscribe from the event stream");
        it("should not process any more events");
        it("should notify that the projection has been stopped");
    });
});
