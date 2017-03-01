import "reflect-metadata";
import expect = require("expect.js");
import * as TypeMoq from "typemoq";
import ProjectionStateHandler from "../scripts/projections/ProjectionStateHandler";
import IProjectionRunner from "../scripts/projections/IProjectionRunner";
import MockProjectionRunner from "./fixtures/MockProjectionRunner";
import IProjectionRegistry from "../scripts/registry/IProjectionRegistry";
import {IRequest, IResponse, IRequestHandler} from "../scripts/web/IRequestComponents";
import MockRequest from "./fixtures/web/MockRequest";
import Dictionary from "../scripts/util/Dictionary";
import RegistryEntry from "../scripts/registry/RegistryEntry";
import SplitProjectionDefinition from "./fixtures/definitions/SplitProjectionDefinition";
import {
    ContentFilterStrategy, UnauthorizedFilterStrategy,
    ForbiddenFilterStrategy
} from "./fixtures/MockFilterStrategies";
import MockProjectionDefinition from "./fixtures/definitions/MockProjectionDefinition";
import {IProjection} from "../scripts/projections/IProjection";

describe("Given a ProjectionStateHandler", () => {
    let request: IRequest,
        response: TypeMoq.IMock<IResponse>,
        subject: IRequestHandler,
        holder: Dictionary<IProjectionRunner<any>>,
        projectionRunner: IProjectionRunner<any>,
        registry: TypeMoq.IMock<IProjectionRegistry>;

    beforeEach(() => {
        holder = {};
        projectionRunner = new MockProjectionRunner();
        registry = TypeMoq.Mock.ofType<IProjectionRegistry>();
        request = new MockRequest();
        response = TypeMoq.Mock.ofType<IResponse>();
        subject = new ProjectionStateHandler(registry.object, holder);
    });

    context("when the state of a projection is needed", () => {
        let projection:IProjection<any>;

        beforeEach(() => {
            projection = new MockProjectionDefinition().define();
            registry.setup(r => r.getEntry("Mock", "Admin")).returns(() => {
                return {area: "Admin", data: new RegistryEntry(projection, "Mock")};
            });
            holder["test"] = projectionRunner;
            projectionRunner.state = 42;
            request.params = {
                area: "Admin",
                projectionName: "Mock"
            };
        });
        context("and a filter strategy is applied", () => {
            context("when a content filter is returned", () => {
                beforeEach(() => projection.filterStrategy = new ContentFilterStrategy());
                it("should send the filtered state", () => {
                    subject.handle(request, response.object);
                    response.verify(r => r.status(200), TypeMoq.Times.once());
                    response.verify(r => r.send(42), TypeMoq.Times.once());
                });
            });
            context("when an authorized filter is returned", () => {
                beforeEach(() => projection.filterStrategy = new UnauthorizedFilterStrategy());
                it("should return a 401 error code", () => {
                    subject.handle(request, response.object);
                    response.verify(r => r.status(401), TypeMoq.Times.once());
                });
            });
            context("when a forbidden filter is returned", () => {
                beforeEach(() => projection.filterStrategy = new ForbiddenFilterStrategy());
                it("should return a 403 error code", () => {
                    subject.handle(request, response.object);
                    response.verify(r => r.status(403), TypeMoq.Times.once());
                });
            });
        });

        context("and a filter strategy is not applied", () => {
            it("should respond with the full state", () => {
                subject.handle(request, response.object);
                response.verify(r => r.status(200), TypeMoq.Times.once());
                response.verify(r => r.send(42), TypeMoq.Times.once());
            });
        });
    });

    context("when the state of a split projection is needed", () => {
        beforeEach(() => {
            registry.setup(r => r.getEntry("Split", "Admin")).returns(() => {
                return {area: "Admin", data: new RegistryEntry(new SplitProjectionDefinition().define(), "Split")};
            });
            holder["split"] = projectionRunner;
            projectionRunner.state = {
                "foo": 10
            };
            request.params = {
                area: "Admin",
                projectionName: "Split"
            };
        });
        context("and a specific key exists", () => {
            beforeEach(() => request.params.splitKey = "foo");
            it("should return it", () => {
                subject.handle(request, response.object);
                response.verify(r => r.status(200), TypeMoq.Times.once());
                response.verify(r => r.send(10), TypeMoq.Times.once());
            });
        });

        context("and a specific key does not exist", () => {
            it("should send a 404", () => {
                subject.handle(request, response.object);
                response.verify(r => r.status(404), TypeMoq.Times.once());
                response.verify(r => r.send(10), TypeMoq.Times.never());
            });
        });
    });
});
