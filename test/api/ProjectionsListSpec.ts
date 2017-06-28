import "reflect-metadata";
import expect = require("expect.js");
import {Mock, IMock, Times, It} from "typemoq";
import {ProjectionsListHandler} from "../../scripts/api/ProjectionsListHandler";
import {IRequest, IResponse} from "../../scripts/web/IRequestComponents";
import MockRequest from "../fixtures/web/MockRequest";
import IProjectionRegistry from "../../scripts/registry/IProjectionRegistry";

describe("Given a ProjectionsListHandler", () => {
    let request: IRequest,
        response: IMock<IResponse>,
        subject: ProjectionsListHandler,
        registry: IMock<IProjectionRegistry>;

    beforeEach(() => {
        registry = Mock.ofType<IProjectionRegistry>();
        request = new MockRequest();
        response = Mock.ofType<IResponse>();
        subject = new ProjectionsListHandler(registry.object);
        registry.setup(r => r.getAreas()).returns(() => [
            {
                area: "Admin", entries: [
                {name: "Test", definition: {}, publish: {}},
                {name: "Test2", definition: {}, publish: {}}]
            }
        ]);
    });

    context("when a new request is triggered", () => {
        it("should return the list of projections", () => {
            subject.handle(request, response.object);

            response.verify(r => r.send(It.isValue([
                "Test", "Test2"
            ])), Times.once());
        });
    });

});
