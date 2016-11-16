toposort = require('toposort');


/**
 * Created by marian on 16/11/16.
 */
var graph = [ [ 'CircularA', 'CircularB' ],
    [ 'CircularB', 'CircularA' ] ];

console.log(graph);

console.log(toposort(graph));

