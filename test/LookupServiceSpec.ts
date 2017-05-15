import "reflect-metadata";
import expect = require("expect.js");
import {IMock, Mock, It, Times} from "typemoq";
import {ILookupService, LookupService} from "../scripts/lookup/LookupService";
import IProjectionRunner from "../scripts/projections/IProjectionRunner";
import Lookup from "../scripts/lookup/Lookup";
import {Observable} from "rx";

describe("Given a lookup service", () => {

    let subject: ILookupService;
    let runner: IMock<IProjectionRunner<Lookup>>;

    beforeEach(() => {
        runner = Mock.ofType<IProjectionRunner<Lookup>>();
        runner.setup(r => r.notifications()).returns(() => Observable.just({
            type: "UsersByDevice",
            timestamp: new Date(0),
            payload: {"test-device": ["26h", "128a"]},
            splitKey: null
        }));
        subject = new LookupService({
            "UsersByDevice": runner.object
        });
    });

    context("when a lookup is requested", () => {
        context("and the backing projection hasn't been requested yet", () => {
            it("should subscribe to it and get the model", async() => {
                let users = await subject.keysFor("test-device", "UsersByDevice");

                expect(users).to.eql(["26h", "128a"]);
            });
        });
        context("and the backing projection has been already requested", () => {
            beforeEach(async() => await subject.keysFor("test-device", "UsersByDevice"));
            it("should filter the model from the cache", async() => {
                let users = await subject.keysFor("test-device", "UsersByDevice");

                expect(users).to.eql(["26h", "128a"]);
                runner.verify(r => r.notifications(), Times.once());
            });
        });
    });
});