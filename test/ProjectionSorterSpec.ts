import "bluebird";
import "reflect-metadata";
import expect = require("expect.js");
import sinon = require("sinon");
import IProjectionRegistry from "../scripts/registry/IProjectionRegistry";
import MockProjectionDefinition from "./fixtures/definitions/MockProjectionDefinition";
import SinonStub = Sinon.SinonStub;
import ProjectionSorter from "../scripts/projections/ProjectionSorter";
import IProjectionSorter from "../scripts/projections/IProjectionSorter";
import {
    MockProjectionCircularADefinition,
    MockProjectionCircularBDefinition
} from "./fixtures/definitions/MockProjectionCircularDefinition";
import {MockProjectionRegistry} from "./fixtures/MockProjectionRegistry";

describe("ProjectionSorterSpec, check if two projection are circular", () => {

    let registry:IProjectionRegistry,
        subject: IProjectionSorter;

    beforeEach(() => {
        registry = new MockProjectionRegistry();
        subject = new ProjectionSorter(registry,require('toposort'));
    });

    context("not circular projections", () => {
        beforeEach(() => {
            registry.add(MockProjectionCircularADefinition).forArea("Admin");
            registry.add(MockProjectionDefinition).forArea("Test");
        });

        it('subject is a ProjectionSorter', () => {
            expect(subject).to.be.a(ProjectionSorter);
        });

        it('should expose a topologicSort function', () => {
            expect(subject.topologicSort).to.be.a('function');
        });

        it("should not trigger a circular error", () => {
            expect(subject.topologicSort()).to.be.an('array');
        });
    });

    context("circular projections", () => {
        beforeEach(() => {
            registry.add(MockProjectionCircularADefinition).forArea("Admin");
            registry.add(MockProjectionCircularBDefinition).forArea("Admin");
        });

        it('subject is a ProjectionSorter', () => {
            expect(subject).to.be.a(ProjectionSorter);
        });

        it('should expose a topologicSort function', () => {
            expect(subject.topologicSort).to.be.a('function');
        });

        it("should trigger a circular error", () => {
            expect(() => subject.topologicSort()).to.throwError();
        });
    });


});