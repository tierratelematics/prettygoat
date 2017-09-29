import ILogger from "./ILogger";
import LogLevel from "./LogLevel";

export class NullLogger implements ILogger {


    debug(message: string) {
    }

    info(message: string) {
    }

    warning(message: string) {
    }

    error(error: string | Error) {
    }

    setLogLevel(level: LogLevel) {
    }
}

export default new NullLogger()
