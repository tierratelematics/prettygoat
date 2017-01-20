import "reflect-metadata";
import expect = require("expect.js");
import * as TypeMoq from "typemoq";
import {IRequestAdapter, IRequestHandler} from "../../scripts/web/IRequestComponents";
import RequestAdapter from "../../scripts/web/RequestAdapter";
import MockRequestHandler from "../fixtures/web/MockRequestHandler";
import ICluster from "../../scripts/cluster/ICluster";
import MockCluster from "../fixtures/cluster/MockCluster";
import {createMockRequest} from "../fixtures/web/MockRequest";
import {createMockResponse} from "../fixtures/web/MockResponse";
const anyValue = TypeMoq.It.isAny;

describe("Given a RequestAdapter", () => {
    let subject: IRequestAdapter;
    let requestHandler: TypeMoq.Mock<IRequestHandler>;
    let cluster: TypeMoq.Mock<ICluster>;

    beforeEach(() => {
        cluster = TypeMoq.Mock.ofType(MockCluster);
        cluster.setup(c => c.whoami()).returns(() => "my-ip");
        requestHandler = TypeMoq.Mock.ofType(MockRequestHandler);
        requestHandler.setup(r => r.keyFor(anyValue())).returns(() => "testkey");
        subject = new RequestAdapter([requestHandler.object], cluster.object);
    });

    context("on a new request", () => {
        context("when a specific handler exists for the request", () => {
            context("and the request can be handled on the current node", () => {
                beforeEach(() => {
                    cluster.setup(c => c.lookup("testkey")).returns(() => "my-ip");
                });
                it("should route the message to the specific handler", () => {
                    let request = createMockRequest("/test");
                    subject.route(request, createMockResponse());
                    requestHandler.verify(r => r.handle(anyValue(), anyValue()), TypeMoq.Times.once());
                });

                it("should handle correctly query strings on the request path", () => {
                    let request = createMockRequest("/test?foo=bar");
                    subject.route(request, createMockResponse());
                    requestHandler.verify(r => r.handle(anyValue(), anyValue()), TypeMoq.Times.once());
                });
            });

            context("and the request cannot be handled on the current node", () => {
                beforeEach(() => {
                    cluster.setup(c => c.lookup("testkey")).returns(() => "not-my-ip");
                });
                it("should proxy the request to the next node", () => {
                    let request = createMockRequest("/test");
                    subject.route(request, createMockResponse());
                    requestHandler.verify(r => r.handle(anyValue(), anyValue()), TypeMoq.Times.never());
                    cluster.verify(c => c.handleOrProxy("testkey", anyValue(), anyValue()), TypeMoq.Times.once());
                });
            });
        });

        context("when a specific handler does not exists for the request", () => {
            it("should drop the connection with a not found", () => {
                let request = createMockRequest("/notfound");
                let response = TypeMoq.Mock.ofInstance(createMockResponse());
                subject.route(request, response.object);
                requestHandler.verify(r => r.handle(anyValue(), anyValue()), TypeMoq.Times.never());
                response.verify(r => r.status(404), TypeMoq.Times.once());
            });
        });
    });
});