import IPushNotifier from "./IPushNotifier";
import IProjectionRunner from "../interfaces/IProjectionRunner";
import PushContext from "./PushContext";
import IProjectionRouter from "./IProjectionRouter";
import ContextOperations from "./ContextOperations";
import {Request} from "express";
import {Response} from "express";
import IEventEmitter from "./IEventEmitter";
import IClientRegistry from "./IClientRegistry";
import * as _ from "lodash";
import ClientEntry from "./ClientEntry";

class PushNotifier implements IPushNotifier {

    constructor(private router:IProjectionRouter, private eventEmitter:IEventEmitter, private registry:IClientRegistry) {

    }

    register<T>(projectionRunner:IProjectionRunner<T>, context:PushContext):void {
        projectionRunner.subscribe(state => {
            let clients = this.registry.clientsFor(context);
            _.forEach<ClientEntry>(clients, client => this.eventEmitter.emitTo(
                client.id,
                ContextOperations.getChannel(context), {
                    url: ContextOperations.getEndpoint(context)
                })
            );
        });
        this.router.get(ContextOperations.getEndpoint(context), (request:Request, response:Response) => {
            response.json(projectionRunner.state);
        });
    }
}

export default PushNotifier