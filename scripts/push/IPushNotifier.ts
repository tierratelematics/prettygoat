import IProjectionRunner from "../interfaces/IProjectionRunner";
import PushContext from "./PushContext";

interface IPushNotifier {
    register<T>(projectionRunner:IProjectionRunner<T>, pushContext:PushContext):void;
}

export default IPushNotifier