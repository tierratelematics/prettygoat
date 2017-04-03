import {IPartialFilterStrategy} from "../../scripts/filters/IFilterStrategy";
import {IFilterContext, FilterOutputType, FilterResult} from "../../scripts/filters/FilterComponents";

export class ContentFilterStrategy implements IPartialFilterStrategy<any> {

    filter(state: any, context: IFilterContext): {filteredState: any; type: FilterOutputType} {
        return {
            filteredState: state,
            type: FilterOutputType.CONTENT
        }
    }

}

export class AsyncContentFilterStrategy implements IPartialFilterStrategy<any> {

    filter(state: any, context: IFilterContext): Promise<FilterResult<any>> {
        return Promise.resolve({
            filteredState: state,
            type: FilterOutputType.CONTENT
        });
    }

}

export class ForbiddenFilterStrategy implements IPartialFilterStrategy<any> {

    filter(state: any, context: IFilterContext): {filteredState: any; type: FilterOutputType} {
        return {
            filteredState: state,
            type: FilterOutputType.FORBIDDEN
        }
    }

}

export class UnauthorizedFilterStrategy implements IPartialFilterStrategy<any> {

    filter(state: any, context: IFilterContext): {filteredState: any; type: FilterOutputType} {
        return {
            filteredState: state,
            type: FilterOutputType.UNAUTHORIZED
        }
    }

}