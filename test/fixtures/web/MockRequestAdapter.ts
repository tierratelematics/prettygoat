import {IRequestAdapter, IRequest, IResponse} from "../../../scripts/web/IRequestComponents";

export default class MockRequestAdapter implements IRequestAdapter {
    route(request: IRequest, response: IResponse) {
    }

    canHandle(request: IRequest, response: IResponse): boolean {
        return undefined;
    }

}