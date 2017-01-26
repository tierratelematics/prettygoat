import {injectable, decorate} from "inversify";

function Channel(name: string) {
    return function (target: any) {
        decorate(injectable(), target);
        Reflect.defineMetadata("prettygoat:path", name, target);
        return target;
    };
}

export default Channel