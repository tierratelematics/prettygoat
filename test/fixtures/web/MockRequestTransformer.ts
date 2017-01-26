import {IRequestTransformer, IRequest, IResponse} from "../../../scripts/web/IRequestComponents";

export default class MockRequestTransformer implements IRequestTransformer {
    transform(request: IRequest, response: IResponse, next: Function) {
    }

}