class PushContext {
    area:string;
    projectionName:string;
    parameters:any;

    constructor(area:string, projectionName:string, parameters?:any) {
        this.area = area;
        this.projectionName = projectionName;
        this.parameters = parameters;
    }
}

export default PushContext