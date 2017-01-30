import ILogger from "../log/ILogger";
import LogLevel from "../log/LogLevel";
import {inject, injectable} from "inversify";

@injectable()
class ProcessLogger implements ILogger {

    constructor(@inject("Logger") private logger: ILogger) {

    }

    debug(message: string) {
        this.logger.debug(`Worker ${process.pid}: ${message}`);
    }

    info(message: string) {
        this.logger.info(`Worker ${process.pid}: ${message}`);
    }

    warning(message: string) {
        this.logger.warning(`Worker ${process.pid}: ${message}`);
    }

    error(error: string|Error) {
        this.logger.error(`Worker ${process.pid} error`);
        this.logger.error(error);
    }

    setLogLevel(level: LogLevel) {
        this.logger.setLogLevel(level);
    }

}

export default ProcessLogger