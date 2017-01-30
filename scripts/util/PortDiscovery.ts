const portUsed = require("tcp-port-used");

class PortDiscovery {

    static freePort(initialPort: number, host?: string): Promise<number> {
        return portUsed.check({
            port: initialPort,
            host: host
        }).then(used => used ? this.freePort(initialPort + 1, host) : initialPort);
    }
}

export default PortDiscovery