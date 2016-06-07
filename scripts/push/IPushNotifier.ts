import IProjectionRunner from "../projections/IProjectionRunner";
import PushContext from "./PushContext";

interface IPushNotifier {
    register<T>(projectionRunner:IProjectionRunner<T>, context:PushContext, parametersKey?:(p:any) => string):void;
    notify(context:PushContext, clientId?:string):void;
}

export default IPushNotifier