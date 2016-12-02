import "bluebird";
import "reflect-metadata";
import expect = require("expect.js");
import ProjectionsManager from "../scripts/controllers/ProjectionsManager";
import Dictionary from "../scripts/Dictionary";
import IProjectionRunner from "../scripts/projections/IProjectionRunner";
import IProjectionsManager from "../scripts/controllers/IProjectionsManager";
import MockRequest from "./fixtures/express/MockRequest";
import * as TypeMoq from "typemoq";
import {Response,Request} from "express";
import MockProjectionRunner from "./fixtures/MockProjectionRunner";
import MockResponse from "./fixtures/express/MockResponse";

describe("Given a ProjectionsService, and a projection name", () => {
    let holder:Dictionary<any>,
        projectionRunner:TypeMoq.Mock<IProjectionRunner<any>>,
        request:TypeMoq.Mock<Request>,
        response:TypeMoq.Mock<Response>,
        responseStatus:TypeMoq.Mock<Response>,
        subject: IProjectionsManager,
        nameProjection:string;

    beforeEach(
        () => {
            holder = {};
            projectionRunner = TypeMoq.Mock.ofType(MockProjectionRunner);
            holder['nameProjection'] = projectionRunner;
            request = TypeMoq.Mock.ofType(MockRequest);
            response = TypeMoq.Mock.ofType(MockResponse);
            responseStatus = TypeMoq.Mock.ofType(MockResponse);
            subject = new ProjectionsManager(holder);
        }
    );

    context("and there isn't a projection with that name", () => {
        beforeEach( () => {
            request.setup(s => s.param("name")).returns(a => "errorProjection");
        });

        it("should trigger an error", () => {
            subject.pause(request.object,response.object);
            response.verify(s => s.status(500), TypeMoq.Times.once());
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
