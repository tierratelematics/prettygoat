import PushContext from "./PushContext";

class ContextOperations {
    // Determinate the event name to communicate with the frontend
    static getChannel(context: PushContext): string {
        return `${context.area}:${context.projectionName}`;
    }

    // Group connected clients in notifications groups so I can broadcast to a room when a projection changes
    static getRoom(context: PushContext, notificationKey?: string): string {
        let channel = `/${context.area}/${context.projectionName}`.toLowerCase();
        if (notificationKey)
            channel += `/${notificationKey}`;
        return channel;
    }
}

export default ContextOperations
