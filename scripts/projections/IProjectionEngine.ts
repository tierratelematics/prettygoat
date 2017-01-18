import {IProjection} from "./IProjection";
import PushContext from "../web/PushContext";

interface IProjectionEngine {
    run(projection?: IProjection<any>, context?: PushContext);
}

export default IProjectionEngine