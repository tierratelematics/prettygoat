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
            projectionRunner.verify(s => s.pause(), TypeMoq.Times.never());
            projectionRunner.verify(s => s.stop(), TypeMoq.Times.never());
            projectionRunner.verify(s => s.resume(), TypeMoq.Times.never());
        });
    });

    context("and there is a projection with that name ", () => {
        beforeEach(() => {
            request.object.body = {name: "nameProjection"};
        });

        context("and want to stop it", () => {

            context("and the projection is already stopped", () => {
                beforeEach(() => {
                    projectionRunner.setup(s => s.stop()).throws(new Error());
                });

                it("should trigger an error", () => {
                    subject.stop(request.object, response.object);
                    response.verify(s => s.status(400), TypeMoq.Times.once());
                    projectionRunner.verify(s => s.stop(), TypeMoq.Times.once());
                });
            });

            context("and the projection is not stopped", () => {

                it("should stop it", () => {
                    subject.stop(request.object, response.object);
                    response.verify(s => s.status(400), TypeMoq.Times.never());
                    projectionRunner.verify(s => s.stop(), TypeMoq.Times.once());
                });

            });

        });

        context("and want to resume it", () => {

            context("and the projection is not paused", () => {
                beforeEach(() => {
                    projectionRunner.setup(s => s.resume()).throws(new Error());
                });

                it("trigger an error", () => {
                    subject.resume(request.object, response.object);
                    response.verify(s => s.status(400), TypeMoq.Times.once());
                    projectionRunner.verify(s => s.resume(), TypeMoq.Times.once());
                });
            });

            context("and the projection is paused", () => {

                it("should resume it", () => {
                    subject.resume(request.object, response.object);
                    response.verify(s => s.status(400), TypeMoq.Times.never());
                    projectionRunner.verify(s => s.resume(), TypeMoq.Times.once());
                });

            });

        });

        context("and want to pause it", () => {

            context("and the projection is not runned", () => {
                beforeEach(() => {
                    projectionRunner.setup(s => s.pause()).throws(new Error());
                });

                it("trigger an error", () => {
                    subject.pause(request.object, response.object);
                    response.verify(s => s.status(400), TypeMoq.Times.once());
                    projectionRunner.verify(s => s.pause(), TypeMoq.Times.once());
                });
            });

            context("and the projection is runned", () => {

                it("should stop it", () => {
                    subject.pause(request.object, response.object);
                    response.verify(s => s.status(400), TypeMoq.Times.never());
                    projectionRunner.verify(s => s.pause(), TypeMoq.Times.once());
                });

            });

        });

    });

});
