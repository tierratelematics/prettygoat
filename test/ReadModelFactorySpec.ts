import "bluebird";
import "reflect-metadata";
import expect = require("expect.js");
import * as TypeMoq from "typemoq";
import IProjectionRegistry from "../scripts/registry/IProjectionRegistry";
import MockProjectionDefinition from "./fixtures/definitions/MockProjectionDefinition";
import {
    MockProjectionCircularADefinition,
    MockProjectionCircularBDefinition
} from "./fixtures/definitions/MockProjectionCircularDefinition";
import MockProjectionRegistry from "./fixtures/MockProjectionRegistry";
import RegistryEntry from "../scripts/registry/RegistryEntry";
import ReadModelFactory from "../scripts/streams/ReadModelFactory";

describe("Given a Read Model Factory", () => {

    let registry: TypeMoq.Mock<IProjectionRegistry>,
        subject: ReadModelFactory,
        events:any[];

    beforeEach(() => {
        events = [];
        registry = TypeMoq.Mock.ofType(MockProjectionRegistry);
        subject = new ReadModelFactory(registry.object);
        subject.publish({
                type: "CircularA",
                payload: {
                    count: 20,
                    id: "10"
                },
                timestamp: new Date(10), splitKey: null
            }
        );
    });

    context("when a read model is handled by projection", () => {
        beforeEach(() => {
            registry.setup(r => r.getEntry("$init", null)).returns(a => {
                return {area: "Admin", data: null};
            });
            registry.setup(r => r.getEntry("TestEvent", null)).returns(a => {
                return {area: "Admin", data: null};
            });
        });

        it("should not emit an event", () => {
            subject.from(null, new MockProjectionDefinition().define().definition).subscribe(event => events.push(event));
            expect(events).to.have.length(1);
        });
    });

    context("when a read model is not handled by projection", () => {
        beforeEach(() => {
            let circularAEntry = new RegistryEntry(new MockProjectionCircularADefinition().define(), null);
            registry.setup(r => r.getEntry("CircularA", null)).returns(a => {
                return {area: "Admin", data: circularAEntry};
            });
        });

        it("should not receive any event", () => {
            subject.from(null, new MockProjectionCircularBDefinition().define().definition).subscribe(event => events.push(event));
            expect(events).to.have.length(0);
        });
    });
});