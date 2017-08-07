import "reflect-metadata";
import expect = require("expect.js");
import {IMock, Mock, Times, It} from "typemoq";
import MockProjectionDefinition from "./fixtures/definitions/MockProjectionDefinition";
import MockNotificationProjection from "./fixtures/definitions/MockNotificationProjection";
import BadNotificationProjection from "./fixtures/definitions/BadNotificationProjection";
import MockReadModel from "./fixtures/definitions/MockReadModel";
import MockPublishPointDefinition from "./fixtures/definitions/MockPublishPointDefinition";
import {IProjectionRegistry, ProjectionRegistry} from "../scripts/bootstrap/ProjectionRegistry";
import {IProjectionFactory} from "../scripts/projections/ProjectionFactory";
import {IProjection} from "../scripts/projections/IProjection";

describe("ProjectionRegistry, given a list of projection definitions", () => {

    let subject: IProjectionRegistry,
        projectionFactory: IMock<IProjectionFactory>;

    beforeEach(() => {
        projectionFactory = Mock.ofType<IProjectionFactory>();
        subject = new ProjectionRegistry(projectionFactory.object);
    });

    context("when they are registered under a specific area", () => {

        it("should register the projection handler with the right contexts", () => {
            projectionFactory.setup(o => o.create(MockProjectionDefinition)).returns(a => new MockProjectionDefinition().define());

            subject.add(MockProjectionDefinition).forArea("Admin");
            let areas = subject.projections();

            expect(areas[0][0]).to.be("Admin");
        });
    });

    context("when a projection with that name already exists", () => {
        beforeEach(() => {
            projectionFactory.setup(o => o.create(MockProjectionDefinition)).returns(a => new MockProjectionDefinition().define());
        });
        it("should throw an error", () => {
            expect(() => {
                subject.add(MockProjectionDefinition).add(MockProjectionDefinition).forArea("Admin");
            }).to.throwError();
        });
    });

    context("when a projection has illegal characters", () => {
        beforeEach(() => {
            projectionFactory.setup(o => o.create(MockProjectionDefinition)).returns(a => new MockProjectionDefinition(null, "Admin:/").define());
        });
        it("should throw an error", () => {
            expect(() => {
                subject.add(MockProjectionDefinition).forArea("Admin");
            }).to.throwError();
        });
    });

    context("when a projection with the same publish points has been registered", () => {
        beforeEach(() => {
            projectionFactory.setup(o => o.create(MockProjectionDefinition)).returns(a => new MockProjectionDefinition().define());
            projectionFactory.setup(o => o.create(MockPublishPointDefinition)).returns(a => new MockPublishPointDefinition().define());
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
                projectionFactory.setup(o => o.create(BadNotificationProjection)).returns(a => new BadNotificationProjection().define());
            });
            it("should throw an error", () => {
                expect(() => {
                    subject.add(BadNotificationProjection).forArea("Admin");
                }).to.throwError();
            });
        });

        context("and all the events of the definition are present", () => {
            beforeEach(() => {
                projectionFactory.setup(o => o.create(MockNotificationProjection)).returns(a => new MockNotificationProjection().define());
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
            projectionFactory.setup(o => o.create(MockProjectionDefinition)).returns(a => new MockProjectionDefinition().define());
        });
        it("should be registered with a default area name", () => {
            subject.index(MockProjectionDefinition);
            let areas = subject.projections();

            expect(areas[0][0]).to.be("Index");
        });
    });

    context("when the projection corresponding to the master page has to be registered", () => {
        beforeEach(() => {
            projectionFactory.setup(o => o.create(MockProjectionDefinition)).returns(a => new MockProjectionDefinition().define());
        });
        it("should be registered with a default area name", () => {
            subject.master(MockProjectionDefinition);
            let areas = subject.projections();

            expect(areas[0][0]).to.be("Master");
        });
    });

    context("when a readmodel has to be registered", () => {
        beforeEach(() => {
            projectionFactory.setup(o => o.create(MockReadModel)).returns(a => <IProjection>new MockReadModel().define());
        });
        it("should be added to a specific area", () => {
            subject.readmodel(MockReadModel);
            let areas = subject.projections();

            expect(areas[0][0]).to.be("Readmodel");
        });
    });

    context("when a projection needs to be retrieved", () => {
        beforeEach(() => {
            projectionFactory.setup(o => o.create(MockProjectionDefinition)).returns(a => new MockProjectionDefinition().define());
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
