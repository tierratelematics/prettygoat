import "reflect-metadata";
import expect = require("expect.js");
import * as TypeMoq from "typemoq";
import IReadModelFactory from "../../scripts/streams/IReadModelFactory";
import MockReadModelFactory from "../fixtures/MockReadModelFactory";
import ClusteredReadModelFactory from "../../scripts/cluster/ClusteredReadModelFactory";
import ICluster from "../../scripts/cluster/ICluster";
import IProjectionSorter from "../../scripts/projections/IProjectionSorter";
import IProjectionRegistry from "../../scripts/registry/IProjectionRegistry";
import MockCluster from "../fixtures/cluster/MockCluster";
import MockProjectionSorter from "../fixtures/definitions/MockProjectionSorter";
import MockProjectionRegistry from "../fixtures/MockProjectionRegistry";
import RegistryEntry from "../../scripts/registry/RegistryEntry";
import DynamicNameProjection from "../fixtures/definitions/DynamicNameProjection";
import {RequestData} from "../../scripts/web/IRequestComponents";
import {Observable} from "rx";
import {Event} from "../../scripts/streams/Event";
import MockRequest from "../fixtures/web/MockRequest";
import MockResponse from "../fixtures/web/MockResponse";

describe("Given a ClusteredReadModelFactory", () => {

    let readModelFactory: TypeMoq.IMock<IReadModelFactory>;
    let subject: IReadModelFactory;
    let cluster: TypeMoq.IMock<ICluster>;
    let sorter: TypeMoq.IMock<IProjectionSorter>;
    let registry: TypeMoq.IMock<IProjectionRegistry>;

    beforeEach(() => {
        cluster = TypeMoq.Mock.ofType(MockCluster);
        sorter = TypeMoq.Mock.ofType(MockProjectionSorter);
        registry = TypeMoq.Mock.ofType(MockProjectionRegistry);
        readModelFactory = TypeMoq.Mock.ofType(MockReadModelFactory);
        subject = new ClusteredReadModelFactory(readModelFactory.object, registry.object, cluster.object, sorter.object);
        registry.setup(r => r.getEntry("Projection")).returns(() => {
            return {area: null, data: new RegistryEntry(new DynamicNameProjection("Projection").define(), null)};
        });
        sorter.setup(sorter => sorter.dependents(TypeMoq.It.isValue(new DynamicNameProjection("Projection").define()))).returns(() => ["Proj2", "Proj3"]);
    });

    context("when a new readmodel is published", () => {
        it("should broadcast it to the dependent nodes", () => {
            subject.publish({
                type: "Projection",
                payload: {
                    "id": 20
                },
                splitKey: null,
                timestamp: null
            });
            cluster.verify(c => c.handleOrProxyToAll(TypeMoq.It.isValue(["Proj2", "Proj3"]), TypeMoq.It.isAny()), TypeMoq.Times.once());
        });
    });

    context("when the stream of readmodels is subscribed", () => {
        beforeEach(() => {
            cluster.setup(c => c.requests()).returns(() => Observable.create<RequestData>(observer => {
                observer.onNext([new MockRequest(null, {
                    type: "Projection",
                    payload: 10,
                    splitKey: null,
                    timestamp: null
                }, "readModel"), new MockResponse()]);
                observer.onNext([new MockRequest("/api/stop"), new MockResponse()]);
                observer.onNext([new MockRequest(null, {
                    type: "Projection",
                    payload: 20,
                    splitKey: null,
                    timestamp: null
                }, "readModel"), new MockResponse()]);
            }));
            readModelFactory.setup(r => r.from(null)).returns(() => Observable.create<Event>(observer => {
                observer.onNext({
                    type: "Projection2",
                    payload: 50,
                    splitKey: null,
                    timestamp: null
                });
            }));
        });
        it("should merge the readmodels coming from the other nodes", () => {
            let notifications: Event[] = [];
            subject.from(null).subscribe(readModel => notifications.push(readModel));
            expect(notifications).to.have.length(3);
            expect(notifications[0].payload).to.be(50);
            expect(notifications[1].payload).to.be(10);
            expect(notifications[2].payload).to.be(20);
        });
    });
});