function Projection(name:string) {
    return function (target:any) {
        Reflect.defineMetadata("prettygoat:projection", name, target);
        return target;
    };
}

export default Projection;