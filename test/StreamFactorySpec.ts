import expect = require("expect.js");
import sinon = require("sinon");
import * as Rx from "rx";
import CassandraStreamFactory from "../scripts/streams/CassandraStreamFactory";
import MockClientFactory from "./fixtures/MockClientFactory";
import StreamState from "../scripts/streams/StreamState";
import SinonStub = Sinon.SinonStub;

describe("StreamFactory, given a list of events", () => {

    let subject:CassandraStreamFactory,
        streamState:StreamState,
        streamStub:SinonStub,
        events:any[];

    beforeEach(() => {
        events = [];
        streamState = new StreamState();
        subject = new CassandraStreamFactory(new MockClientFactory(), null, streamState);
        streamStub = sinon.stub(subject, "streamSource", () => {
            let rxSubject = new Rx.ReplaySubject<any>();
            rxSubject.onNext({timestamp: "26a", event: "eventA"});
            rxSubject.onNext({timestamp: "26b", event: "eventB"});
            rxSubject.onNext({timestamp: "26c", event: "eventC"});
            rxSubject.onCompleted();
            return rxSubject;
        });
    });

    context("when all the events have been processed", () => {
        it("should set correctly the id of the last event proceseed", () => {
            subject.from(null).subscribeOn(Rx.Scheduler.immediate).subscribe(event => events.push(event));
            expect(streamState.lastEvent).to.eql("26c");
        });
    });
});