import "reflect-metadata";
import expect = require("expect.js");
import Dictionary from "../../scripts/common/Dictionary";
import {IProjectionRunner} from "../../scripts/projections/IProjectionRunner";
import {Mock, IMock, Times, It} from "typemoq";
import MockProjectionRunner from "../fixtures/MockProjectionRunner";
import {ISnapshotRepository, Snapshot} from "../../scripts/snapshots/ISnapshotRepository";
import IDateRetriever from "../../scripts/common/IDateRetriever";
import {IRequestHandler, IRequest, IResponse} from "../../scripts/web/IRequestComponents";
import MockRequest from "../fixtures/web/MockRequest";
import {SnapshotSaveHandler, SnapshotDeleteHandler} from "../../scripts/api/SnapshotHandlers";

describe("Given a SnapshotController and a projection name", () => {
    let holder: Dictionary<IProjectionRunner<any>>,
        projectionRunner: IMock<IProjectionRunner<any>>,
        dateRetriever: IMock<IDateRetriever>,
        request: IRequest,
        response: IMock<IResponse>,
        snapshotRepository: IMock<ISnapshotRepository>,
        snapshot: Snapshot<any>,
        subject: IRequestHandler;

    beforeEach(() => {
        projectionRunner = Mock.ofType(MockProjectionRunner);
        dateRetriever = Mock.ofType<IDateRetriever>();
        holder = {};
        holder["projection"] = projectionRunner.object;
        request = new MockRequest();
        response = Mock.ofType<IResponse>();
        response.setup(s => s.status(It.isAny())).returns(a => response.object);
        snapshotRepository = Mock.ofType<ISnapshotRepository>();
        snapshotRepository.setup(s => s.saveSnapshot(It.isAny(), It.isAny())).returns(() => Promise.resolve());
        snapshotRepository.setup(s => s.deleteSnapshot(It.isAny())).returns(() => Promise.resolve());
    });

    context("when there isn't a projection with that name", () => {
        beforeEach(() => {
            subject = new SnapshotSaveHandler(holder, snapshotRepository.object, dateRetriever.object);
            request.body = {payload: {projectionName: "error"}};
        });

        it("should trigger an error", () => {
            subject.handle(request, response.object);
            response.verify(s => s.status(404), Times.once());
            response.verify(s => s.send(It.isAny()), Times.once());
            snapshotRepository.verify(s => s.saveSnapshot(It.isAny(), It.isAny()), Times.never());
        });
    });

    context("when there is a projection with that name ", () => {
        beforeEach(() => {
            request.body = {payload: {projectionName: "projection"}};
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
                response.verify(s => s.status(404), Times.never());
                snapshotRepository.verify(s => s.saveSnapshot("projection", It.isValue(snapshot)), Times.once());
            });
        });

        context("and a delete snapshot command is sent", () => {
            beforeEach(() => {
                subject = new SnapshotDeleteHandler(holder, snapshotRepository.object);
            });
            it("should remove it", () => {
                subject.handle(request, response.object);
                response.verify(s => s.status(404), Times.never());
                snapshotRepository.verify(s => s.deleteSnapshot("projection"), Times.once());
            });
        });
    });

});
