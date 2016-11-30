import { InversifyExpressServer } from 'inversify-express-utils';
import {inizializeServer} from "./Server";

const cors = require("cors");
let server = null;

export function createServer(kernel:any) {
    if(!server) {
        server = new InversifyExpressServer(kernel).build().use(cors());
        inizializeServer();
    }
    return server;
}

let app = () => server;

export default app;