import "reflect-metadata";
import expect = require("expect.js");
import * as TypeMoq from "typemoq";
import IProjectionRegistry from "../scripts/registry/IProjectionRegistry";
import RegistryEntry from "../scripts/registry/RegistryEntry";
import MockProjectionDefinition from "./fixtures/definitions/MockProjectionDefinition";
import MemoizingProjectionRegistry from "../scripts/registry/MemoizingProjectionRegistry";
import MockProjectionRegistry from "./fixtures/MockProjectionRegistry";

describe("Given a MemoizingProjectionRegistry", () => {

    let subject: IProjectionRegistry;
    let registry: TypeMoq.Mock<IProjectionRegistry>;
    let entry: RegistryEntry<any>;

    beforeEach(() => {
        entry = new RegistryEntry(new MockProjectionDefinition().define(), null);
        registry = TypeMoq.Mock.ofType(MockProjectionRegistry);
        registry.setup(r => r.getEntry("Foo", "Admin")).returns(() => {
            return {area: "Admin", data: entry};
        });
        subject = new MemoizingProjectionRegistry(registry.object);
    });

    context("when an entry is request", () => {
        context("and a cached one does not exist", () => {
            it("should retrieve it from the registry", () => {
                let cached = subject.getEntry("Foo", "Admin");
                expect(cached).to.eql({
                    area: "Admin", data: entry
                });
                registry.verify(r => r.getEntry("Foo", "Admin"), TypeMoq.Times.once());
            });
        });

        context("and a cached one exists", () => {
            beforeEach(() => subject.getEntry("Foo", "Admin"));
            it("should serve it from cache", () => {
                let cached = subject.getEntry("Foo", "Admin");
                expect(cached).to.eql({
                    area: "Admin", data: entry
                });
                registry.verify(r => r.getEntry("Foo", "Admin"), TypeMoq.Times.once());
            });
        });
    });
});