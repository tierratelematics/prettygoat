import "reflect-metadata";
import expect = require("expect.js");
import {IMock, Mock, Times, It} from "typemoq";
import IProjectionSorter from "../scripts/projections/IProjectionSorter";
import DynamicNameProjection from "./fixtures/definitions/DynamicNameProjection";
import MemoizingProjectionSorter from "../scripts/projections/MemoizingProjectionSorter";

describe("Given a MemoizingProjectionSorter", () => {

    let subject: IProjectionSorter;
    let sorter: IMock<IProjectionSorter>;
    let projection = new DynamicNameProjection("projection").define();

    beforeEach(() => {
        sorter = Mock.ofType<IProjectionSorter>();
        sorter.setup(s => s.dependents(It.isValue(projection))).returns(() => ["test"]);
        subject = new MemoizingProjectionSorter(sorter.object);
    });

    context("when requesting the dependents of a projection", () => {
        context("and a cached entry does not exist", () => {
            it("should request it from the sorter", () => {
                let dependents = subject.dependents(projection);
                expect(dependents).to.eql(["test"]);
                sorter.verify(s => s.dependents(It.isValue(projection)), Times.once());
            });
        });

        context("and a cached entry exists", () => {
            beforeEach(() => subject.dependents(projection));
            it("should serve it from cache", () => {
                let dependents = subject.dependents(projection);
                expect(dependents).to.eql(["test"]);
                sorter.verify(s => s.dependents(It.isValue(projection)), Times.once());
            });
        });
    });
});