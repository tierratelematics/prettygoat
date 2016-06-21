import "bluebird";
import "reflect-metadata";
import { IProjection } from "../scripts/projections/IProjection";
import { ProjectionAnalyzer, ProjectionErrors } from "../scripts/projections/ProjectionAnalyzer";
import expect = require("expect.js");

describe("Given a ProjectionAnalyzer", () => {
    let subject: ProjectionAnalyzer;

    beforeEach(() => subject = new ProjectionAnalyzer());

    context("when analyzing a projection", () => {
        it("should check it has a name", () => {
            let result = subject.analyze(<IProjection<number>>{ definition: {} });
            expect(result).to.eql([ProjectionErrors.NoName]);
        });
        it("should check it has an event application definition", () => {
            let result = subject.analyze(<IProjection<number>>{ name: "-" });
            expect(result).to.eql([ProjectionErrors.NoDefinition]);
        });

        context("and one or more checks fail", () => {
            it("should return all the failed checks", () => {
                let result = subject.analyze(<IProjection<number>>{});
                expect(result).to.eql([ProjectionErrors.NoName, ProjectionErrors.NoDefinition]);
            });
        });
    });
});
