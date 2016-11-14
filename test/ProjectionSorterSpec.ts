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
import {MockProjectionCircularADefinition} from "./fixtures/definitions/MockProjectionCircularDefinition";

describe("ProjectionSorterSpec, check if two projection are circular", () => {

    let subject:IProjectionRegistry,
        objectContainer:TypeMoq.Mock<IObjectContainer>,
        tickScheduler:ITickScheduler,
        sorterProjection: TypeMoq.Mock<IProjectionSorter>,
        holder:Dictionary<ITickScheduler>,
        firstProjection:IProjection<any>;

    beforeEach(() => {
        let analyzer = new ProjectionAnalyzer();
        objectContainer = TypeMoq.Mock.ofType(MockObjectContainer);
        sorterProjection = TypeMoq.Mock.ofType(ProjectionSorter);
        tickScheduler = new TickScheduler(null);
        holder = {};
        subject = new ProjectionRegistry(analyzer, objectContainer.object, () => tickScheduler, holder);
        firstProjection = new MockProjectionCircularADefinition().define();
    });

    context("not circular projection", () => {
        beforeEach(() => {
            subject.add(MockProjectionCircularADefinition).forArea("Admin");
        });

        it("should first projection not have a link with the second projection", () => {
            sorterProjection.setup(p => p.getDependecy(TypeMoq.It.isValue(firstProjection))).returns(o => []);
        });

    });

});