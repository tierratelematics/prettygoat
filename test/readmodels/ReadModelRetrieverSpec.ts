import "reflect-metadata";
import expect = require("expect.js");
import {Mock} from "typemoq";
import {IReadModelRetriever, ReadModelRetriever} from "../../scripts/readmodels/ReadModelRetriever";
import {IProjectionRunner} from "../../scripts/projections/IProjectionRunner";
import Dictionary from "../../scripts/common/Dictionary";

describe("Given a readmodel provider", () => {
    let subject: IReadModelRetriever;
    let runners: Dictionary<IProjectionRunner>;

    beforeEach(() => {
        let projectionRunner = Mock.ofType<IProjectionRunner>();
        projectionRunner.setup(p => p.state).returns(() => {
            return {test: 20};
        });
        runners = {
            "readmodel": projectionRunner.object
        };
        subject = new ReadModelRetriever(runners);
    });

    context("when a readmodel is requested", () => {
        it("should retrieve it", async () => {
            let readModel = await subject.modelFor("readmodel");

            expect(readModel).to.eql({test: 20});
        });
    });
});
