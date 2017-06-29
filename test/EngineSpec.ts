import "reflect-metadata";
import expect = require("expect.js");
import {DisabledModule, ValidModule, WithoutFTModule} from "./fixtures/Modules";
import {Engine} from "../scripts/bootstrap/Engine";

describe("Engine, given some modules", () => {

    let engine: Engine;

    beforeEach(() => {
        engine = new Engine();
    });

    context("when a module does not check under a feature toggle", () => {
        it("should not be registered", () => {
            expect(engine.register(new DisabledModule())).to.be(false);
        });
    });

    context("when a module validates under a feature toggle", () => {
        it("should be registered", () => {
            expect(engine.register(new ValidModule())).to.be(true);
        });
    });

    context("when a modules does not have a feature toggle", () => {
        it("should be registered", () => {
            expect(engine.register(new WithoutFTModule())).to.be(true);
        });
    });
});
