class PushContext {
    area:string;
    viewmodelId:string;
    parameters:any;

    constructor(area:string, viewmodelId?:string, parameters?:any) {
        this.area = area;
        this.viewmodelId = viewmodelId;
        this.parameters = parameters;
    }
}

export default PushContext