import {injectable, decorate} from "inversify";

function Projection(name:string) {
    return function (target:any) {
        decorate(injectable(), target);
        Reflect.defineMetadata("prettygoat:projection", name, target);
        return target;
    };
}

export default Projection
