class MockRequest {

    headers: {};
    body: any;
    params: any;
    query: any;
    originalUrl: string;

    get(name: string): string {
        return null;
    }

    header(name: string): string {
        return null;
    }
}

export default MockRequest;