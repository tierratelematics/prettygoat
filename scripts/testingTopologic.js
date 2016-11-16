/**
 * Created by marian on 16/11/16.
 */
toposort = require('toposort');

var graph = [
    ['tie your shoes', 'put on your shoes']
    , ['put on your jacket', 'put on your shirt']
    , ['put on your shoes', 'put on your shorts']
    , ['put on your shorts', 'put on your shoes']
    , ['put on your jacket', 'put on your shorts']
];

console.log(toposort(graph));
