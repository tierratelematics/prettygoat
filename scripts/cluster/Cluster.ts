import ICluster from "./ICluster";
const Ringpop = require('ringpop');
const TChannel = require('tchannel');

class Cluster implements ICluster {
    name = "";
    size = 0;
    basePort = 0;
    bootstrapNodes: string[] = [];

    constructor(options) {
        this.name = options.name;
        this.size = options.size;
        this.basePort = options.basePort;
        this.bootstrapNodes = [];
        for (let i = 0; i < this.size; i++) {
            this.bootstrapNodes.push('127.0.0.1:' + (this.basePort + i));
        }
    }

    launch(callback: Function) {
        let done = after(this.size, callback);

        for (let i = 0; i < this.size; i++) {
            let addr = this.bootstrapNodes[i];
            let addrParts = addr.split(':');

            let tchannel = new TChannel();
            let ringpop = new Ringpop({
                app: this.name,
                hostPort: addr,
                channel: tchannel.makeSubChannel({
                    serviceName: 'ringpop',
                    trace: false
                })
            });
            ringpop.setupChannel();

            // First make sure TChannel is accepting connections.
            tchannel.listen(+addrParts[1], addrParts[0], () => ringpop.bootstrap(this.bootstrapNodes, done));
        }
    }
}

function after(count, callback) {
    let countdown = count;

    return function shim(err) {
        if (typeof callback !== 'function') return;

        if (err) {
            callback(err);
            callback = null;
            return;
        }

        if (--countdown === 0) {
            callback();
            callback = null;
        }
    };
}