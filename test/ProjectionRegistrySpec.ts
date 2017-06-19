import "reflect-metadata";
import expect = require("expect.js");
import {IMock, Mock, Times, It} from "typemoq";
import IProjectionRegistry from "../scripts/registry/IProjectionRegistry";
import ProjectionRegistry from "../scripts/registry/ProjectionRegistry";
import MockProjectionDefinition from "./fixtures/definitions/MockProjectionDefinition";
import IObjectContainer from "../scripts/ioc/IObjectContainer";
import IProjectionDefinition from "../scripts/registry/IProjectionDefinition";
import ITickScheduler from "../scripts/ticks/ITickScheduler";
import TickScheduler from "../scripts/ticks/TickScheduler";
import Dictionary from "../scripts/util/Dictionary";
import {
    MockProjectionCircularADefinition,
    MockProjectionCircularBDefinition, MockProjectionCircularAnyDefinition
} from "./fixtures/definitions/MockProjectionCircularDefinition";
import SplitProjectionDefinition from "./fixtures/definitions/SplitProjectionDefinition";
import UnnamedProjectionDefinition from "./fixtures/definitions/UnnamedProjectionDefinition";
import MockNotificationProjection from "./fixtures/definitions/MockNotificationProjection";
import BadNotificationProjection from "./fixtures/definitions/BadNotificationProjection";

