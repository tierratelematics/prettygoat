import IProjectionRunner from "../projections/IProjectionRunner";
import PushContext from "./PushContext";

interface IPushNotifier {
    register<T>(projectionRunner:IProjectionRunner<T>, context:PushContext):void;
    notify(context:PushContext, clientId?:string, splitKey?:string):void;
}

export default IPushNotifier