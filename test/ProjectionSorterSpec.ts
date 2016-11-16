import "bluebird";
import "reflect-metadata";
import expect = require("expect.js");
import sinon = require("sinon");
import * as TypeMoq from "typemoq";
import IProjectionRegistry from "../scripts/registry/IProjectionRegistry";
import ProjectionRegistry from "../scripts/registry/ProjectionRegistry";
import MockProjectionDefinition from "./fixtures/definitions/MockProjectionDefinition";
import SinonStub = Sinon.SinonStub;
import UnnamedProjectionDefinition from "./fixtures/definitions/UnnamedProjectionDefinition";
import MockBadProjectionDefinition from "./fixtures/definitions/MockBadProjectionDefinition";
import {ProjectionAnalyzer} from "../scripts/projections/ProjectionAnalyzer";
import MockObjectContainer from "./fixtures/MockObjectContainer";
import IProjectionRunner from "../scripts/projections/IProjectionRunner";
import {ProjectionRunner} from "../scripts/projections/ProjectionRunner";
import IObjectContainer from "../scripts/bootstrap/IObjectContainer";
import IProjectionDefinition from "../scripts/registry/IProjectionDefinition";
import ITickScheduler from "../scripts/ticks/ITickScheduler";
import TickScheduler from "../scripts/ticks/TickScheduler";
import Dictionary from "../scripts/Dictionary";
import MockDateRetriever from "./fixtures/MockDateRetriever";
import ProjectionSorter from "../scripts/projections/ProjectionSorter";
import IProjectionSorter from "../scripts/projections/IProjectionSorter";
import {IProjection} from "../scripts/projections/IProjection";
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
    });

    context("not circular projections", () => {
        beforeEach(() => {
            registry.add(MockProjectionCircularADefinition).forArea("Admin");
            registry.add(MockProjectionDefinition).forArea("Test");
            subject = new ProjectionSorter(registry,require('toposort'));
        });

        it('subject is a ProjectionSorter', () => {
            expect(subject).to.be.a(ProjectionSorter);
        });

        it('should expose a topologicSort function', () => {
            expect(subject.topologicSort).to.be.a('function');
        });

        it("should not trigger an error", () => {
            expect(subject.topologicSort()).to.be.an('array');
        });
    });

    context("circular projections", () => {
        beforeEach(() => {
            registry.add(MockProjectionCircularADefinition).forArea("Admin");
            registry.add(MockProjectionCircularBDefinition).forArea("Admin");
            subject = new ProjectionSorter(registry,require('toposort'));
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