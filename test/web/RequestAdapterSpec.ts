import "reflect-metadata";
import expect = require("expect.js");
import * as TypeMoq from "typemoq";
import {IRequestAdapter, IRequestHandler, IRouteResolver} from "../../scripts/web/IRequestComponents";
import RequestAdapter from "../../scripts/web/RequestAdapter";
import MockRequestHandler from "../fixtures/web/MockRequestHandler";
import ICluster from "../../scripts/cluster/ICluster";
import MockCluster from "../fixtures/cluster/MockCluster";
import {createMockRequest} from "../fixtures/web/MockRequest";
import {createMockResponse} from "../fixtures/web/MockResponse";
import RouteResolver from "../../scripts/web/RouteResolver";
const anyValue = TypeMoq.It.isAny();

describe("Given a RequestAdapter", () => {
    let subject: IRequestAdapter;
    let requestHandler: IRequestHandler;
    let routeResolver: IRouteResolver;
    let cluster: TypeMoq.Mock<ICluster>;

    beforeEach(() => {
        cluster = TypeMoq.Mock.ofType(MockCluster);
        requestHandler = new MockRequestHandler();
        routeResolver = new RouteResolver([requestHandler]);
        subject = new RequestAdapter(cluster.object, routeResolver);
    });

    context("on a new request", () => {
        context("when a specific handler exists for the request", () => {
            context("and the request can be handled on the current node", () => {
                beforeEach(() => {
                    cluster.setup(c => c.handleOrProxy("testkey", anyValue, anyValue)).returns(() => true);
                });
                it("should route the message to the specific handler", () => {
                    let request = TypeMoq.Mock.ofInstance(createMockRequest());
                    request.object.originalUrl = "/test";
                    subject.route(request.object, createMockResponse());
                    request.verify(r => r.get(""), TypeMoq.Times.once());
                });

                it("should handle correctly query strings on the request path", () => {
                    let request = TypeMoq.Mock.ofInstance(createMockRequest());
                    request.object.originalUrl = "/test?foo=bar";
                    subject.route(request.object, createMockResponse());
                    request.verify(r => r.get(""), TypeMoq.Times.once());
                });
            });

            context("and the request cannot be handled on the current node", () => {
                beforeEach(() => {
                    cluster.setup(c => c.handleOrProxy("testkey", anyValue, anyValue)).returns(() => false);
                });
                it("should proxy the request to the next node", () => {
                    let request = TypeMoq.Mock.ofInstance(createMockRequest());
                    request.object.originalUrl = "/test";
                    subject.route(request.object, createMockResponse());
                    request.verify(r => r.get(""), TypeMoq.Times.never());
                    cluster.verify(c => c.handleOrProxy("testkey", anyValue, anyValue), TypeMoq.Times.once());
                });
            });
        });

        context("when a specific handler does not exists for the request", () => {
            it("should drop the connection with a not found", () => {
                let request = TypeMoq.Mock.ofInstance(createMockRequest());
                request.object.originalUrl = "/notfound";
                let response = TypeMoq.Mock.ofInstance(createMockResponse());
                response.setup(r => r.status(404)).returns(() => response.object);
                subject.route(request.object, response.object);
                request.verify(r => r.get(""), TypeMoq.Times.never());
                response.verify(r => r.status(404), TypeMoq.Times.once());
            });
        });
    });
});