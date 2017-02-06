import "reflect-metadata";
import expect = require("expect.js");
import * as TypeMoq from "typemoq";
import {
    IRequestAdapter, IRouteResolver, IRequest, IResponse
} from "../../scripts/web/IRequestComponents";
import ICluster from "../../scripts/cluster/ICluster";
import MockCluster from "../fixtures/cluster/MockCluster";
import RouteResolver from "../../scripts/web/RouteResolver";
import {
    MockRequestHandler, ParamRequestHandler,
    NoForwardRequestHandler
} from "../fixtures/web/MockRequestHandler";
import MockRequest from "../fixtures/web/MockRequest";
import MockResponse from "../fixtures/web/MockResponse";
import ClusteredRequestAdapter from "../../scripts/cluster/ClusteredRequestAdapter";
import ChannelRequestHandler from "../fixtures/cluster/MockChannelHandler";
const anyValue = TypeMoq.It.isAny();

describe("Given a ClusteredRequestAdapter and a new request", () => {
    let subject: IRequestAdapter;
    let routeResolver: IRouteResolver;
    let cluster: TypeMoq.IMock<ICluster>;
    let request: IRequest;
    let response: TypeMoq.IMock<IResponse>;

    beforeEach(() => {
        request = new MockRequest();
        request.method = "GET";
        request.originalRequest = undefined;
        response = TypeMoq.Mock.ofType(MockResponse);
        response.setup(r => r.status(anyValue)).returns(() => response.object);
        cluster = TypeMoq.Mock.ofType(MockCluster);
        routeResolver = new RouteResolver([new MockRequestHandler(), new ParamRequestHandler(),
            new ChannelRequestHandler(), new NoForwardRequestHandler()]);
        subject = new ClusteredRequestAdapter(cluster.object, routeResolver);
    });

    context("when it can be handled on the current node", () => {
        beforeEach(() => {
            cluster.setup(c => c.handleOrProxy("testkey", undefined, undefined)).returns(() => true);
        });
        it("should route the message to the specific handler", () => {
            request.url = "/test";
            subject.route(request, response.object);
            expect(request.params.accessed).to.be(true);
        });

        it("should handle correctly query strings on the request path", () => {
            request.url = "/test?foo=bar";
            subject.route(request, response.object);
            expect(request.params.accessed).to.be(true);
        });

        it("should correctly deserialize url params", () => {
            request.url = "/foo/f4587s";
            subject.route(request, response.object);
            expect(request.params.id).to.eql("f4587s");
        });
    });

    context("when no sharding key is provided", () => {
        it("should handle the request on the current node", () => {
            request.url = "/noforward";
            subject.route(request, response.object);
            cluster.verify(c => c.handleOrProxy(anyValue, undefined, undefined), TypeMoq.Times.never());
            expect(request.params.accessed).to.be(true);
        });
    });

    context("when it cannot be handled on the current node", () => {
        beforeEach(() => {
            cluster.setup(c => c.handleOrProxy("testkey", undefined, undefined)).returns(() => false);
        });
        it("should proxy the request to the next node", () => {
            request.url = "/test";
            subject.route(request, response.object);
            expect(request.params.accessed).to.be(undefined);
            cluster.verify(c => c.handleOrProxy("testkey", undefined, undefined), TypeMoq.Times.once());
        });
    });


    context("when the request is coming from a channel", () => {
        context("and a registered handler can receive the request", () => {
            it("should route it", () => {
                request.channel = "test";
                subject.route(request, response.object);
                expect(request.params.channel).to.be(true);
            });
        });

        context("and no registered handlers can receive the request", () => {
            it("should drop it", () => {
                request.channel = "badChannel";
                subject.route(request, response.object);
                expect(request.params.channel).to.be(undefined);
            });
        });
    });
});