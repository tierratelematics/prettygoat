import "bluebird";
import "reflect-metadata";
import expect = require("expect.js");
import * as TypeMoq from "typemoq";
import IProjectionRegistry from "../scripts/registry/IProjectionRegistry";
import MockProjectionDefinition from "./fixtures/definitions/MockProjectionDefinition";
import ProjectionSorter from "../scripts/projections/ProjectionSorter";
import IProjectionSorter from "../scripts/projections/IProjectionSorter";
import {
    MockProjectionCircularADefinition,
    MockProjectionCircularBDefinition
} from "./fixtures/definitions/MockProjectionCircularDefinition";
import MockProjectionRegistry from "./fixtures/MockProjectionRegistry";
import AreaRegistry from "../scripts/registry/AreaRegistry";
import RegistryEntry from "../scripts/registry/RegistryEntry";

describe("ProjectionSorterSpec, given a projection sorter", () => {

    let registry:TypeMoq.Mock<IProjectionRegistry>,
        subject:IProjectionSorter;

    beforeEach(() => {
        registry = TypeMoq.Mock.ofType(MockProjectionRegistry);
        subject = new ProjectionSorter(registry.object);
        registry.setup(r => r.getEntry("$init", null)).returns(a => {
            return {area: "Admin", data: null};
        });
        registry.setup(r => r.getEntry("TestEvent", null)).returns(a => {
            return {area: "Admin", data: null};
        });
    });

    context("when some registered projections do not contain any circular references", () => {
        beforeEach(() => {
            let circularAEntry = new RegistryEntry(new MockProjectionCircularADefinition().define(), null);
            let mockEntry = new RegistryEntry(new MockProjectionDefinition().define(), null);
            registry.setup(r => r.getAreas()).returns(a => [new AreaRegistry("Admin", [circularAEntry, mockEntry])]);
            registry.setup(r => r.getEntry("CircularB", null)).returns(a => {
                return {area: "Admin", data: null};
            });
            registry.setup(r => r.getEntry("test", null)).returns(a => {
                return {area: "Admin", data: mockEntry};
            });
        });

        it("should sort the projections correctly", () => {
            expect(subject.sort()).to.eql([
                "CircularA", "test"
            ]);
        });
    });

    context("when some registered projections do contain some circular references", () => {
        beforeEach(() => {
            let circularAEntry = new RegistryEntry(new MockProjectionCircularADefinition().define(), null);
            let circularBEntry = new RegistryEntry(new MockProjectionCircularBDefinition().define(), null);
            registry.setup(r => r.getAreas()).returns(a => [new AreaRegistry("Admin", [circularAEntry, circularBEntry])]);
            registry.setup(r => r.getEntry("CircularA", null)).returns(a => {
                return {area: "Admin", data: circularAEntry};
            });
            registry.setup(r => r.getEntry("CircularB", null)).returns(a => {
                return {area: "Admin", data: circularBEntry};
            });
        });

        it("should trigger an exception regarding the circular dependency", () => {
            expect(() => subject.sort()).to.throwError();
        });
    });


});