class ClientEntry {
    id:string;
    parameters:any;

    constructor(id:string, parameters?:any) {
        this.id = id;
        this.parameters = parameters;
    }
}

export default ClientEntry