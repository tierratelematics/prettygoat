import "reflect-metadata";
import {IMock, Mock, Times, It} from "typemoq";
import {IReadModelNotifier, ReadModelNotifier} from "../../scripts/readmodels/ReadModelNotifier";
import SpecialEvents from "../../scripts/events/SpecialEvents";
import { IAsyncPublisherFactory } from "../../scripts/common/AsyncPublisherFactory";
import { IProjectionRunner } from "../../scripts/projections/IProjectionRunner";
import IAsyncPublisher from "../../scripts/common/IAsyncPublisher";
import { Observable } from "rxjs";

describe("Given a readmodel notifier", () => {
    let subject: IReadModelNotifier;
    let asyncPublisherFactory: IMock<IAsyncPublisherFactory>;
    let asyncPublisher: IMock<IAsyncPublisher<any>>;
    let runner: IMock<IProjectionRunner>;

    beforeEach(() => {
        runner = Mock.ofType<IProjectionRunner>();
        asyncPublisherFactory = Mock.ofType<IAsyncPublisherFactory>();
        asyncPublisher = Mock.ofType<IAsyncPublisher<any>>();
        asyncPublisher.setup(a => a.items(It.is<any>(value => !!value))).returns(() => Observable.empty());
        asyncPublisherFactory.setup(a => a.publisherFor(It.isValue(runner.object))).returns(() => asyncPublisher.object);
        subject = new ReadModelNotifier(asyncPublisherFactory.object, {
            "readmodel1": runner.object
        });
    });

    context("when a readmodel is published", () => {
        it("should notify those changes", () => {
            subject.notifyChanged({
                type: "readmodel1",
                payload: "projection_state",
                timestamp: new Date(5000),
                id: "test",
                metadata: {}
            }, ["notification-key"]);

            asyncPublisher.verify(a => a.publish(It.isValue([
                {
                    type: SpecialEvents.READMODEL_CHANGED,
                    payload: "readmodel1",
                    timestamp: new Date(5000),
                    id: "test",
                    metadata: {}
                },
                ["notification-key"]
            ])), Times.once());
        });
    });
});
