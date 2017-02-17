import {Server} from "net";
import {Application} from "express";

interface IServerProvider {
    provideServer(): Server;
    provideApplication(): Application;
}

export default IServerProvider