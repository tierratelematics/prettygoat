import "reflect-metadata";
import "bluebird";
import expect = require("expect.js");
import * as TypeMoq from "typemoq";
import CassandraStreamFactory from "../scripts/cassandra/CassandraStreamFactory";

describe("Cassandra stream factory, given a stream factory", () => {

    let subject:CassandraStreamFactory;

    beforeEach(() => {

    });

    context("when all the events needs to be fetched", () => {
        it("should retrieve the events since the epoch", () => {

        });
    });

    context("when starting the stream from a certain point", () => {
        it("should retrieve the events in all the buckets greater than that point", () => {

        });
    });
});