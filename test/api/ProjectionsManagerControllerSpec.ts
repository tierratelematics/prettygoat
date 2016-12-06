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
import ProjectionsManagerController from "../../scripts/api/ProjectionsManagerController";

describe("Given a ProjectionsService, and a projection name", () => {
    let holder: Dictionary<any>,
        projectionRunner: TypeMoq.Mock<IProjectionRunner<any>>,
        request: TypeMoq.Mock<Request>,
        response: TypeMoq.Mock<Response>,
        subject: ProjectionsManagerController,
        nameProjection: string;

    beforeEach(
        () => {
            holder = {};
            projectionRunner = TypeMoq.Mock.ofType(MockProjectionRunner);
            holder['nameProjection'] = projectionRunner;
            request = TypeMoq.Mock.ofType(MockRequest);
            response = TypeMoq.Mock.ofType(MockResponse);
            subject = new ProjectionsManagerController(holder);
        }
    );

    context("and there isn't a projection with that name", () => {
        beforeEach(() => {
            request.object.body = {name: "errorProjection"};
            response.setup(s => s.status(TypeMoq.It.isAny())).returns(a => response.object);
        });

        it("should trigger an error", () => {
            subject.pause(request.object, response.object);
            subject.stop(request.object, response.object);
            subject.resume(request.object, response.object);
            response.verify(s => s.status(400), TypeMoq.Times.exactly(3));
        });
    });

    context("there is a projection with that name ", () => {

        context("and want to stop it", () => {

            context("and the projection is not runned", () => {
                it("should erase an error", () => {
                    // let result = subject.analyze(<IProjection<number>>{});
                    // expect(result).to.eql([ProjectionErrors.NoName, ProjectionErrors.NoDefinition]);
                });
            });

            context("and the projection is runned", () => {
                it("should stop it", () => {
                    // let result = subject.analyze(<IProjection<number>>{});
                    // expect(result).to.eql([ProjectionErrors.NoName, ProjectionErrors.NoDefinition]);
                });
            });

        });

        context("and want to resume it", () => {

            context("and the projection is not paused", () => {
                it("should erase an error", () => {
                    // let result = subject.analyze(<IProjection<number>>{});
                    // expect(result).to.eql([ProjectionErrors.NoName, ProjectionErrors.NoDefinition]);
                });
            });

            context("and the projection is paused", () => {
                it("should resume it", () => {
                    // let result = subject.analyze(<IProjection<number>>{});
                    // expect(result).to.eql([ProjectionErrors.NoName, ProjectionErrors.NoDefinition]);
                });
            });

        });


        context("and want to pause it", () => {

            context("and the projection is not runned", () => {
                it("should erase an error", () => {
                    // let result = subject.analyze(<IProjection<number>>{});
                    // expect(result).to.eql([ProjectionErrors.NoName, ProjectionErrors.NoDefinition]);
                });
            });

            context("and the projection is runned", () => {
                it("should stop it", () => {
                    // let result = subject.analyze(<IProjection<number>>{});
                    // expect(result).to.eql([ProjectionErrors.NoName, ProjectionErrors.NoDefinition]);
                });
            });

        });


    });

});
