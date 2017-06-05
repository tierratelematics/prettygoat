interface ILookup {
    sync(timestamp: Date): Promise<void>;
    keysFor(id: string): Promise<string[]>;
}

export default ILookup
