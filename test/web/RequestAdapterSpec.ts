import "reflect-metadata";
import expect = require("expect.js");
import {IRequestAdapter} from "../../scripts/web/IRequestComponents";
import RequestAdapter from "../../scripts/web/RequestAdapter";
import {NoPathRequestHandler, NoMethodRequestHandler} from "../fixtures/web/MockRequestHandler";

describe("Given a request adapter", () => {
    let subject: IRequestAdapter;

    beforeEach(() => {
        subject = new RequestAdapter();
    });

    context("when a new handler is added to the registry", () => {
        it("should throw an error if the path is missing", () => {
            expect(() => {
                subject.add(NoPathRequestHandler);
            }).to.throwError();
        });

        it("should throw an error if the method is missing", () => {
            expect(() => {
                subject.add(NoMethodRequestHandler);
            }).to.throwError();
        });
    });

    context("on a new request", () => {
        context("when a specific handler exists for the request", () => {
            context("and the request can be handled on the current node", () => {
                it("should route the message to the specific handler", () => {

                });
            });

            context("and the request cannot be handled on the current node", () => {
                it("should proxy the request to the next node", () => {

                });
            });
        });

        context("when a specific handler does not exists for the request", () => {
            it("should drop the connection with an error code", () => {

            });
        });
    });
});