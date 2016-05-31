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
        streamStub:SinonStub;

    beforeEach(() => {
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

    context("when an events has not been processed", () => {
        it("should be processed", (done) => {
            let events = [];
            subject.from(null).subscribe(event => events.push(event), error => {}, () => {
                expect(events).to.have.length(3);
                done();
            });
        });
    });

    context("when an event has been processed", () => {
        beforeEach(() => streamState.lastEvent = "26b");
        it("should not be processed anymore", (done) => {
            let events = [];
            subject.from(null).subscribe(event => events.push(event), error => {}, () => {
                expect(events).to.have.length(1);
                expect(events[0]).to.eql("eventC");
                done();
            });
        });
    });
});