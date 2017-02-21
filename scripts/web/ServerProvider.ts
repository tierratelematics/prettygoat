import IServerProvider from "./IServerProvider";
import {Server} from "net";
import * as express from "express";
import * as http from "http";
import {injectable} from "inversify";

@injectable()
class ServerProvider implements IServerProvider {

    private server: Server;
    private application: express.Application;

    constructor() {
        this.application = express();
        this.server = http.createServer(this.application);
    }

    provideServer(): Server {
        return this.server
    }

    provideApplication(): express.Application {
        return this.application;
    }

}

export default ServerProvider