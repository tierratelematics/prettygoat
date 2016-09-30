interface IEndpointConfig {
    host:string;
    port?:number;
    protocol:string;
    path?:string;
    notifications?:{
        host:string;
        port?:number;
        protocol:string;
        path?:string;
    }
}

export default IEndpointConfig