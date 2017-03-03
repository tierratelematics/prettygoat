import "reflect-metadata";
import expect = require("expect.js");
import {Mock, IMock, Times, It} from "typemoq";
import {
    IRequestAdapter, IRouteResolver, IRequest, IResponse, IRequestHandler
} from "../../scripts/web/IRequestComponents";
import RequestAdapter from "../../scripts/web/RequestAdapter";
import MockRequest from "../fixtures/web/MockRequest";
const anyValue = It.isAny();

describe("Given a RequestAdapter and a new request", () => {
    let subject: IRequestAdapter;
    let routeResolver: IMock<IRouteResolver>;
    let request: IRequest;
    let response: IMock<IResponse>;
    let requestHandler: IMock<IRequestHandler>;

    beforeEach(() => {
        requestHandler = Mock.ofType<IRequestHandler>();
        routeResolver = Mock.ofType<IRouteResolver>();
        request = new MockRequest();
        request.method = "GET";
        request.originalRequest = undefined;
        response = Mock.ofType<IResponse>();
        response.setup(r => r.status(anyValue)).returns(() => response.object);
        subject = new RequestAdapter(routeResolver.object);
    });

    context("when a specific handler exists for the request", () => {
        beforeEach(() => {
            routeResolver.setup(r => r.resolve(anyValue)).returns(() => [requestHandler.object, {id: 20}]);
        });
        it("should route the message to the specific handler", () => {
            request.url = "/test";
            subject.route(request, response.object);
            requestHandler.verify(r => r.handle(It.isValue(request), It.isValue(response.object)), Times.once());
        });

        context("and the request had no params", () => {
            it("should set the parsed params", () => {
                request.url = "/test";
                subject.route(request, response.object);
                expect(request.params).to.eql({id: 20});
            });
        });

        context("and the request had some params", () => {
            it("should merge the parsed params", () => {
                request.url = "/test";
                request.params = {
                    foo: "asd"
                };
                subject.route(request, response.object);
                expect(request.params).to.eql({id: 20, foo: "asd"});
            });
        });
    });

    context("when a specific handler does not exists for the request", () => {
        beforeEach(() => {
            routeResolver.setup(r => r.resolve(anyValue)).returns(() => [null, null]);
        });
        it("should drop the connection with a not found", () => {
            request.url = "/notfound";
            subject.route(request, response.object);
            requestHandler.verify(r => r.handle(It.isValue(request), It.isValue(response.object)), Times.never());
        });
    });
});