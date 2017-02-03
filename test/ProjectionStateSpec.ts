import "reflect-metadata";
import expect = require("expect.js");
import * as TypeMoq from "typemoq";
import {IRequest, IResponse, IRequestHandler} from "../../scripts/web/IRequestComponents";
import MockRequest from "../fixtures/web/MockRequest";
import MockResponse from "../fixtures/web/MockResponse";
import {ISnapshotRepository} from "../../scripts/snapshots/ISnapshotRepository";
import {IProjection} from "../../scripts/projections/IProjection";
import {ProjectionStopHandler, ProjectionRestartHandler} from "../../scripts/api/ProjectionsHandlers";

describe("Given a ProjectionStateHandler", () => {
    let request: IRequest,
        response: TypeMoq.IMock<IResponse>;

    beforeEach(() => {
        request = new MockRequest();
        response = TypeMoq.Mock.ofType(MockResponse);
    });

    context("when the state of a projection is needed", () => {
        context("and a filter strategy is applied", () => {
            context("when a content filter is returned", () => {
                it("should send the filtered state");
            });
            context("when an authorized filter is returned", () => {
                it("should return a 401 error code");
            });
            context("when a forbidden filter is returned", () => {
                it("should return a 403 error code");
            });
        });

        context("and a filter strategy is not applied", () => {
            it("should respond with the full state");
        });
    });

    context("when the state of a split projection is needed", () => {
        context("and a specific key exists", () => {
            it("should return it");
        });

        context("and a specific key does not exist", () => {
            it("should send a 404");
        });
    });
});
