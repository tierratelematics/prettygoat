interface Event<T> {
    type:string;
    payload:T;
    timestamp?:string;
    splitKey?:string;
}

export default Event