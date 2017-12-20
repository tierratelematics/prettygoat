import "reflect-metadata";
import expect = require("expect.js");
import {Mock, IMock, Times, It} from "typemoq";
import ProjectionStateHandler from "../scripts/projections/ProjectionStateHandler";
import {IProjectionRunner} from "../scripts/projections/IProjectionRunner";
import MockProjectionRunner from "./fixtures/MockProjectionRunner";
import {IRequest, IResponse, IRequestHandler} from "../scripts/web/IRequestComponents";
import MockRequest from "./fixtures/web/MockRequest";
import Dictionary from "../scripts/common/Dictionary";
import MockProjectionDefinition from "./fixtures/definitions/MockProjectionDefinition";
import {IProjection} from "../scripts/projections/IProjection";
import {IProjectionRegistry, SpecialAreas} from "../scripts/bootstrap/ProjectionRegistry";
import {
    AsyncContentDeliverStrategy, ContentDeliverStrategy, DependenciesDeliverStrategy,
    ForbiddenDeliverStrategy, ThrowDeliverStrategy,
    UnauthorizedDeliverStrategy
} from "./fixtures/MockDeliverStrategies";
import MockReadModel from "./fixtures/definitions/MockReadModel";
import {IReadModelRetriever} from "../scripts/readmodels/ReadModelRetriever";

describe("Given a ProjectionStateHandler", () => {
    let request: IRequest,
        response: IMock<IResponse>,
        subject: IRequestHandler,
        holder: Dictionary<IProjectionRunner<any>>,
        projectionRunner: IProjectionRunner<any>,
        registry: IMock<IProjectionRegistry>,
        readModelRetriever: IMock<IReadModelRetriever>;

    beforeEach(() => {
        holder = {};
        readModelRetriever = Mock.ofType<IReadModelRetriever>();
        projectionRunner = new MockProjectionRunner();
        registry = Mock.ofType<IProjectionRegistry>();
        request = new MockRequest();
        response = Mock.ofType<IResponse>();
        subject = new ProjectionStateHandler(registry.object, holder, readModelRetriever.object);
    });

    context("when an inexistent projection is requested", () => {
        beforeEach(() => {
            holder["Mock"] = projectionRunner;
            projectionRunner.state = 42;
            request.params = {
                area: "Admin",
                publishPoint: "test"
            };
        });
        it("should respond with a 404", () => {
            subject.handle(request, response.object);

            response.verify(r => r.status(404), Times.once());
        });
    });

    context("when the state of a projection is needed", () => {
        let projection: IProjection<any>;

        beforeEach(() => {
            projection = new MockProjectionDefinition().define();
            registry.setup(r => r.projectionFor("test", "Admin")).returns(() => ["Admin", projection]);
            holder["Mock"] = projectionRunner;
            projectionRunner.state = {
                count: 42
            };
            request.params = {
                area: "Admin",
                publishPoint: "test"
            };
        });
        context("and a deliver strategy is applied", () => {
            context("when a content deliver is returned", () => {
                beforeEach(() => projection.publish["Test"].deliver = new ContentDeliverStrategy());
                it("should send the filtered state", async () => {
                    await subject.handle(request, response.object);

                    response.verify(r => r.status(200), Times.once());
                    response.verify(r => r.send(It.isValue({
                        count: 43
                    })), Times.once());
                });
                it("should keep the projection state intact", async () => {
                    await subject.handle(request, response.object);

                    response.verify(r => r.send(It.isValue({
                        count: 43
                    })), Times.once());
                    expect(projectionRunner.state).to.eql({ count: 42 });
                });
            });
            context("when an async content deliver is returned", () => {
                beforeEach(() => projection.publish["Test"].deliver = new AsyncContentDeliverStrategy());
                it("should send the filtered state", async () => {
                    await subject.handle(request, response.object);

                    response.verify(r => r.status(200), Times.once());
                    response.verify(r => r.send(It.isValue({
                        count: 42
                    })), Times.once());
                });
            });
            context("when an authorized deliver is returned", () => {
                beforeEach(() => projection.publish["Test"].deliver = new UnauthorizedDeliverStrategy());
                it("should return a 401 error code", async () => {
                    await subject.handle(request, response.object);

                    response.verify(r => r.status(401), Times.once());
                });
            });
            context("when a forbidden deliver is returned", () => {
                beforeEach(() => projection.publish["Test"].deliver = new ForbiddenDeliverStrategy());
                it("should return a 403 error code", async () => {
                    await subject.handle(request, response.object);

                    response.verify(r => r.status(403), Times.once());
                });
            });

            context("when a throw deliver is returned", () => {
                beforeEach(() => projection.publish["Test"].deliver = new ThrowDeliverStrategy());
                it("should return a 500 error code", async () => {
                    await subject.handle(request, response.object);

                    response.verify(r => r.status(500), Times.once());
                });
            });

            context("and has some dependencies defined", () => {
                beforeEach(() => {
                    projection.publish["Test"].deliver = new DependenciesDeliverStrategy();
                    projection.publish["Test"].readmodels = {
                        $list: ["a", "b"],
                        $change: s => null
                    };
                    readModelRetriever.setup(r => r.modelFor("a")).returns(() => Promise.resolve("model-a"));
                    readModelRetriever.setup(r => r.modelFor("b")).returns(() => Promise.resolve(100));
                });
                it("should resolve and pass those readmodels to the deliver", async () => {
                    await subject.handle(request, response.object);

                    response.verify(r => r.status(200), Times.once());
                    response.verify(r => r.send(It.isValue({a: "model-a", b: 100})), Times.once());
                });
            });

            context("and has no dependencies defined", () => {
                beforeEach(() => {
                    projection.publish["Test"].deliver = new DependenciesDeliverStrategy();
                    projection.publish["Test"].readmodels = {
                        $list: [],
                        $change: s => null
                    };
                });
                it("should pass no readmodels to the deliver", async () => {
                    await subject.handle(request, response.object);

                    response.verify(r => r.status(200), Times.once());
                    response.verify(r => r.send(It.isValue({})), Times.once());
                });
            });
        });

        context("and a deliver strategy is not applied", () => {
            it("should respond with the full state", async () => {
                await subject.handle(request, response.object);

                response.verify(r => r.status(200), Times.once());
                response.verify(r => r.send(It.isValue({
                    count: 42
                })), Times.once());
            });
        });
    });

    context("when a projection is a readmodel", () => {
        let readModel: IProjection<any>;

        beforeEach(() => {
            readModel = <IProjection>new MockReadModel().define();
            registry.setup(r => r.projectionFor("ReadModel", SpecialAreas.Readmodel)).returns(() => [SpecialAreas.Readmodel, readModel]);
            holder["ReadModel"] = projectionRunner;
            projectionRunner.state = 42;
            request.params = {
                area: SpecialAreas.Readmodel,
                publishPoint: "ReadModel"
            };
        });
        it("should be kept private", () => {
            subject.handle(request, response.object);

            response.verify(r => r.status(404), Times.once());
        });
    });

});
