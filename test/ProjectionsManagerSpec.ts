import "bluebird";
import "reflect-metadata";
import { IProjection } from "../scripts/projections/IProjection";
import { ProjectionAnalyzer, ProjectionErrors } from "../scripts/projections/ProjectionAnalyzer";
import expect = require("expect.js");
import ProjectionsManager from "../scripts/controllers/ProjectionsManager";
import Dictionary from "../scripts/Dictionary";
import IProjectionRunner from "../scripts/projections/IProjectionRunner";
import MockProjectionRunner from "./fixtures/MockProjectionRunner";

describe("Given a ProjectionsManager, and a projection name", () => {
    let holder:Dictionary<IProjectionRunner<any>>,
        projectionRunner:TypeMoq.Mock<IProjectionRunner>,
        subject: ProjectionsManager;

    beforeEach(
        () => {
            projectionRunner = TypeMoq.Mock.ofType(MockProjectionRunner);
            holder['nameProjection'] = projectionRunner;
            subject = new ProjectionsManager(holder);
        }
    );

    context("and there isn't a projection with that name", () => {
        it("should trigger an error", () => {
            // let result = subject.analyze(<IProjection<number>>{ definition: {} });
            // expect(result).to.eql([ProjectionErrors.NoName]);
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
