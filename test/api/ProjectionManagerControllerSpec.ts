import "bluebird";
import "reflect-metadata";
import expect = require("expect.js");
import Dictionary from "../../scripts/Dictionary";
import IProjectionRunner from "../../scripts/projections/IProjectionRunner";
import MockRequest from "../fixtures/express/MockRequest";
import * as TypeMoq from "typemoq";
import {Response, Request} from "express";
import MockProjectionRunner from "../fixtures/MockProjectionRunner";
import MockResponse from "../fixtures/express/MockResponse";
import ProjectionsManagerController from "../../scripts/api/ProjectionManagerController";
import {ProjectionRunnerStatus} from "../../scripts/projections/ProjectionRunnerStatus";

describe("Given a ProjectionsService, and a projection name", () => {
    let holder: Dictionary<IProjectionRunner<any>>,
        projectionRunner: TypeMoq.Mock<IProjectionRunner<any>>,
        request: TypeMoq.Mock<Request>,
        response: TypeMoq.Mock<Response>,
        subject: ProjectionsManagerController;

    beforeEach(
        () => {
            holder = {};
            projectionRunner = TypeMoq.Mock.ofType(MockProjectionRunner);
            holder["nameProjection"] = projectionRunner.object;
            request = TypeMoq.Mock.ofType(MockRequest);
            response = TypeMoq.Mock.ofType(MockResponse);
            response.setup(s => s.status(TypeMoq.It.isAny())).returns(a => response.object);
            subject = new ProjectionsManagerController(holder);
        }
    );

    context("and there isn't a projection with that name", () => {
        beforeEach(() => {
            request.object.body = {name: "errorProjection"};
        });

        it("should trigger an error", () => {
            subject.pause(request.object, response.object);
            subject.stop(request.object, response.object);
            subject.resume(request.object, response.object);
            response.verify(s => s.status(400), TypeMoq.Times.exactly(3));
            response.verify(s => s.status(200), TypeMoq.Times.never());
        });
    });

    context("there is a projection with that name ", () => {
        beforeEach(() => {
            request.object.body = {name: "nameProjection"};
        });

        context("and want to stop it", () => {

            context("and the projection is stopped", () => {
                beforeEach(() => {
                    projectionRunner.object.status = ProjectionRunnerStatus.Stop;
                });

                it("should erase an error", () => {
                    subject.stop(request.object, response.object);
                    response.verify(s => s.status(400), TypeMoq.Times.once());
                });
            });

            context("and the projection is not stopped", () => {
                beforeEach(() => {
                    projectionRunner.object.status = ProjectionRunnerStatus.Run;
                });

                it("should stop it", () => {
                    subject.stop(request.object, response.object);
                    response.verify(s => s.status(400), TypeMoq.Times.never());
                });
            });

        });

        context("and want to resume it", () => {

            context("and the projection is not paused", () => {
                beforeEach(() => {
                    projectionRunner.object.status = ProjectionRunnerStatus.Stop;
                });

                it("should erase an error", () => {
                    subject.resume(request.object, response.object);
                    response.verify(s => s.status(400), TypeMoq.Times.once());
                });
            });

            context("and the projection is paused", () => {
                beforeEach(() => {
                    projectionRunner.object.status = ProjectionRunnerStatus.Pause;
                });

                it("should resume it", () => {
                    subject.resume(request.object, response.object);
                    response.verify(s => s.status(400), TypeMoq.Times.never());
                });
            });

        });

        context("and want to pause it", () => {

            context("and the projection is not runned", () => {
                beforeEach(() => {
                    projectionRunner.object.status = ProjectionRunnerStatus.Stop;
                });

                it("should erase an error", () => {
                    subject.pause(request.object, response.object);
                    response.verify(s => s.status(400), TypeMoq.Times.once());
                });
            });

            context("and the projection is runned", () => {
                beforeEach(() => {
                    projectionRunner.object.status = ProjectionRunnerStatus.Run;
                });

                it("should stop it", () => {
                    subject.pause(request.object, response.object);
                    response.verify(s => s.status(400), TypeMoq.Times.never());
                });
            });

        });

    });

});
