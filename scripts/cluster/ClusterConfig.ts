export interface IClusterConfig {
    nodes: string[];
    size: number;
}

export class EmbeddedClusterConfig implements IClusterConfig {
    nodes = ["127.0.0.1:3000"];
    size = 1;
}
