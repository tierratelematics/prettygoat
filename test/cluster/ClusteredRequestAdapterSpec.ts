import "reflect-metadata";
import expect = require("expect.js");
import * as TypeMoq from "typemoq";
import ICluster from "../../scripts/cluster/ICluster";
import MockCluster from "../fixtures/cluster/MockCluster";
import {
    IRequestAdapter, IRouteResolver, IResponse, IRequest,
    IRequestHandler
} from "../../scripts/web/IRequestComponents";
import {MockRequestHandler} from "../fixtures/web/MockRequestHandler";
import MockRequest from "../fixtures/web/MockRequest";
import MockResponse from "../fixtures/web/MockResponse";
import MockRouteResolver from "../fixtures/web/MockRouteResolver";
import ClusteredRequestAdapter from "../../scripts/cluster/ClusteredRequestAdapter";
const anyValue = TypeMoq.It.isAny();

describe("Given a ClusteredRequestAdapter and a new request", () => {
    let subject: IRequestAdapter;
    let routeResolver: TypeMoq.IMock<IRouteResolver>;
    let cluster: TypeMoq.IMock<ICluster>;
    let request: IRequest;
    let response: TypeMoq.IMock<IResponse>;
    let requestHandler: TypeMoq.IMock<IRequestHandler>;

    beforeEach(() => {
        requestHandler = TypeMoq.Mock.ofType(MockRequestHandler);
        request = new MockRequest();
        request.method = "GET";
        request.originalRequest = undefined;
        response = TypeMoq.Mock.ofType(MockResponse);
        response.setup(r => r.status(anyValue)).returns(() => response.object);
        cluster = TypeMoq.Mock.ofType(MockCluster);
        routeResolver = TypeMoq.Mock.ofType(MockRouteResolver);
        routeResolver.setup(r => r.resolve(anyValue)).returns(() => [requestHandler.object, {}]);
        subject = new ClusteredRequestAdapter(cluster.object, routeResolver.object);
    });

    context("when a sharding key is provided", () => {
        beforeEach(() => {
            requestHandler.setup(r => r.keyFor(anyValue)).returns(() => "testkey");
        });
        context("when it can be handled on the current node", () => {
            beforeEach(() => {
                cluster.setup(c => c.handleOrProxy("testkey", undefined, undefined)).returns(() => true);
            });
            it("should route the message to the specific handler", () => {
                request.url = "/test";
                subject.route(request, response.object);
                requestHandler.verify(r => r.handle(TypeMoq.It.isValue(request), TypeMoq.It.isValue(response.object)), TypeMoq.Times.once());
            });
        });

        context("when it cannot be handled on the current node", () => {
            beforeEach(() => {
                cluster.setup(c => c.handleOrProxy("testkey", undefined, undefined)).returns(() => false);
            });
            it("should proxy the request to the next node", () => {
                request.url = "/test";
                subject.route(request, response.object);
                requestHandler.verify(r => r.handle(TypeMoq.It.isValue(request), TypeMoq.It.isValue(response.object)), TypeMoq.Times.never());
                cluster.verify(c => c.handleOrProxy("testkey", undefined, undefined), TypeMoq.Times.once());
            });
        });
    });

    context("when no sharding key is provided", () => {
        beforeEach(() => {
            requestHandler.setup(r => r.keyFor(anyValue)).returns(() => null);
        });
        it("should handle the request on the current node", () => {
            request.url = "/noforward";
            subject.route(request, response.object);
            cluster.verify(c => c.handleOrProxy(anyValue, undefined, undefined), TypeMoq.Times.never());
            requestHandler.verify(r => r.handle(TypeMoq.It.isValue(request), TypeMoq.It.isValue(response.object)), TypeMoq.Times.once());
        });
    });
});