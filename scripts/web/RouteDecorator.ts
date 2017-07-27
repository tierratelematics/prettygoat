import {injectable, decorate} from "inversify";
import Methods from "./Methods";

function Route(path: string, method?: Methods) {
    return function (target: any) {
        decorate(injectable(), target);
        Reflect.defineMetadata("prettygoat:method", method, target);
        Reflect.defineMetadata("prettygoat:path", path, target);
        return target;
    };
}

export default Route
