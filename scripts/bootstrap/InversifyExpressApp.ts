import Kernel = inversify.Kernel;
import {InversifyExpressServer} from "inversify-express-utils";
let server = null;

export function createServer(kernel:Kernel){
    if(!server){
        server = new InversifyExpressServer(kernel).build();
    }
}

const app = () => { return server; };

export default app