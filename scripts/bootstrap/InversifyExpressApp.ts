import { InversifyExpressServer } from 'inversify-express-utils';

const cors = require("cors");
let server = null;

export function createServer(kernel:any) {
    if(!server) {
        server = new InversifyExpressServer(kernel).build().use(cors());
    }
    return server;
}

let app = () => server;

export default app;