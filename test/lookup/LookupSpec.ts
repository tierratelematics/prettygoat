import "reflect-metadata";
import expect = require("expect.js");
import {IMock, Mock, It, Times} from "typemoq";
import {Observable, ReplaySubject} from "rx";
import IReadModelFactory from "../../scripts/streams/IReadModelFactory";
import Lookup from "../../scripts/lookup/Lookup";
import {Event} from "../../scripts/streams/Event";

describe("Given a lookup", () => {

    let subject: Lookup;
    let readModels: IMock<IReadModelFactory>;

    beforeEach(() => {
        readModels = Mock.ofType<IReadModelFactory>();
        readModels.setup(r => r.from(null)).returns(() => Observable.create<Event>(observer => {
            observer.onNext({
                type: "OtherProjection",
                timestamp: null,
                payload: {timestamp: new Date(100), lookup: {test: 10}},
                splitKey: null
            });
            observer.onNext({
                type: "UsersByDevice",
                timestamp: null,
                payload: {timestamp: new Date(150), lookup: {"test-device": ["26h"]}},
                splitKey: null
            });
            observer.onNext({
                type: "UsersByDevice",
                timestamp: null,
                payload: {timestamp: new Date(200), lookup: {"test-device": ["26h", "128a"]}},
                splitKey: null
            });
        }));
        subject = new Lookup(readModels.object);
        subject.setProjectionName("UsersByDevice");
    });

    context("when a projection name is not set", () => {
        it("should throw an error", async () => {
            try {
                await subject.keysFor("test-device");
            } catch (error) {
                expect(error.message).to.be("A projection name must be set");
            }
        });
    });

    context("when a key is requested", () => {
        context("and the lookup is in sync with the projection", () => {
            beforeEach(async () => {
                await subject.sync(new Date(200));
            });
            it("should return the lookup", async () => {
                let users = await subject.keysFor("test-device");

                expect(users).to.eql(["26h", "128a"]);
            });
        });

        context("and the lookup is not in sync with the projection", () => {
            it("should wait for synchronization and return the lookup", async () => {
                subject.sync(new Date(200));
                let users = await subject.keysFor("test-device");

                expect(users).to.eql(["26h", "128a"]);
            });
        });
    });
});