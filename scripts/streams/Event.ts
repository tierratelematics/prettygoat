interface Event {
    type:string;
    payload:any;
    timestamp?:string;
    splitKey?:string;
}

export default Event