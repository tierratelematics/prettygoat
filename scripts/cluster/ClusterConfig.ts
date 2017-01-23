export interface IClusterConfig {
    nodes: string[];
    port: number;
    host: string;
}

export class EmbeddedClusterConfig implements IClusterConfig {
    nodes = ["127.0.0.1:4000"];
    port = 4000;
    host = "127.0.0.1";
}
