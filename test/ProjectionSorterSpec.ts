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
import {IProjection} from "../scripts/projections/IProjection";
import {MainProjection, Dependent1, Dependent2} from "./fixtures/definitions/DependentsDefinitions";

describe("ProjectionSorterSpec, given a projection sorter", () => {

    let registry: TypeMoq.Mock<IProjectionRegistry>,
        subject: IProjectionSorter,
        circularBProjection: IProjection<number>;

    beforeEach(() => {
        registry = TypeMoq.Mock.ofType(MockProjectionRegistry);
        subject = new ProjectionSorter(registry.object);
        registry.setup(r => r.getEntry("$init", null)).returns(() => {
            return {area: "Admin", data: null};
        });
        registry.setup(r => r.getEntry("TestEvent", null)).returns(() => {
            return {area: "Admin", data: null};
        });
    });

    context("when some registered projections do not contain any circular references", () => {
        beforeEach(() => {
            let circularAEntry = new RegistryEntry(new MockProjectionCircularADefinition().define(), null);
            let mockEntry = new RegistryEntry(new MockProjectionDefinition().define(), null);
            registry.setup(r => r.getAreas()).returns(a => [new AreaRegistry("Admin", [circularAEntry, mockEntry])]);
            registry.setup(r => r.getEntry("CircularB", null)).returns(() => {
                return {area: "Admin", data: null};
            });
            registry.setup(r => r.getEntry("test", null)).returns(() => {
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
            registry.setup(r => r.getEntry("CircularA", null)).returns(() => {
                return {area: "Admin", data: circularAEntry};
            });
            registry.setup(r => r.getEntry("CircularB", null)).returns(() => {
                return {area: "Admin", data: circularBEntry};
            });
        });

        it("should throw an error", () => {
            expect(() => subject.sort()).to.throwError();
        });
    });

    context("when the dependencies of a projection are needed", () => {
        beforeEach(() => {
            circularBProjection = new MockProjectionCircularBDefinition().define();
            let circularAEntry = new RegistryEntry(new MockProjectionCircularADefinition().define(), null);
            registry.setup(r => r.getEntry("CircularA", null)).returns(() => {
                return {area: "Admin", data: circularAEntry};
            });
        });

        it("should list the dependencies", () => {
            expect(subject.dependencies(circularBProjection)).to.eql([
                "CircularA"
            ]);
        });
    });

    context("when the dependents of a projection are needed", () => {
        beforeEach(() => {
            let mainEntry = new RegistryEntry(new MainProjection().define(), null);
            let dependent1Entry = new RegistryEntry(new Dependent1().define(), null);
            let dependent2Entry = new RegistryEntry(new Dependent2().define(), null);
            registry.setup(r => r.getEntry("main", null)).returns(() => {
                return {area: "Admin", data: mainEntry};
            });
            registry.setup(r => r.getEntry("dependent1", null)).returns(() => {
                return {area: "Admin", data: dependent1Entry};
            });
            registry.setup(r => r.getEntry("dependent2", null)).returns(() => {
                return {area: "Admin", data: dependent2Entry};
            });
            registry.setup(r => r.getAreas()).returns(a => [new AreaRegistry("Admin", [mainEntry, dependent1Entry, dependent2Entry])]);
        });

        it("should list them", () => {
            expect(subject.dependents(new MainProjection().define())).to.eql([
                "dependent1", "dependent2"
            ]);
        });
    });

});