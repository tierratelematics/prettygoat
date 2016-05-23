/// <reference path="../node_modules/typemoq/typemoq.node.d.ts" />
import { ProjectionRunner } from "../scripts/ProjectionRunner";
import { SpecialNames } from "../scripts/SpecialNames";
import { IMatcher } from "../scripts/interfaces/IMatcher";
import { ISnapshotRepository, Snapshot } from "../scripts/interfaces/ISnapshotRepository";
import { IStreamFactory } from "../scripts/interfaces/IStreamFactory";
import { MockMatcher } from "./fixtures/MockMatcher";
import { MockSnapshotRepository } from "./fixtures/MockSnapshotRepository";
import { MockStreamFactory } from "./fixtures/MockStreamFactory";
import { Observable, Subject, IDisposable } from "rx";
import {Mock, Times} from "typemoq";
import expect = require("expect.js");

describe("Given a ProjectionRunner", () => {
    let stream: Mock<IStreamFactory>;
    let subject: ProjectionRunner<number>;
    let matcher: Mock<IMatcher>;
    let repository: Mock<ISnapshotRepository>;
    let notifications: number[];
    let stopped: boolean;
    let failed: boolean;
    let subscription: IDisposable;

    beforeEach(() => {
        notifications = [];
        stopped = false;
        failed = false;
        stream = Mock.ofType<IStreamFactory>(MockStreamFactory);
        repository = Mock.ofType<ISnapshotRepository>(MockSnapshotRepository);
        matcher = Mock.ofType<IMatcher>(MockMatcher);
        subject = new ProjectionRunner<number>("stream", stream.object, repository.object, matcher.object);
        subscription = subject.subscribe((state: number) => notifications.push(state), e => failed = true, () => stopped = true);
    });

    afterEach(() => subscription.dispose());

    context("when initializing a projection", () => {

        context("and a snapshot is present", () => {
            beforeEach(() => {
                repository.setup(r => r.getSnapshot<number>("stream")).returns(_ => new Snapshot<number>(42, "lastEvent"));
                stream.setup(s => s.from("lastEvent")).returns(_ => Observable.empty());
                matcher.setup(m => m.match(SpecialNames.Init)).throws(new Error("match called for $init when a snapshot was present"));
                subject.run();
            });
            it("should consider the snapshot as the initial state", () => {
                repository.verify(r => r.getSnapshot<number>("stream"), Times.once());
            });
            it("should subscribe to the event stream starting from the snapshot point in time", () => {
                stream.verify(s => s.from("lastEvent"), Times.once());
            });

            context("should behave regularly", behavesRegularly);
        });

        context("and a snapshot is not present", () => {
            beforeEach(() => {
                repository.setup(r => r.getSnapshot<number>("stream")).returns(_ => Snapshot.Empty);
                stream.setup(s => s.from(undefined)).returns(_ => Observable.empty());
                matcher.setup(m => m.match(SpecialNames.Init)).returns(name => () => 42);
                subject.run();
            });

            it("should create an initial state based on the projection definition", () => {
                matcher.verify(m => m.match(SpecialNames.Init), Times.once());
            });
            it("should subscribe to the event stream starting from the stream's beginning", () => {
                stream.verify(s => s.from(undefined), Times.once());
            });

            context("should behave regularly", behavesRegularly);
        });

        function behavesRegularly() {
            it("should consider the initial state as the projection state", () => {
                expect(subject.state).to.be(42);
            });
            it("should notify that the projection has been initialized", () => {
                expect(notifications).to.eql([42]);
            });
        }
    });

    context("when receiving an event from a stream", () => {
        beforeEach(() => {
            repository.setup(r => r.getSnapshot<number>("stream")).returns(_ => Snapshot.Empty);
            matcher.setup(m => m.match(SpecialNames.Init)).returns(name => () => 42);
            stream.setup(s => s.from(undefined)).returns(_ => Observable.range(1, 5).map(n => { return { name: "increment", value: n }; }));
        });

        context("and no error occurs", () => {
            beforeEach(() => {
                matcher.setup(m => m.match("increment")).returns(name => (s: number, e: any) => s + e.value);
                subject.run();
            });

            it("should match the event with the projection definition", () => {
                matcher.verify(m => m.match("increment"), Times.exactly(5));
            });
            it("should consider the returned state as the projection state", () => {
                expect(subject.state).to.be(42 + 1 + 2 + 3 + 4 + 5);
            });
            it("should notify that the projection has been updated", () => {
                expect(notifications).to.be.eql([
                    42,
                    42 + 1,
                    42 + 1 + 2,
                    42 + 1 + 2 + 3,
                    42 + 1 + 2 + 3 + 4,
                    42 + 1 + 2 + 3 + 4 + 5
                ]);
            });

        });

        context("and an error occurs while processing the event", () => {
            beforeEach(() => {
                matcher.setup(m => m.match("increment")).returns(name => (s: number, e: any) => { throw new Error("Kaboom!"); });
                subject.run();
            });
            it("should notify an error", () => {
                expect(failed).to.be.ok();
            });
        });
    });

    context("when stopping a projection", () => {
        let streamSubject = new Subject<any>();
        beforeEach(() => {
            repository.setup(r => r.getSnapshot<number>("stream")).returns(_ => Snapshot.Empty);
            matcher.setup(m => m.match(SpecialNames.Init)).returns(name => () => 42);
            matcher.setup(m => m.match("increment")).returns(name => (s: number, e: any) => s + e.value);
            stream.setup(s => s.from(undefined)).returns(_ => streamSubject);

            subject.run();
            streamSubject.onNext({ name: "increment", value: 1 });
            streamSubject.onNext({ name: "increment", value: 2 });
            streamSubject.onNext({ name: "increment", value: 3 });
            streamSubject.onNext({ name: "increment", value: 4 });
            subject.stop();
            streamSubject.onNext({ name: "increment", value: 5 });
        });
        it("should not process any more events", () => {
            expect(notifications).to.eql([
                42,
                42 + 1,
                42 + 1 + 2,
                42 + 1 + 2 + 3,
                42 + 1 + 2 + 3 + 4
            ]);
        });
        it("should notify that the projection has been stopped", () => {
            expect(stopped).to.be.ok();
        });

        context("and the projection is started again", () => {
            it("should throw an error", () => {
                expect(() => subject.run()).to.throwError();
            });
        });
    });
});
