import expect = require("expect.js");
import sinon = require("sinon");

describe("Split projection, given a projection with a split definition", () => {

    context("when a new event is emitted", () => {
        context("and a projection runner has not been created yet", () => {
            it("should add a projection runner to the list of runners with the result key", () => {

            });
        });

        context("and a projection runner has already been created", () => {
            it("should calculate the new state of the projection");
        });
    });

    context("when it's running and needs to be stopped", () => {
        it("should stop all the registered projections");
    });

    context("when it's added under a certain area", () => {
        it("should be exposed under a namespace area/viewmodel/key");
    });
});