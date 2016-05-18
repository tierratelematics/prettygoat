/// <reference path="../typings/index.d.ts" />
describe("Given a ProjectionEngine", () => {
    context("when registering a new projection", () => {
        it("should check for its formal correctness");
        it("should analyze its definition");
        context("and the projection is invalid", () => {
            it("should signal an error");
            it("should state why the projection is invalid");
        });
    });
    context("when running a projection", () => {
        it("should subscribe to the event stream according to the definition");
        context("and an error occurs when subscribing to the event stream", () => {
           it("should publish an error state");
        });
        it("should initialize the state of the projection");
        it("should publish the initial state of the projection");
        context("and an error occurs when initializing the state of the projection", () => {
            it("should unsubscribe to the event stream");
            it("should publish an error state");
        });
        context("and an event is received from the stream", () => {
            it("should match the event coming from the stream with a definition from the projection");
            it("should apply the event to the projection with respect to the given state");
            it("should check if a snapshot is needed");
            context("and a snapshot is needed", () => {
               it("should save a snapshot of the state");
               context("and an error occurs when saving the snapshot", () => {
                   it("should keep processing events");
               });
            });
            it("should publish the new state of the projection");
            context("and an error occurs when applying the event to the projection", () => {
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
