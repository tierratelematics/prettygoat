import { Projection, IProjection } from "./boilerplate"

@Projection("count") // will be /count
export class CountProjection implements IProjection {
    
    public definition(source) {
        return source.fromAll()
            .when({
                $init: () => { return 0 },
                $any: (s, e) => { return s++ }
            })
    }
}

@Projection("simple") // will be /simple
export class SimpleProjection implements IProjection {

    public definition(source) {
        return source.fromAll()
            .when({
                FarmRegistered: (s, e) => { 
                    s.id = e.farmId
                    s.name = e.name
                     
                    return s
                }  
            })
    }
}

@Projection("for-each-farm") // will be /for-each-farm/{id}
export class GroupedProjection implements IProjection {

    public definition(source) {
        return source.fromAll()
            .groupBy({
                FarmRegistered: e => e.farmId,
                $default: e => e.id
            })
            .when({
                FarmRegistered: (s, e) => { 
                    s.id = e.farmId
                    return s
                }  
            })
    }
}
