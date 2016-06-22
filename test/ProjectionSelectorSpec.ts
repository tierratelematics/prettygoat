/// <reference path="../node_modules/typemoq/typemoq.node.d.ts" />
import {Mock, Times, It} from "typemoq";
import expect = require("expect.js");
import sinon = require("sinon");
import IProjectionSelector from "../scripts/projections/IProjectionSelector";
import ProjectionSelector from "../scripts/projections/ProjectionSelector";
import IProjectionRegistry from "../scripts/registry/IProjectionRegistry";
import IProjectionRunnerFactory from "../scripts/projections/IProjectionRunnerFactory";
import AreaRegistry from "../scripts/registry/AreaRegistry";
import RegistryEntry from "../scripts/registry/RegistryEntry";
import MockProjectionDefinition from "./fixtures/definitions/MockProjectionDefinition";
import SplitProjectionDefinition from "./fixtures/definitions/SplitProjectionDefinition";
import ProjectionRegistry from "../scripts/registry/ProjectionRegistry";
import ProjectionRunnerFactory from "../scripts/projections/ProjectionRunnerFactory";
import {ProjectionRunner} from "../scripts/projections/ProjectionRunner";

describe("Projection selector, given some registered projections", () => {

    let subject:IProjectionSelector,
        registry:Mock<IProjectionRegistry>,
        projectionRunnerFactory:Mock<IProjectionRunnerFactory>,
        mockProjection = new MockProjectionDefinition().define(),
        splitProjection = new SplitProjectionDefinition().define(),
        mockRunner = new ProjectionRunner(mockProjection, null, null, null, null),
        splitRunner = new ProjectionRunner(splitProjection, null, null, null, null);

    beforeEach(() => {
        registry = Mock.ofType<IProjectionRegistry>(ProjectionRegistry);
        projectionRunnerFactory = Mock.ofType<IProjectionRunnerFactory>(ProjectionRunnerFactory);
        registry.setup(r => r.getAreas()).returns(_ => [new AreaRegistry("Test", [
            new RegistryEntry(mockProjection, "Mock"),
            new RegistryEntry(splitProjection, "Split"),
        ])]);
        projectionRunnerFactory.setup(p => p.create(It.isAny())).returns(projection => {
            return projection.name === "test" ? mockRunner : splitRunner;
        });
        subject = new ProjectionSelector(registry.object, projectionRunnerFactory.object);
    });

    context("at startup", () => {
        it("should create the projection runners for those projections", () => {
            subject.initialize();
            projectionRunnerFactory.verify(p => p.create(It.isValue(mockProjection)), Times.once());
            projectionRunnerFactory.verify(p => p.create(It.isValue(splitProjection)), Times.once());
        });
    });

    context("when a new event is received", () => {
        beforeEach(() => subject.initialize());
        it("should return a list of the matching projection runners", () => {
            let runners = subject.projectionsFor({type: "OnlyEvent", payload: null});
            expect(runners).to.have.length(1);
            expect(runners[0]).to.be(mockRunner);
        });

        context("and needs to be handled on a split projection", () => {
            it("should create the child projection and return the list of matching projection runners", () => {
                subject.projectionsFor({
                    type: "TestEvent", payload: {
                        id: 10,
                        count: 30
                    }
                });
                let runners = subject.projectionsFor({
                    type: "TestEvent", payload: {
                        id: 20,
                        count: 30
                    }
                });
                expect(runners).to.have.length(2);
                expect(runners[0].state).to.be(10);
            });
        });
    });

    context("when the state of a split projection is needed", () => {
        it("should return the right projection runner", () => {
            let runner = subject.projectionFor("Test", "Mock", "10");
            expect(runner.state).to.be(10);
        });
    });
});