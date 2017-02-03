import "reflect-metadata";
import expect = require("expect.js");
import Dictionary from "../../scripts/util/Dictionary";
import IProjectionRunner from "../../scripts/projections/IProjectionRunner";
import * as TypeMoq from "typemoq";
import MockProjectionRunner from "../fixtures/MockProjectionRunner";
import {ISubject, Subject} from "rx";
import {IRequest, IResponse, IRequestHandler} from "../../scripts/web/IRequestComponents";
import MockRequest from "../fixtures/web/MockRequest";
import MockResponse from "../fixtures/web/MockResponse";
import {
    ProjectionPauseHandler, ProjectionStopHandler,
    ProjectionResumeHandler
} from "../../scripts/api/ProjectionsHandlers";

describe("Given a ProjectionsController and a projection name", () => {
    let holder: Dictionary<IProjectionRunner<any>>,
        projectionRunner: TypeMoq.IMock<IProjectionRunner<any>>,
        request: IRequest,
        response: TypeMoq.IMock<IResponse>,
        subject: IRequestHandler;

    beforeEach(
        () => {
            holder = {};
            projectionRunner = TypeMoq.Mock.ofType(MockProjectionRunner);
            holder["nameProjection"] = projectionRunner.object;
            request = new MockRequest();
            response = TypeMoq.Mock.ofType(MockResponse);
            response.setup(s => s.status(TypeMoq.It.isAny())).returns(a => response.object);
        }
    );


    context("when there isn't a projection with that name", () => {
        beforeEach(() => {
            beforeEach(() => request.params = {projectionName: "errorProjection"});
            subject = new ProjectionPauseHandler(holder);
        });

        it("should trigger an error", () => {
            subject.handle(request, response.object);
            response.verify(s => s.status(404), TypeMoq.Times.exactly(1));
            response.verify(s => s.send(TypeMoq.It.isAny()), TypeMoq.Times.exactly(1));
            projectionRunner.verify(s => s.pause(), TypeMoq.Times.never());
        });
    });

    context("when there is a projection with that name ", () => {
        beforeEach(() => request.params = {projectionName: "nameProjection"});

        context("and a stop command is sent", () => {
            beforeEach(() => subject = new ProjectionStopHandler(holder));
            context("and the projection is already stopped", () => {
                beforeEach(() => {
                    projectionRunner.setup(s => s.stop()).throws(new Error());
                });

                it("should trigger an error", () => {
                    subject.handle(request, response.object);
                    response.verify(s => s.status(404), TypeMoq.Times.once());
                    projectionRunner.verify(s => s.stop(), TypeMoq.Times.once());
                });
            });

            context("and the projection is not stopped", () => {
                it("should stop it", () => {
                    subject.handle(request, response.object);
                    response.verify(s => s.status(404), TypeMoq.Times.never());
                    projectionRunner.verify(s => s.stop(), TypeMoq.Times.once());
                });

            });
        });

        context("and a resume command is sent", () => {
            beforeEach(() => subject = new ProjectionResumeHandler(holder));
            context("and the projection is not paused", () => {
                beforeEach(() => projectionRunner.setup(s => s.resume()).throws(new Error()));

                it("trigger an error", () => {
                    subject.handle(request, response.object);
                    response.verify(s => s.status(404), TypeMoq.Times.once());
                    projectionRunner.verify(s => s.resume(), TypeMoq.Times.once());
                });
            });

            context("and the projection is paused", () => {
                it("should resume it", () => {
                    subject.handle(request, response.object);
                    response.verify(s => s.status(404), TypeMoq.Times.never());
                    projectionRunner.verify(s => s.resume(), TypeMoq.Times.once());
                });

            });

        });

        context("and a pause command is sent", () => {
            beforeEach(() => subject = new ProjectionPauseHandler(holder));
            context("and the projection is not started", () => {
                beforeEach(() => {
                    projectionRunner.setup(s => s.pause()).throws(new Error());
                });

                it("trigger an error", () => {
                    subject.handle(request, response.object);
                    response.verify(s => s.status(404), TypeMoq.Times.once());
                    projectionRunner.verify(s => s.pause(), TypeMoq.Times.once());
                });
            });

            context("and the projection is started", () => {
                it("should pause it", () => {
                    subject.handle(request, response.object);
                    response.verify(s => s.status(404), TypeMoq.Times.never());
                    projectionRunner.verify(s => s.pause(), TypeMoq.Times.once());
                });

            });

        });

    });
});
