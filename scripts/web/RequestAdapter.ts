import {IRequestAdapter, IRequestHandler} from "./IRequestComponents";
import {Request, Response} from "express";
import {multiInject, inject} from "inversify";
import ICluster from "../cluster/ICluster";

class RequestAdapter implements IRequestAdapter {

    constructor(@multiInject("IRequestHandler") requestHandlers: IRequestHandler[],
                @inject("ICluster") private cluster: ICluster) {

    }

    route(request: Request, response: Response) {

    }

}

export default RequestAdapter