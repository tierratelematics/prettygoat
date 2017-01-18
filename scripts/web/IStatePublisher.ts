import PushContext from "./PushContext";
import IProjectionRunner from "../projections/IProjectionRunner";

interface IStatePublisher {
    publish<T>(projectionRunner:IProjectionRunner<T>, context:PushContext):void;
}

export default IStatePublisher