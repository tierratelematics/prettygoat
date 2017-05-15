function Private() {
    return function (target: any) {
        Reflect.defineMetadata("prettygoat:private", true, target);
        return target;
    };
}

export default Private
