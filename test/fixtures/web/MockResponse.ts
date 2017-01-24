import {IResponse} from "../../../scripts/web/IRequestComponents";

export default class MockResponse implements IResponse {
    originalResponse: null;

    header(key: string, value: string) {
    }

    status(code: number) {
    }

    send(data: any) {
    }

}

