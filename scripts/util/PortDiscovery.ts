const portscanner = require("portscanner");

class PortDiscovery {

    static freePort(initialPort: number, host?: string): Promise<number> {
        return portscanner.findAPortNotInUse(initialPort, host);
    }
}

export default PortDiscovery
