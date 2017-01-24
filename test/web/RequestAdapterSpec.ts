import "reflect-metadata";
import expect = require("expect.js");
import * as TypeMoq from "typemoq";
import {IRequestAdapter, IRouteResolver, IRequest, IResponse} from "../../scripts/web/IRequestComponents";
import RequestAdapter from "../../scripts/web/RequestAdapter";
import ICluster from "../../scripts/cluster/ICluster";
import MockCluster from "../fixtures/cluster/MockCluster";
import RouteResolver from "../../scripts/web/RouteResolver";
import {MockRequestHandler, ParamRequestHandler} from "../fixtures/web/MockRequestHandler";
import MockRequest from "../fixtures/web/MockRequest";
import MockResponse from "../fixtures/web/MockResponse";
const anyValue = TypeMoq.It.isAny();

describe("Given a RequestAdapter and a new request", () => {
    let subject: IRequestAdapter;
    let routeResolver: IRouteResolver;
    let cluster: TypeMoq.Mock<ICluster>;
    let request: TypeMoq.Mock<IRequest>;
    let response: TypeMoq.Mock<IResponse>;


    beforeEach(() => {
        request = TypeMoq.Mock.ofType(MockRequest);
        request.object.method = "GET";
        response = TypeMoq.Mock.ofType(MockResponse);
        response.setup(r => r.status(anyValue)).returns(() => response.object);
        cluster = TypeMoq.Mock.ofType(MockCluster);
        routeResolver = new RouteResolver([new MockRequestHandler(), new ParamRequestHandler()]);
        subject = new RequestAdapter(cluster.object, routeResolver);
    });

    context("when the request method matches", () => {
        context("and a specific handler exists for the request", () => {
            context("and the request can be handled on the current node", () => {
                beforeEach(() => {
                    cluster.setup(c => c.handleOrProxy("testkey", undefined, undefined)).returns(() => true);
                });
                it("should route the message to the specific handler", () => {
                    request.object.url = "/test";
                    subject.route(request.object, response.object);
                    expect(request.object.params.accessed).to.be(true);
                });

                it("should handle correctly query strings on the request path", () => {
                    request.object.url = "/test?foo=bar";
                    subject.route(request.object, response.object);
                    expect(request.object.params.accessed).to.be(true);
                });

                it("should correctly deserialize url params", () => {
                    request.object.url = "/foo/f4587s";
                    subject.route(request.object, response.object);
                    expect(request.object.params.id).to.eql("f4587s");
                });
            });

            context("and the request cannot be handled on the current node", () => {
                beforeEach(() => {
                    cluster.setup(c => c.handleOrProxy("testkey", undefined, undefined)).returns(() => false);
                });
                it("should proxy the request to the next node", () => {
                    request.object.url = "/test";
                    subject.route(request.object, response.object);
                    expect(request.object.params.accessed).to.be(undefined);
                    cluster.verify(c => c.handleOrProxy("testkey", undefined, undefined), TypeMoq.Times.once());
                });
            });
        });

        context("and a specific handler does not exists for the request", () => {
            it("should drop the connection with a not found", () => {
                request.object.url = "/notfound";
                subject.route(request.object, response.object);
                expect(request.object.params).to.be(undefined);
                response.verify(r => r.status(404), TypeMoq.Times.once());
            });
        });
    });

    context("when the request method does not match", () => {
        it("should drop the connection with an error code", () => {
            request.object.url = "/test";
            request.object.method = "POST";
            subject.route(request.object, response.object);
            expect(request.object.params).to.be(undefined);
            response.verify(r => r.status(404), TypeMoq.Times.once());
        });
    });

    context("when a cluster instance is not provided", () => {
        it("should not proxy the request", () => {
            subject = new RequestAdapter(null, routeResolver);
            request.object.url = "/test";
            subject.route(request.object, response.object);
            expect(request.object.params.accessed).to.be(true);
        });
    });
});