/// <reference path="../typings/main.d.ts" />

describe("Given a ProjectionEngine", () => {
    describe("when registering a new projection", () => {
        it("should check for its formal correctness");
        it("should analyze its definition");
        describe("and the projection is invalid", () => {
            it("should signal an error");
            it("should state why the projection is invalid");
        });
    });
    describe("when running a projection", () => {
        it("should subscribe to the event stream according to the definition");
        describe("and an error occurs when subscribing to the event stream", () => {
           it("should publish an error state");
        });
        it("should initialize the state of the projection");
        it("should publish the initial state of the projection");
        describe("and an error occurs when initializing the state of the projection", () => {
            it("should unsubscribe to the event stream");
            it("should publish an error state");
        });
        describe("and an event is received from the stream", () => {
            it("should match the event coming from the stream with a definition from the projection");
            it("should apply the event to the projection with respect to the given state");
            it("should publish the new state of the projection");
            describe("and an error occurs when applying the event to the projection", () => {
               it("should unsubscribe to the event stream");
               it("should publish an error state");
            });
        });
    });
    describe("when running", () => {
        it("should run all the registered projections");
        describe("and a projection fails", () => {
            it("should keep running all the remaining projections");
        });
    });
});
