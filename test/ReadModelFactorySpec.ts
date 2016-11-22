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
import {Event} from "../scripts/streams/Event";

describe("Given a Read Model Factory", () => {

    let registry: TypeMoq.Mock<IProjectionRegistry>,
        subject: ReadModelFactory,
        notifications:Event[],
        event:Event;

    beforeEach(() => {
        notifications = [];
        registry = TypeMoq.Mock.ofType(MockProjectionRegistry);
        subject = new ReadModelFactory(registry.object);
        event = {
            type: "CircularA",
            payload: null,
            timestamp: new Date(10),
            splitKey: null
        };
        subject.publish(event);
    });

    context("when a read model is handled by a projection", () => {
        beforeEach(() => {
            let circularAEntry = new RegistryEntry(new MockProjectionCircularADefinition().define(), null);
            registry.setup(r => r.getEntry("CircularA", null)).returns(a => {
                return {area: "Admin", data: circularAEntry};
            });
        });

        it("should emit the readmodel", () => {
            subject.from(null, new MockProjectionCircularBDefinition().define().definition).subscribe(event => notifications.push(event));
            expect(notifications).to.have.length(1);
            expect(notifications[0]).to.be.eql(event);
        });
    });

    context("when a read model is not handled by a projection", () => {
        beforeEach(() => {
            registry.setup(r => r.getEntry("$init", null)).returns(a => {
                return {area: "Admin", data: null};
            });
            registry.setup(r => r.getEntry("TestEvent", null)).returns(a => {
                return {area: "Admin", data: null};
            });
        });

        it("should not emit the readmodel", () => {
            subject.from(null, new MockProjectionDefinition().define().definition).subscribe(event => notifications.push(event));
            expect(notifications).to.have.length(0);
        });
    });
});