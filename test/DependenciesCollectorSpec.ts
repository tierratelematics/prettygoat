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
import DependenciesCollector from "../scripts/collector/DependenciesCollector";
import IDependenciesCollector from "../scripts/collector/IDependenciesCollector";

describe("DipendenciesCollectorSpec, given a collector of Dependencies", () => {

    let registry:TypeMoq.Mock<IProjectionRegistry>,
        subject:IDependenciesCollector;

    beforeEach(() => {
        registry = TypeMoq.Mock.ofType(MockProjectionRegistry);
        subject = new DependenciesCollector(registry.object);
        registry.setup(r => r.getEntry("$init", null)).returns(a => {
            return {area: "Admin", data: null};
        });
        registry.setup(r => r.getEntry("TestEvent", null)).returns(a => {
            return {area: "Admin", data: null};
        });
    });

    context("when a registred projection not contain any references", () => {
        beforeEach(() => {
            let mockEntry = new RegistryEntry(new MockProjectionDefinition().define(), null);
        });

        it("should have a empty collection of references", () => {
            expect(subject.getDependencyCollection(new MockProjectionDefinition().define())).to.eql([]);
        });
    });

    context("when a registred projection contain at least one reference", () => {
        beforeEach(() => {
            let circularBEntry = new RegistryEntry(new MockProjectionCircularBDefinition().define(), null);
            registry.setup(r => r.getEntry("CircularB", null)).returns(a => {
                return {area: "Admin", data: circularBEntry};
            });
        });

        it("should not have a empty collection of references", () => {
            expect(subject.getDependencyCollection(new MockProjectionCircularADefinition().define())).to.eql(["Circular B"]);
        });
    });


});