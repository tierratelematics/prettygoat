import PushContext from "./PushContext";

class ContextOperations {
    static getRoom(context: PushContext, notificationKey?: string): string {
        let channel = `/${context.area}/${context.projectionName}`.toLowerCase();
        if (notificationKey)
            channel += `/${notificationKey}`;
        return channel;
    }
}

export default ContextOperations
