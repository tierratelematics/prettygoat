/// <reference path="../../node_modules/typemoq/typemoq.node.d.ts" />
import "bluebird";
import "reflect-metadata";
import expect = require("expect.js");

describe("Snapshot repository, given all the streams", () => {

    context("when the snapshots associated needs to be retrieved", () => {
        it("should return the list of available snapshots");
    });

    context("when a snapshot needs to be perfomed", () => {
        context("and the stream is a split projection", () => {
            it("should save each projection in a different record");
        });

        context("and the stream isn't a split projection", () => {
            it("should save the state of the projection in a record");
        });
    });
});