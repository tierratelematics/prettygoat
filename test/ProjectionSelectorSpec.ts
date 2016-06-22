/// <reference path="../node_modules/typemoq/typemoq.node.d.ts" />
import {Mock, Times, It} from "typemoq";
import expect = require("expect.js");
import sinon = require("sinon");
import IProjectionSelector from "../scripts/events/IProjectionSelector";
import ProjectionSelector from "../scripts/events/ProjectionSelector";

describe("Projection selector, given some registered projections", () => {

    let subject:IProjectionSelector;

    beforeEach(() => {
        subject = new ProjectionSelector();
    });

    context("when a new event is received", () => {
        it("should return a list of the matching projection runners", () => {

        });

        context("and needs to be handled on a split projection", () => {
            it("should create the child projection and return the list of matching projection runners", () => {

            });
        });
    });
});