import { Projection, IProjection, IProjectionSource } from "./boilerplate";

@Projection("count") // will be /count
export class CountProjection implements IProjection {

    public definition(source: IProjectionSource) {
        return source.fromAll()
            .when({
                $init: () => { return 0; },
                $any: (s: any, e: any) => { return s++; }
            });
    }
}

@Projection("simple") // will be /simple
export class SimpleProjection implements IProjection {

    public definition(source: IProjectionSource) {
        return source.fromAll()
            .when({
                FarmRegistered: (s: any, e: any) => {
                    s.id = e.farmId;
                    s.name = e.name;

                    return s;
                }
            });
    }
}

@Projection("for-each-farm") // will be /for-each-farm/{id}
export class SplitProjection implements IProjection {

    public definition(source: IProjectionSource) {
        return source.fromAll()
            .splitBy({
                FarmRegistered: (e: any) => e.farmId,
                $default: (e: any) => e.id
            })
            .when({
                FarmRegistered: (s: any, e: any) => {
                    s.id = e.farmId;
                    return s;
                }
            });
    }
}
