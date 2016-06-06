import IPushNotifier from "./IPushNotifier";
import IProjectionRunner from "../projections/IProjectionRunner";
import PushContext from "./PushContext";
import IProjectionRouter from "./IProjectionRouter";
import ContextOperations from "./ContextOperations";
import {Request} from "express";
import {Response} from "express";
import IEventEmitter from "./IEventEmitter";
import IClientRegistry from "./IClientRegistry";
import * as _ from "lodash";
import ClientEntry from "./ClientEntry";
import {injectable, inject} from "inversify";
import IEndpointConfig from "../configs/IEndpointConfig";
import {SplitProjectionRunner} from "../projections/SplitProjectionRunner";

@injectable()
class PushNotifier implements IPushNotifier {

    constructor(@inject("IProjectionRouter") private router:IProjectionRouter,
                @inject("IEventEmitter") private eventEmitter:IEventEmitter,
                @inject("IClientRegistry") private registry:IClientRegistry,
                @inject("IEndpointConfig") private config:IEndpointConfig) {

    }

    register<T>(projectionRunner:IProjectionRunner<T>, context:PushContext, parametersKey?:(p:any) => string):void {
        if (projectionRunner instanceof SplitProjectionRunner) {
            projectionRunner.subscribe(splitKey => this.notifyWithParameters(context, parametersKey, splitKey));
            this.router.get(ContextOperations.getEndpoint(context, true), (request:Request, response:Response) => {
                let runner = <SplitProjectionRunner<string>>projectionRunner.runnerFor(request.param('key'));
                if (runner)
                    response.json(runner.state);
                else
                    response.status(404).json({error: 'Projection not found'});
            });
        } else {
            projectionRunner.subscribe(state => this.notify(context));
            this.router.get(ContextOperations.getEndpoint(context), (request:Request, response:Response) => {
                response.json(projectionRunner.state);
            });
        }
    }

    notify(context:PushContext, clientId?:string):void {
        let clients = this.registry.clientsFor(context);
        if (clientId)
            this.emitToClient(clientId, context);
        else
            _.forEach<ClientEntry>(clients, client => this.emitToClient(client.id, context));
    }

    private notifyWithParameters(context:PushContext, parametersKey?:(p:any)=>string, splitKey?:string):void {
        let clients = this.registry.clientsFor(context);
        _.forEach<ClientEntry>(clients, client => {
            if (parametersKey(context.parameters) === splitKey)
                this.emitToClient(client.id, context);
        });
    }

    private emitToClient(clientId:string, context):void {
        let endpoint = ContextOperations.getEndpoint(context);
        this.eventEmitter.emitTo(
            clientId,
            ContextOperations.getChannel(context),
            {
                url: `${this.config.protocol}://${this.config.host}:${this.config.port}${endpoint}`
            });
    }
}

export default PushNotifier