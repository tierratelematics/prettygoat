import "reflect-metadata";
import expect = require("expect.js");
import {IMock, Mock, It, Times} from "typemoq";
import {Observable} from "rx";
import IReadModelFactory from "../../scripts/streams/IReadModelFactory";
import Lookup from "../../scripts/lookup/Lookup";
import {Event} from "../../scripts/streams/Event";

describe("Given a lookup", () => {

    let subject: Lookup;
    let readModels: IMock<IReadModelFactory>;

    beforeEach(() => {
        readModels = Mock.ofType<IReadModelFactory>();
        readModels.setup(readModels => readModels.from(null)).returns(() => Observable.create<Event>(observer => {
            observer.onNext({
                type: "UsersByDevice",
                timestamp: new Date(0),
                payload: {"test-device": ["26h", "128a"]},
                splitKey: null
            });
            observer.onNext({
                type: "OtherProjection",
                timestamp: new Date(1),
                payload: {test: 10},
                splitKey: null
            });
            observer.onCompleted();
        }));
        subject = new Lookup(readModels.object);
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
        beforeEach(() => subject.setProjectionName("UsersByDevice"));
        context("and the backing projection hasn't been requested yet", () => {
            it("should subscribe to it and get the model", async () => {
                let users = await subject.keysFor("test-device");

                expect(users).to.eql(["26h", "128a"]);
            });
        });
        context("and the backing projection has been already requested", () => {
            beforeEach(async () => await subject.keysFor("test-device"));
            it("should filter the model from the cache", async () => {
                let users = await subject.keysFor("test-device");

                expect(users).to.eql(["26h", "128a"]);
                readModels.verify(r => r.from(null), Times.once());
            });
        });
    });
});