export type RedisEndpoint = {
    host: string;
    port: number;
}

export type IRedisConfig = RedisEndpoint | RedisEndpoint[];
