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

// describe("Given a Read Model Factory", () => {
//
//     let registry: TypeMoq.Mock<IProjectionRegistry>,
//         subject: IDependenciesCollector;
//
//     beforeEach(() => {
//         registry = TypeMoq.Mock.ofType(MockProjectionRegistry);
//         subject = new DependenciesCollector(registry.object);
//         registry.setup(r => r.getEntry("$init", null)).returns(a => {
//             return {area: "Admin", data: null};
//         });
//         registry.setup(r => r.getEntry("TestEvent", null)).returns(a => {
//             return {area: "Admin", data: null};
//         });
//     });
//
//     context("when a projection has no dependencies", () => {
//         it("should return an empty list of dependencies", () => {
//             expect(subject.getDependenciesFor(new MockProjectionDefinition().define())).to.eql([]);
//         });
//     });
//
//     context("when a projection has at least a dependency", () => {
//         beforeEach(() => {
//             let circularAEntry = new RegistryEntry(new MockProjectionCircularADefinition().define(), null);
//             registry.setup(r => r.getEntry("CircularA", null)).returns(a => {
//                 return {area: "Admin", data: circularAEntry};
//             });
//         });
//
//         it("should return the list of dependencies", () => {
//             expect(subject.getDependenciesFor(new MockProjectionCircularBDefinition().define())).to.eql(["CircularA"]);
//         });
//     });
// });