/// <reference path="../node_modules/typemoq/typemoq.node.d.ts" />
import "bluebird";
import "reflect-metadata";
import expect = require("expect.js");
import IProjectionEngine from "../scripts/projections/IProjectionEngine";
import ProjectionEngine from "../scripts/projections/ProjectionEngine";
import IProjectionRegistry from "../scripts/registry/IProjectionRegistry";
import ProjectionRegistry from "../scripts/registry/ProjectionRegistry";
import ProjectionRunnerFactory from "../scripts/projections/ProjectionRunnerFactory";
import PushNotifier from "../scripts/push/PushNotifier";
import IProjectionRunner from "../scripts/projections/IProjectionRunner";
import IPushNotifier from "../scripts/push/IPushNotifier";
import {ProjectionAnalyzer} from "../scripts/projections/ProjectionAnalyzer";
import {Subject} from "rx";
import IProjectionRunnerFactory from "../scripts/projections/IProjectionRunnerFactory";
import MockProjectionRunner from "./fixtures/MockProjectionRunner";
import MockModel from "./fixtures/MockModel";
import MockObjectContainer from "./fixtures/MockObjectContainer";
import MockStatePublisher from "./fixtures/MockStatePublisher";
import Event from "../scripts/streams/Event";
import {Mock, Times, It} from "typemoq";

describe("Given a ProjectionEngine", () => {

    let subject:IProjectionEngine,
        registry:IProjectionRegistry,
        pushNotifier:IPushNotifier,
        runner:IProjectionRunner<MockModel>,
        runnerFactory:IProjectionRunnerFactory;

    beforeEach(() => {
        runner = new MockProjectionRunner(new Subject<Event>());
        pushNotifier = new PushNotifier(null, null, {host: 'test', protocol: 'http', port: 80}, null);
        runnerFactory = new ProjectionRunnerFactory(null, null);
        registry = new ProjectionRegistry(new ProjectionAnalyzer(), new MockObjectContainer());
        subject = new ProjectionEngine(runnerFactory, pushNotifier, registry, new MockStatePublisher());
    });

    context("when a snapshot is present", () => {
        it("should init a projection runner with that snapshot");
    });

    context("when a snapshot is not present", () => {
        it("should init a projection runner without a snapshot");
    });

    context("when a projections triggers a new state", () => {
        context("and a snapshot is needed", () => {
            it("should save the snapshot");
        });

        context("and a snapshot is not needed", () => {
            it("should not save the snapshot");
        });
    });
});
