import IStatePublisher from "../../../scripts/web/IStatePublisher";
import PushContext from "../../../scripts/web/PushContext";
import IProjectionRunner from "../../../scripts/projections/IProjectionRunner";

class MockStatePublisher implements IStatePublisher {
    publish<T>(projectionRunner:IProjectionRunner<T>, context:PushContext):void {
    }

}

export default MockStatePublisher