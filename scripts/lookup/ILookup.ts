interface ILookup {
    keysFor(id: string): Promise<string[]>;
}

export default ILookup