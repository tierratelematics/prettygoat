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
import {Request, Response} from "express";
const anyValue = TypeMoq.It.isAny();

describe("Given a RequestAdapter and a new request", () => {
    let subject: IRequestAdapter;
    let requestHandler: IRequestHandler;
    let routeResolver: IRouteResolver;
    let cluster: TypeMoq.Mock<ICluster>;
    let request: TypeMoq.Mock<Request>;
    let response: TypeMoq.Mock<Response>;


    beforeEach(() => {
        request = TypeMoq.Mock.ofInstance(createMockRequest());
        request.object.method = "GET";
        response = TypeMoq.Mock.ofInstance(createMockResponse());
        response.setup(r => r.status(anyValue)).returns(() => response.object);
        cluster = TypeMoq.Mock.ofType(MockCluster);
        requestHandler = new MockRequestHandler();
        routeResolver = new RouteResolver([requestHandler]);
        subject = new RequestAdapter(cluster.object, routeResolver);
    });

    context("when the request method matches", () => {
        context("and a specific handler exists for the request", () => {
            context("and the request can be handled on the current node", () => {
                beforeEach(() => {
                    cluster.setup(c => c.handleOrProxy("testkey", anyValue, anyValue)).returns(() => true);
                });
                it("should route the message to the specific handler", () => {
                    request.object.originalUrl = "/test";
                    subject.route(request.object, response.object);
                    request.verify(r => r.get(""), TypeMoq.Times.once());
                });

                it("should handle correctly query strings on the request path", () => {
                    request.object.originalUrl = "/test?foo=bar";
                    subject.route(request.object, response.object);
                    request.verify(r => r.get(""), TypeMoq.Times.once());
                });
            });

            context("and the request cannot be handled on the current node", () => {
                beforeEach(() => {
                    cluster.setup(c => c.handleOrProxy("testkey", anyValue, anyValue)).returns(() => false);
                });
                it("should proxy the request to the next node", () => {
                    request.object.originalUrl = "/test";
                    subject.route(request.object, response.object);
                    request.verify(r => r.get(""), TypeMoq.Times.never());
                    cluster.verify(c => c.handleOrProxy("testkey", anyValue, anyValue), TypeMoq.Times.once());
                });
            });
        });

        context("and a specific handler does not exists for the request", () => {
            it("should drop the connection with a not found", () => {
                request.object.originalUrl = "/notfound";
                subject.route(request.object, response.object);
                request.verify(r => r.get(""), TypeMoq.Times.never());
                response.verify(r => r.status(404), TypeMoq.Times.once());
            });
        });
    });

    context("when the request method does not match", () => {
        it("should drop the connection with an error code", () => {
            request.object.originalUrl = "/test";
            request.object.method = "POST";
            subject.route(request.object, response.object);
            request.verify(r => r.get(""), TypeMoq.Times.never());
            response.verify(r => r.status(404), TypeMoq.Times.once());
        });
    });
});