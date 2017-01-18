import IProjectionEngine from "../../scripts/projections/IProjectionEngine";
import PushContext from "../../scripts/web/PushContext";
import {IProjection} from "../../scripts/projections/IProjection";

export default class MockProjectionEngine implements IProjectionEngine {
    run(projection?: IProjection<any>, context?: PushContext) {

    }
}