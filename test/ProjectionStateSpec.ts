import "reflect-metadata";
import expect = require("expect.js");
import {Mock, IMock, Times} from "typemoq";
import ProjectionStateHandler from "../scripts/projections/ProjectionStateHandler";
import {IProjectionRunner} from "../scripts/projections/IProjectionRunner";
import MockProjectionRunner from "./fixtures/MockProjectionRunner";
import {IRequest, IResponse, IRequestHandler} from "../scripts/web/IRequestComponents";
import MockRequest from "./fixtures/web/MockRequest";
import Dictionary from "../scripts/util/Dictionary";
import MockProjectionDefinition from "./fixtures/definitions/MockProjectionDefinition";
import {IProjection} from "../scripts/projections/IProjection";
import {IProjectionRegistry, SpecialAreas} from "../scripts/bootstrap/ProjectionRegistry";
import {
    AsyncContentDeliverStrategy, ContentDeliverStrategy, ForbiddenDeliverStrategy,
    UnauthorizedDeliverStrategy
} from "./fixtures/MockDeliverStrategies";
import MockReadModel from "./fixtures/definitions/MockReadModel";
import {IReadModel} from "../scripts/readmodels/IReadModel";

describe("Given a ProjectionStateHandler", () => {
    let request: IRequest,
        response: IMock<IResponse>,
        subject: IRequestHandler,
        holder: Dictionary<IProjectionRunner<any>>,
        projectionRunner: IProjectionRunner<any>,
        registry: IMock<IProjectionRegistry>;

    beforeEach(() => {
        holder = {};
        projectionRunner = new MockProjectionRunner();
        registry = Mock.ofType<IProjectionRegistry>();
        request = new MockRequest();
        response = Mock.ofType<IResponse>();
        subject = new ProjectionStateHandler(registry.object, holder);
    });

    context("when the state of a projection is needed", () => {
        let projection: IProjection<any>;

        beforeEach(() => {
            projection = new MockProjectionDefinition().define();
            registry.setup(r => r.projectionFor("Test", "Admin")).returns(() => ["Admin", projection]);
            holder["Mock"] = projectionRunner;
            projectionRunner.state = 42;
            request.params = {
                area: "Admin",
                projectionName: "Test"
            };
        });
        context("and a deliver strategy is applied", () => {
            context("when a content filter is returned", () => {
                beforeEach(() => projection.publish["Test"].deliver = new ContentDeliverStrategy());
                it("should send the filtered state", async () => {
                    await subject.handle(request, response.object);

                    response.verify(r => r.status(200), Times.once());
                    response.verify(r => r.send(42), Times.once());
                });
            });
            context("when an async content filter is returned", () => {
                beforeEach(() => projection.publish["Test"].deliver = new AsyncContentDeliverStrategy());
                it("should send the filtered state", async () => {
                    await subject.handle(request, response.object);

                    response.verify(r => r.status(200), Times.once());
                    response.verify(r => r.send(42), Times.once());
                });
            });
            context("when an authorized filter is returned", () => {
                beforeEach(() => projection.publish["Test"].deliver = new UnauthorizedDeliverStrategy());
                it("should return a 401 error code", async () => {
                    await subject.handle(request, response.object);

                    response.verify(r => r.status(401), Times.once());
                });
            });
            context("when a forbidden filter is returned", () => {
                beforeEach(() => projection.publish["Test"].deliver = new ForbiddenDeliverStrategy());
                it("should return a 403 error code", async () => {
                    await subject.handle(request, response.object);

                    response.verify(r => r.status(403), Times.once());
                });
            });

            context("when a notification key is passed", () => {
                beforeEach(() => {
                    projection.publish["Test"].deliver = new ForbiddenDeliverStrategy();
                    request.params.partitionKey = "partition-key";
                });
                it("should be vehiculated to the deliver strategy", async () => {
                    await subject.handle(request, response.object);

                    response.verify(r => r.status(200), Times.once());
                    response.verify(r => r.send("partition-key"), Times.once());
                });
            });
        });

        context("and a deliver strategy is not applied", () => {
            it("should respond with the full state", async () => {
                await subject.handle(request, response.object);

                response.verify(r => r.status(200), Times.once());
                response.verify(r => r.send(42), Times.once());
            });
        });


    });

    context("when a projection is a readmodel", () => {
        let readModel: IReadModel<any>;

        beforeEach(() => {
            readModel = new MockReadModel().define();
            registry.setup(r => r.projectionFor("ReadModel", SpecialAreas.Readmodel)).returns(() => [SpecialAreas.Readmodel, readModel]);
            holder["ReadModel"] = projectionRunner;
            projectionRunner.state = 42;
            request.params = {
                area: SpecialAreas.Readmodel,
                projectionName: "ReadModel"
            };
        });
        it("should be kept private", () => {
            subject.handle(request, response.object);

            response.verify(r => r.status(404), Times.once());
        });
    });

});
