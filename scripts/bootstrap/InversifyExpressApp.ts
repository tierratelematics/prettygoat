import { InversifyExpressServer } from 'inversify-express-utils';

let server = null;

export function createServer(kernel:any) {
    if(!server) {
        server = new InversifyExpressServer(kernel).build();
    }
    return server;
}

let app = () => server;

export default app;