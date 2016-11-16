class Edge{
    nodeFrom : string;
    nodeTo   : string;

    private returnEdge():string[]{
        return [this.nodeFrom,this.nodeTo];
    }
}

export default Edge