import "reflect-metadata";
import expect = require("expect.js");
import {IMock, Mock, It, Times} from "typemoq";
import {
    IProjectionFactory, IProjectionFactoryExtender,
    ProjectionFactory
} from "../scripts/projections/ProjectionFactory";
import MockProjectionDefinition from "./fixtures/definitions/MockProjectionDefinition";
import IObjectContainer from "../scripts/bootstrap/IObjectContainer";

describe("Given a projection factory", () => {
    let subject: IProjectionFactory;
    let objectContainer: IMock<IObjectContainer>;

    beforeEach(() => {
        objectContainer = Mock.ofType<IObjectContainer>();
        objectContainer.setup(o => o.resolve(It.isAny())).returns(() => new MockProjectionDefinition());

    });
    context("when a projection is created", () => {
        context("and no extensions are registered", () => {
            beforeEach(() => {
                subject = new ProjectionFactory(objectContainer.object, []);
            });
            it("should apply nothing", () => {
                let projection = subject.create(MockProjectionDefinition);

                expect(projection.name).to.be.ok();
            });
        });
        context("and some extensions are registered", () => {
            let extender: IMock<IProjectionFactoryExtender>;
            beforeEach(() => {
                extender = Mock.ofType<IProjectionFactoryExtender>();
                subject = new ProjectionFactory(objectContainer.object, [extender.object]);
            });
            it("should apply those extensions", () => {
                subject.create(MockProjectionDefinition);

                extender.verify(e => e.extend(It.isValue(new MockProjectionDefinition())), Times.once());
            });
        });
    });
});