describe("ProjectionRegistry, given a list of projection definitions", () => {

    let subject: IProjectionRegistry,
        objectContainer: IMock<IObjectContainer>,
        tickScheduler: ITickScheduler,
        holder: Dictionary<ITickScheduler>;

    beforeEach(() => {
        objectContainer = Mock.ofType<IObjectContainer>();
        tickScheduler = new TickScheduler(null);
        holder = {};
        subject = new ProjectionRegistry(objectContainer.object, () => tickScheduler, holder);
    });

    context("when they are registered under a specific area", () => {

        it("should register the projection handler with the right contexts", () => {
            let key = "prettygoat:definitions:Admin:Mock";
            objectContainer.setup(o => o.contains(key)).returns(a => true);
            objectContainer.setup(o => o.get(key)).returns(a => new MockProjectionDefinition());

            subject.add(MockProjectionDefinition).forArea("Admin");
            let areas = subject.getAreas();

            expect(areas[0].area).to.be("Admin");
        });

        it("should pass a tick scheduler to the definition", () => {
            let projectionDefinition = setUpTickScheduler();
            projectionDefinition.verify(p => p.define(It.isValue(tickScheduler)), Times.once());
        });

        it("should cache the tick scheduler passed to the definition", () => {
            setUpTickScheduler();
            expect(holder["test"]).to.be(tickScheduler);
        });

        function setUpTickScheduler(): IMock<IProjectionDefinition<number>> {
            let key = "prettygoat:definitions:Admin:Mock";
            objectContainer.setup(o => o.contains(key)).returns(a => true);
            let projectionDefinition: IMock<IProjectionDefinition<number>> = Mock.ofType(MockProjectionDefinition);
            objectContainer.setup(o => o.get(key)).returns(a => projectionDefinition.object);
            projectionDefinition.setup(p => p.define(It.isValue(tickScheduler))).returns(a => {
                return {name: "test", definition: {}};
            });
            subject.add(MockProjectionDefinition).forArea("Admin");
            return projectionDefinition;
        }
    });

    context("when a projection has no name", () => {
        beforeEach(() => {
            let key = "prettygoat:definitions:Test:";
            objectContainer.setup(o => o.contains(key)).returns(a => true);
            objectContainer.setup(o => o.get(key)).returns(a => new UnnamedProjectionDefinition());
        });
        it("should throw an error regarding the missing decorator", () => {
            expect(() => subject.add(UnnamedProjectionDefinition).forArea("Test")).to.throwError();
        });
    });

    context("when a projection with that name already exists", () => {
        beforeEach(() => {
            let key = "prettygoat:definitions:Admin:Mock";
            objectContainer.setup(o => o.contains(key)).returns(a => true);
            objectContainer.setup(o => o.get(key)).returns(a => new MockProjectionDefinition());
        });
        it("should throw an error", () => {
            expect(() => {
                subject.add(MockProjectionDefinition).add(MockProjectionDefinition).forArea("Admin");
            }).to.throwError();
        });
    });

    context("when a projection has a notification field", () => {

        context("and not all the events of the definition are present", () => {
            beforeEach(() => {
                let key = "prettygoat:definitions:Admin:Bad";
                objectContainer.setup(o => o.contains(key)).returns(a => true);
                objectContainer.setup(o => o.get(key)).returns(a => new BadNotificationProjection());
            });
            it("should throw an error", () => {
                expect(() => {
                    subject.add(BadNotificationProjection).forArea("Admin");
                }).to.throwError();
            });
        });

        context("and all the events of the definition are present", () => {
            beforeEach(() => {
                let key = "prettygoat:definitions:Admin:Mock";
                objectContainer.setup(o => o.contains(key)).returns(a => true);
                objectContainer.setup(o => o.get(key)).returns(a => new MockNotificationProjection());
            });
            it("should not raise an error", () => {
                expect(() => {
                    subject.add(MockNotificationProjection).forArea("Admin");
                }).not.to.throwError();
            });
        });
    });

    context("when multiple projections are registered with different names", () => {
        beforeEach(() => {
            let key = "prettygoat:definitions:Admin:CircularA";
            objectContainer.setup(o => o.contains(key)).returns(a => true);
            objectContainer.setup(o => o.get(key)).returns(a => new MockProjectionCircularADefinition());

            key = "prettygoat:definitions:Admin:CircularAny";
            objectContainer.setup(o => o.contains(key)).returns(a => true);
            objectContainer.setup(o => o.get(key)).returns(a => new MockProjectionCircularAnyDefinition());

            key = "prettygoat:definitions:Admin:CircularB";
            objectContainer.setup(o => o.contains(key)).returns(a => true);
            objectContainer.setup(o => o.get(key)).returns(a => new MockProjectionCircularBDefinition());
        });
        it("should register them correctly", () => {
            expect(() => {
                subject.add(MockProjectionCircularBDefinition)
                    .add(MockProjectionCircularADefinition)
                    .add(MockProjectionCircularAnyDefinition)
                    .forArea("Admin");
            }).not.to.throwError();
        });
    });

    context("when the projection corresponding to the index page has to be registered", () => {
        beforeEach(() => {
            let key = "prettygoat:definitions:Index:Mock";
            objectContainer.setup(o => o.contains(key)).returns(a => true);
            objectContainer.setup(o => o.get(key)).returns(a => new MockProjectionDefinition());
        });
        it("should be registered with a default area name", () => {
            subject.index(MockProjectionDefinition);
            let areas = subject.getAreas();

            expect(areas[0].area).to.be("Index");
        });
    });

    context("when the projection corresponding to the master page has to be registered", () => {
        beforeEach(() => {
            let key = "prettygoat:definitions:Master:Mock";
            objectContainer.setup(o => o.contains(key)).returns(a => true);
            objectContainer.setup(o => o.get(key)).returns(a => new MockProjectionDefinition());
        });
        it("should be registered with a default area name", () => {
            subject.master(MockProjectionDefinition);
            let areas = subject.getAreas();

            expect(areas[0].area).to.be("Master");
        });
    });

    context("when a projection needs to be retrieved", () => {
        beforeEach(() => {
            let key = "prettygoat:definitions:Admin:Mock";
            objectContainer.setup(o => o.contains(key)).returns(a => true);
            objectContainer.setup(o => o.get(key)).returns(a => new MockProjectionDefinition());
            subject.add(MockProjectionDefinition).forArea("Admin")
        });

        context("and I supply the stream name", () => {
            it("should retrieve it", () => {
                let entry = subject.getEntry("test");

                expect(entry.data.projection.name).to.be("test");
            });
        });

        context("and I supply the registered projection name", () => {
            it("should retrieve it", () => {
                let entry = subject.getEntry("Mock", "Admin");

                expect(entry.data.projection.name).to.be("test");
            });
        });

        context("and I supply an inexistent area name", () => {
            it("should return no data", () => {
                let entry = subject.getEntry("Mock", "AdminBad");

                expect(entry.data).to.be(null);
            });
        });
    });

    context("when a split projection is registered without a parameters key", () => {
        beforeEach(() => {
            let key = "prettygoat:definitions:Admin:Split";
            objectContainer.setup(o => o.contains(key)).returns(a => true);
            objectContainer.setup(o => o.get(key)).returns(a => new SplitProjectionDefinition());
        });

        it("should throw an error", () => {
            expect(() => subject.add(SplitProjectionDefinition).forArea("Admin")).to.throwError();
        });
    });
});