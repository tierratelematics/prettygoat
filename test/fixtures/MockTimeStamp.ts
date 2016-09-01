export class MockTimeStamp {
    private date: Date;

    constructor(dateString: string) {
        this.date = new Date(dateString);
    }

    public getDate() {
        return this.date;
    }
}
