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
import Dictionary from "../Dictionary";

@injectable()
class PushNotifier implements IPushNotifier {

    private parameterKeys:Dictionary<(p:any) => string> = {};

    constructor(@inject("IProjectionRouter") private router:IProjectionRouter,
                @inject("IEventEmitter") private eventEmitter:IEventEmitter,
                @inject("IClientRegistry") private registry:IClientRegistry,
                @inject("IEndpointConfig") private config:IEndpointConfig) {

    }

    register<T>(projectionRunner:IProjectionRunner<T>, context:PushContext, parametersKey?:(p:any) => string):void {
        this.parameterKeys[ContextOperations.getChannel(context)] = parametersKey; //Memoize parameters key to notify clients on subscribe
        if (projectionRunner instanceof SplitProjectionRunner) {
            projectionRunner.subscribe(state => this.notifyWithParameters(context, state.splitKey));
            this.router.get(ContextOperations.getEndpoint(context, true), (request:Request, response:Response) => {
                let runner = <SplitProjectionRunner<any>>projectionRunner.runnerFor(request.params['key']);
                if (runner)
                    response.json(runner.state);
                else
                    response.status(404).json({error: "Projection not found"});
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
        if (clientId) {
            if (!_.isEmpty(context.parameters)) {
                let parametersKey = this.parameterKeys[ContextOperations.getChannel(context)];
                this.emitToClient(clientId, context, parametersKey(context.parameters));
            } else {
                this.emitToClient(clientId, context);
            }
        }
        else
            _.forEach<ClientEntry>(clients, client => this.emitToClient(client.id, context));
    }

    private notifyWithParameters(context:PushContext, splitKey?:string):void {
        let clients = this.registry.clientsFor(context),
            parametersKey = this.parameterKeys[ContextOperations.getChannel(context)];
        _.forEach<ClientEntry>(clients, client => {
            if (parametersKey(client.parameters) === splitKey)
                this.emitToClient(client.id, context, splitKey);
        });
    }

    private emitToClient(clientId:string, context:PushContext, splitKey:string = ""):void {
        let endpoint = ContextOperations.getEndpoint(context),
            url = `${this.config.protocol}://${this.config.host}`;
        if (this.config.port)
            url += `:${this.config.port}`;
        if (this.config.path)
            url += this.config.path;
        url += `${endpoint}/${splitKey}`;
        this.eventEmitter.emitTo(clientId, ContextOperations.getChannel(context), {url: url});
    }
}

export default PushNotifier