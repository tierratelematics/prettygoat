import "bluebird";
import "reflect-metadata";
import expect = require("expect.js");
import Dictionary from "../../scripts/Dictionary";
import IProjectionRunner from "../../scripts/projections/IProjectionRunner";
import MockRequest from "../fixtures/express/MockRequest";
import * as TypeMoq from "typemoq";
import {Response, Request} from "express";
import MockProjectionRunner from "../fixtures/MockProjectionRunner";
import MockResponse from "../fixtures/express/MockResponse";
import {ISnapshotRepository, Snapshot} from "../../scripts/snapshots/ISnapshotRepository";
import MockSnapshotRepository from "../fixtures/MockSnapshotRepository";
import SnapshotManagerController from "../../scripts/api/SnapshotManagerController";
import IDateRetriever from "../../scripts/util/IDateRetriever";
import MockDateRetriever from "../fixtures/MockDateRetriever";

describe("Given a SnapshotController and a projection name", () => {
    let holder: Dictionary<IProjectionRunner<any>>,
        projectionRunner: TypeMoq.Mock<IProjectionRunner<any>>,
        dateRetriever: TypeMoq.Mock<IDateRetriever>,
        request: TypeMoq.Mock<Request>,
        response: TypeMoq.Mock<Response>,
        snapshotRepository: TypeMoq.Mock<ISnapshotRepository>,
        snapshot: Snapshot<any>,
        subject: SnapshotManagerController;

    beforeEach(
        () => {
            projectionRunner = TypeMoq.Mock.ofType(MockProjectionRunner);
            dateRetriever = TypeMoq.Mock.ofType(MockDateRetriever);
            holder = {};
            holder["namePrj"] = projectionRunner.object;
            request = TypeMoq.Mock.ofType(MockRequest);
            response = TypeMoq.Mock.ofType(MockResponse);
            response.setup(s => s.status(TypeMoq.It.isAny())).returns(a => response.object);
            snapshotRepository = TypeMoq.Mock.ofType(MockSnapshotRepository);
            subject = new SnapshotManagerController(holder, snapshotRepository.object, dateRetriever.object);
        }
    );

    context("when there isn't a projection with that name", () => {
        beforeEach(() => {
            request.object.body = {name: "errorProjection"};
        });

        it("should trigger an error", () => {
            subject.saveSnapshot(request.object, response.object);
            subject.deleteSnapshot(request.object, response.object);
            response.verify(s => s.status(400), TypeMoq.Times.exactly(2));
            response.verify(s => s.json(TypeMoq.It.isAny()), TypeMoq.Times.exactly(2));
            snapshotRepository.verify(s => s.saveSnapshot(TypeMoq.It.isAny(), TypeMoq.It.isAny()), TypeMoq.Times.never());
            snapshotRepository.verify(s => s.deleteSnapshot(TypeMoq.It.isAny()), TypeMoq.Times.never());
        });
    });

    context("when there is a projection with that name ", () => {
        beforeEach(() => {
            request.object.body = {name: "namePrj"};
        });

        context("and a create snapshot command is sent", () => {
            beforeEach(() => {
                projectionRunner.object.state = {a: 25, b: 30};
                dateRetriever.setup(d => d.getDate()).returns(o => new Date(500));
                snapshot = new Snapshot(projectionRunner.object.state, new Date(500));
            });

            it("should save it", () => {
                subject.saveSnapshot(request.object, response.object);
                response.verify(s => s.status(400), TypeMoq.Times.never());
                snapshotRepository.verify(s => s.saveSnapshot("namePrj", TypeMoq.It.isValue(snapshot)), TypeMoq.Times.once());
            });
        });

        context("and a delete snapshot command is sent", () => {
            it("should remove it", () => {
                subject.deleteSnapshot(request.object, response.object);
                response.verify(s => s.status(400), TypeMoq.Times.never());
                snapshotRepository.verify(s => s.deleteSnapshot("namePrj"), TypeMoq.Times.once());
            });
        });


    });

});
