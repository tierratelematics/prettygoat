interface ISocketFactory {
    socketForPath(path?:string):SocketIO.Server;
}

export default ISocketFactory