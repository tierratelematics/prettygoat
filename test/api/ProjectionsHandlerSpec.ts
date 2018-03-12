import "reflect-metadata";
import expect = require("expect.js");
import Dictionary from "../../scripts/common/Dictionary";
import {IProjectionRunner} from "../../scripts/projections/IProjectionRunner";
import {Mock, IMock, Times, It} from "typemoq";
import MockProjectionRunner from "../fixtures/MockProjectionRunner";
import {IRequest, IResponse, IRequestHandler} from "../../scripts/web/IRequestComponents";
import MockRequest from "../fixtures/web/MockRequest";
import IProjectionEngine from "../../scripts/projections/IProjectionEngine";
import {ISnapshotRepository} from "../../scripts/snapshots/ISnapshotRepository";
import {IProjection} from "../../scripts/projections/IProjection";
import MockProjectionDefinition from "../fixtures/definitions/MockProjectionDefinition";
import {
    ProjectionStopHandler, ProjectionRestartHandler,
    ProjectionStateApiHandler,
    ProjectionStatsHandler
} from "../../scripts/api/ProjectionsHandlers";
import {IProjectionRegistry} from "../../scripts/bootstrap/ProjectionRegistry";
const cbuffer = require("CBuffer");

describe("Given a ProjectionsController and a projection name", () => {
    let holder: Dictionary<IProjectionRunner<any>>,
        projectionRunner: IMock<IProjectionRunner<any>>,
        request: IRequest,
        response: IMock<IResponse>,
        subject: IRequestHandler;

    beforeEach(() => {
        holder = {};
        projectionRunner = Mock.ofType(MockProjectionRunner);
        holder["Mock"] = projectionRunner.object;
        request = new MockRequest();
        response = Mock.ofType<IResponse>();
    });

    context("when there isn't a projection with that name", () => {
        beforeEach(() => {
            request.body = {payload: {projectionName: "errorProjection"}};
            subject = new ProjectionStopHandler(holder);
        });

        it("should trigger an error", () => {
            subject.handle(request, response.object);
            response.verify(s => s.status(404), Times.exactly(1));
            response.verify(s => s.send(It.isAny()), Times.exactly(1));
            projectionRunner.verify(s => s.stop(), Times.never());
        });
    });

    context("when there is a projection with that name", () => {
        beforeEach(() => request.body = {payload: {projectionName: "Mock"}});

        context("and a stop command is sent", () => {
            beforeEach(() => subject = new ProjectionStopHandler(holder));
            context("and the projection is already stopped", () => {
                beforeEach(() => {
                    projectionRunner.setup(s => s.stop()).throws(new Error());
                });

                it("should trigger an error", () => {
                    subject.handle(request, response.object);
                    response.verify(s => s.status(404), Times.once());
                    projectionRunner.verify(s => s.stop(), Times.once());
                });
            });

            context("and the projection is not stopped", () => {
                it("should stop it", () => {
                    subject.handle(request, response.object);
                    response.verify(s => s.status(404), Times.never());
                    projectionRunner.verify(s => s.stop(), Times.once());
                });
            });
        });

        context("and a restart command is sent", () => {
            let projectionEngine: IMock<IProjectionEngine>;
            let snapshotRepository: IMock<ISnapshotRepository>;
            let registry: IMock<IProjectionRegistry>;
            let projection: IProjection<any>;

            beforeEach(() => {
                projection = new MockProjectionDefinition().define();
                registry = Mock.ofType<IProjectionRegistry>();
                projectionEngine = Mock.ofType<IProjectionEngine>();
                snapshotRepository = Mock.ofType<ISnapshotRepository>();
                registry.setup(r => r.projectionFor("Mock")).returns(() => ["Admin", projection]);
                snapshotRepository.setup(s => s.deleteSnapshot("Mock")).returns(() => Promise.resolve());
                subject = new ProjectionRestartHandler(holder, registry.object, projectionEngine.object, snapshotRepository.object);
            });
            context("when the projection is already stopped", () => {
                it("should simply restart the projection", async () => {
                    await subject.handle(request, response.object);

                    snapshotRepository.verify(s => s.deleteSnapshot("Mock"), Times.once());
                    projectionEngine.verify(p => p.run(It.isValue(projection)), Times.once());
                });
            });

            context("when the projection is running", () => {
                beforeEach(() => holder["Mock"].stats.running = true);
                it("should stop and restart the projection", async () => {
                    await subject.handle(request, response.object);

                    projectionRunner.verify(p => p.stop(), Times.once());
                    snapshotRepository.verify(s => s.deleteSnapshot("Mock"), Times.once());
                    projectionEngine.verify(p => p.run(It.isValue(projection)), Times.once());
                });
            });
        });
    });
    context("when the state of the projection is needed", () => {
        beforeEach(() => {
            projectionRunner.object.state = {
                "test": 20
            };
            subject = new ProjectionStateApiHandler(holder);
            request.params = {projectionName: "Mock"};
        });
        it("should be printed", async () => {
            await subject.handle(request, response.object);

            response.verify(s => s.send(It.isValue({
                "test": 20
            })), Times.once());
        });
    });

    context("when the stats of a projection are needed", () => {
        beforeEach(() => {
            projectionRunner.object.state = "test";
            let eventsBuffer = new cbuffer(50);
            eventsBuffer.push({
                type: "test",
                payload: "payload-test"
            });
            eventsBuffer.push({
                type: "test2",
                payload: "payload-test2"
            });
            projectionRunner.object.stats.events = 2;
            projectionRunner.object.stats.failed = false;
            projectionRunner.object.stats.realtime = true;
            projectionRunner.object.stats.running = true;
            projectionRunner.object.stats.lastEvents = eventsBuffer;
            subject = new ProjectionStatsHandler(holder);
            request.params = {projectionName: "Mock"};
        });
        it("should return them", async () => {
            await subject.handle(request, response.object);

            response.verify(s => s.send(It.isValue({
                name: "Mock",
                size: 8,
                humanizedSize: "8 bytes",
                events: 2,
                failed: false,
                realtime: true,
                running: true,
                lastEvents: [
                    {
                        type: "test",
                        payload: "payload-test"
                    },
                    {
                        type: "test2",
                        payload: "payload-test2"
                    }
                ]
            })), Times.once());
        });
    });
});
