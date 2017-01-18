interface ISocketClient {
    join(room: string);
    leave(room: string);
}

export default ISocketClient