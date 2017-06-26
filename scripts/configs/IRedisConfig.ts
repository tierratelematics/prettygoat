type RedisEndpoint = {
    host: string;
    port: number;
}

type IRedisConfig = RedisEndpoint | RedisEndpoint[]

export default IRedisConfig
