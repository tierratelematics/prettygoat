import "reflect-metadata";
import expect = require("expect.js");
import {IMock, Mock, Times, It} from "typemoq";
import MockProjectionDefinition from "./fixtures/definitions/MockProjectionDefinition";
import IObjectContainer from "../scripts/ioc/IObjectContainer";
import ITickScheduler from "../scripts/ticks/ITickScheduler";
import TickScheduler from "../scripts/ticks/TickScheduler";
import Dictionary from "../scripts/util/Dictionary";
import MockNotificationProjection from "./fixtures/definitions/MockNotificationProjection";
import BadNotificationProjection from "./fixtures/definitions/BadNotificationProjection";
import MockReadModel from "./fixtures/definitions/MockReadModel";
import MockPublishPointDefinition from "./fixtures/definitions/MockPublishPointDefinition";
import {IProjectionDefinition} from "../scripts/projections/IProjection";
import {IProjectionRegistry, ProjectionRegistry} from "../scripts/bootstrap/ProjectionRegistry";

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
            objectContainer.setup(o => o.resolve(MockProjectionDefinition)).returns(a => new MockProjectionDefinition());

            subject.add(MockProjectionDefinition).forArea("Admin");
            let areas = subject.projections();

            expect(areas[0][0]).to.be("Admin");
        });

        it("should pass a tick scheduler to the definition", () => {
            let projectionDefinition = setUpTickScheduler();

            projectionDefinition.verify(p => p.define(It.isValue(tickScheduler)), Times.once());
        });

        it("should cache the tick scheduler passed to the definition", () => {
            setUpTickScheduler();

            expect(holder["Mock"]).to.be(tickScheduler);
        });

        function setUpTickScheduler(): IMock<IProjectionDefinition<number>> {
            let projectionDefinition = Mock.ofType<IProjectionDefinition<number>>();
            objectContainer.setup(o => o.resolve(MockProjectionDefinition)).returns(a => projectionDefinition.object);
            projectionDefinition.setup(p => p.define(It.isValue(tickScheduler))).returns(() => {
                return {name: "Mock", definition: {}, publish: {}};
            });
            subject.add(MockProjectionDefinition).forArea("Admin");
            return projectionDefinition;
        }
    });

    context("when a projection with that name already exists", () => {
        beforeEach(() => {
            objectContainer.setup(o => o.resolve(MockProjectionDefinition)).returns(a => new MockProjectionDefinition());
        });
        it("should throw an error", () => {
            expect(() => {
                subject.add(MockProjectionDefinition).add(MockProjectionDefinition).forArea("Admin");
            }).to.throwError();
        });
    });

    context("when a projection with the same publish points has been registered", () => {
        beforeEach(() => {
            objectContainer.setup(o => o.resolve(MockProjectionDefinition)).returns(a => new MockProjectionDefinition());
            objectContainer.setup(o => o.resolve(MockPublishPointDefinition)).returns(a => new MockPublishPointDefinition());
        });
        it("should throw an error", () => {
            expect(() => {
                subject.add(MockProjectionDefinition).add(MockPublishPointDefinition).forArea("Admin");
            }).to.throwError();
        });
    });

    context("when a projection has a notification field", () => {
        context("and not all the events of the definition are present", () => {
            beforeEach(() => {
                objectContainer.setup(o => o.resolve(BadNotificationProjection)).returns(a => new BadNotificationProjection());
            });
            it("should throw an error", () => {
                expect(() => {
                    subject.add(BadNotificationProjection).forArea("Admin");
                }).to.throwError();
            });
        });

        context("and all the events of the definition are present", () => {
            beforeEach(() => {
                objectContainer.setup(o => o.resolve(MockNotificationProjection)).returns(a => new MockNotificationProjection());
            });
            it("should not raise an error", () => {
                expect(() => {
                    subject.add(MockNotificationProjection).forArea("Admin");
                }).not.to.throwError();
            });
        });
    });

    context("when the projection corresponding to the index page has to be registered", () => {
        beforeEach(() => {
            objectContainer.setup(o => o.resolve(MockProjectionDefinition)).returns(a => new MockProjectionDefinition());
        });
        it("should be registered with a default area name", () => {
            subject.index(MockProjectionDefinition);
            let areas = subject.projections();

            expect(areas[0][0]).to.be("Index");
        });
    });

    context("when the projection corresponding to the master page has to be registered", () => {
        beforeEach(() => {
            objectContainer.setup(o => o.resolve(MockProjectionDefinition)).returns(a => new MockProjectionDefinition());
        });
        it("should be registered with a default area name", () => {
            subject.master(MockProjectionDefinition);
            let areas = subject.projections();

            expect(areas[0][0]).to.be("Master");
        });
    });

    context("when a readmodel has to be registered", () => {
        beforeEach(() => {
            objectContainer.setup(o => o.resolve(MockReadModel)).returns(a => new MockReadModel());
        });
        it("should be added to a specific area", () => {
            subject.readmodel(MockReadModel);
            let areas = subject.projections();

            expect(areas[0][0]).to.be("Readmodel");
        });
    });

    context("when a projection needs to be retrieved", () => {
        beforeEach(() => {
            objectContainer.setup(o => o.resolve(MockProjectionDefinition)).returns(a => new MockProjectionDefinition());
            subject.add(MockProjectionDefinition).forArea("Admin");
        });

        context("and the projection name is supplied", () => {
            it("should retrieve it", () => {
                let entry = subject.projectionFor("mock");

                expect(entry[1].name).to.be("Mock");
            });
        });

        context("and an existing publish point is supplied", () => {
            it("should retrieve it", () => {
                let entry = subject.projectionFor("test", "admin");

                expect(entry[1].name).to.be("Mock");
            });
        });

        context("and a non existing publish point is supplied", () => {
            it("should return a null entry", () => {
                let entry = subject.projectionFor("Inexistent", "Admin");

                expect(entry).not.to.be.ok();
            });
        });

        context("and a non existing area is supplied", () => {
            it("should return no data", () => {
                let entry = subject.projectionFor("Test", "AdminBad");

                expect(entry).not.to.be.ok();
            });
        });
    });
});
