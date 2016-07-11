import IStatePublisher from "../../scripts/routing/IStatePublisher";
import PushContext from "../../scripts/push/PushContext";
import IProjectionRunner from "../../scripts/projections/IProjectionRunner";

class MockStatePublisher implements IStatePublisher {
    publish<T>(projectionRunner:IProjectionRunner<T>, context:PushContext):void {
    }

}

export default MockStatePublisher