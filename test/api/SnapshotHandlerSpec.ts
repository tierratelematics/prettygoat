import "reflect-metadata";
import expect = require("expect.js");
import Dictionary from "../../scripts/util/Dictionary";
import IProjectionRunner from "../../scripts/projections/IProjectionRunner";
import * as TypeMoq from "typemoq";
import MockProjectionRunner from "../fixtures/MockProjectionRunner";
import {ISnapshotRepository, Snapshot} from "../../scripts/snapshots/ISnapshotRepository";
import MockSnapshotRepository from "../fixtures/MockSnapshotRepository";
import IDateRetriever from "../../scripts/util/IDateRetriever";
import MockDateRetriever from "../fixtures/MockDateRetriever";
import {IRequestHandler, IRequest, IResponse} from "../../scripts/web/IRequestComponents";
import MockRequest from "../fixtures/web/MockRequest";
import MockResponse from "../fixtures/web/MockResponse";
import {SnapshotSaveHandler, SnapshotDeleteHandler} from "../../scripts/api/SnapshotHandlers";

describe("Given a SnapshotController and a projection name", () => {
    let holder: Dictionary<IProjectionRunner<any>>,
        projectionRunner: TypeMoq.IMock<IProjectionRunner<any>>,
        dateRetriever: TypeMoq.IMock<IDateRetriever>,
        request: IRequest,
        response: TypeMoq.IMock<IResponse>,
        snapshotRepository: TypeMoq.IMock<ISnapshotRepository>,
        snapshot: Snapshot<any>,
        subject: IRequestHandler;

    beforeEach(
        () => {
            projectionRunner = TypeMoq.Mock.ofType(MockProjectionRunner);
            dateRetriever = TypeMoq.Mock.ofType(MockDateRetriever);
            holder = {};
            holder["projection"] = projectionRunner.object;
            request = new MockRequest();
            response = TypeMoq.Mock.ofType(MockResponse);
            response.setup(s => s.status(TypeMoq.It.isAny())).returns(a => response.object);
            snapshotRepository = TypeMoq.Mock.ofType(MockSnapshotRepository);
        }
    );

    context("when there isn't a projection with that name", () => {
        beforeEach(() => {
            subject = new SnapshotSaveHandler(holder, snapshotRepository.object, dateRetriever.object);
            request.params = {projectionName: "error"};
        });

        it("should trigger an error", () => {
            subject.handle(request, response.object);
            response.verify(s => s.status(404), TypeMoq.Times.once());
            response.verify(s => s.send(TypeMoq.It.isAny()), TypeMoq.Times.once());
            snapshotRepository.verify(s => s.saveSnapshot(TypeMoq.It.isAny(), TypeMoq.It.isAny()), TypeMoq.Times.never());
        });
    });

    context("when there is a projection with that name ", () => {
        beforeEach(() => {
            request.params = {projectionName: "projection"};
        });

        context("and a create snapshot command is sent", () => {
            beforeEach(() => {
                subject = new SnapshotSaveHandler(holder, snapshotRepository.object, dateRetriever.object);
                projectionRunner.object.state = {a: 25, b: 30};
                dateRetriever.setup(d => d.getDate()).returns(o => new Date(500));
                snapshot = new Snapshot(projectionRunner.object.state, new Date(500));
            });

            it("should save it", () => {
                subject.handle(request, response.object);
                response.verify(s => s.status(404), TypeMoq.Times.never());
                snapshotRepository.verify(s => s.saveSnapshot("projection", TypeMoq.It.isValue(snapshot)), TypeMoq.Times.once());
            });
        });

        context("and a delete snapshot command is sent", () => {
            beforeEach(() => {
                subject = new SnapshotDeleteHandler(holder, snapshotRepository.object);
            });
            it("should remove it", () => {
                subject.handle(request, response.object);
                response.verify(s => s.status(404), TypeMoq.Times.never());
                snapshotRepository.verify(s => s.deleteSnapshot("projection"), TypeMoq.Times.once());
            });
        });
    });

});
