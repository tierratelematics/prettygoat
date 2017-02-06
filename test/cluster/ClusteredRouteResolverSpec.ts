import "reflect-metadata";
import expect = require("expect.js");
import * as TypeMoq from "typemoq";
import {IRouteResolver, IRequest, IRequestHandler} from "../../scripts/web/IRequestComponents";
import MockRequest from "../fixtures/web/MockRequest";
import ClusteredRouteResolver from "../../scripts/cluster/ClusteredRouteResolver";
import MockRouteResolver from "../fixtures/web/MockRouteResolver";
import {ChannelRequestHandler} from "../fixtures/cluster/MockClusterHandlers";

describe("Given a ClusteredRouteResolver and a request", () => {

    let subject: IRouteResolver;
    let baseStrategy: TypeMoq.IMock<IRouteResolver>;
    let request: IRequest;
    let requestHandler: IRequestHandler;

    beforeEach(() => {
        requestHandler = new ChannelRequestHandler();
        request = new MockRequest();
        baseStrategy = TypeMoq.Mock.ofType(MockRouteResolver);
        subject = new ClusteredRouteResolver(baseStrategy.object, [requestHandler]);
    });

    context("when the request is coming from a channel", () => {
        context("and a registered handler can receive the request", () => {
            it("should route it", () => {
                request.channel = "test";
                let context = subject.resolve(request);
                expect(context[0]).to.be(requestHandler);
            });
        });

        context("and no registered handlers can receive the request", () => {
            it("should drop it", () => {
                request.channel = "badChannel";
                let context = subject.resolve(request);
                expect(context[0]).to.be(null);
            });
        });
    });

    context("when the request is not coming from a channel", () => {
        it("should route the request using the base strategy", () => {
            request.url = "/something";
            subject.resolve(request);
            baseStrategy.verify(baseStrategy => baseStrategy.resolve(TypeMoq.It.isValue(request)), TypeMoq.Times.once());
        });
    });
});