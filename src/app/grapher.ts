// declare type NodeShape = "Circle" | "Square" | "Bar";
// declare type DataStructure = "Tree" | "List" | "BarPlot";
// declare type Edge = "None" | "PlainEdge" | "DirectedEdge" | "DoublyDirectedEdge";

// declare type NodeType = "Circle" | "Square" | "Bar";

// declare type DataStructure = "Tree" | "List" | "BarPlot";

// declare type EdgeType = "None" | "SinglePlainEdge" | "SingleDirectedEdge" | "DoubleDirectedEdge"


enum NodeType {
    Circle = "Circle",
    Square = "Square",
    Bar = "Bar"
}

enum DataStructure {
    Tree = "Tree",
    List = "List",
    BarPlot = "BarPlot"
}

enum EdgeType {
    None = "None",
    SinglePlainEdge = "SinglePlainEdge",
    SingleDirectedEdge = "SingleDirectedEdge",
    DoubleDirectedEdge = "DoubleDirectedEdge"
}

interface GrapherJSON {
    node: NodeType,
    edge: EdgeType,
    structure: DataStructure
}



class Grapher {
    
    private grapherObject: GrapherJSON = {
        node: null,
        edge: null,
        structure: null
    };

    constructor(
        node: NodeType,
        edge: EdgeType,
        structure: DataStructure
    ) {
        this.setNode(node);
        this.setEdge(edge);   
        this.setStructure(structure);
    }

    setNode(node: NodeType) {
        console.log(NodeType, EdgeType)
        if (NodeType[node]) {
            this.grapherObject.node = node;
        } else {
            throw new Error(this.getErrorMessage(node, "NodeType", NodeType));
        }
    }

    setEdge(edge: EdgeType) {
        if (EdgeType[edge]) {
            this.grapherObject.edge = edge;
        } else {
            throw new Error(this.getErrorMessage(edge, "EdgeType", EdgeType));
        }
    }

    setStructure(structure: DataStructure) {
        if (DataStructure[structure]) {
            this.grapherObject.structure = structure;
        } else {
            throw new Error(this.getErrorMessage(structure, "DataStructure", DataStructure));
        }
    }

    finalise(): GrapherJSON {
        const {node, edge, structure} = this.grapherObject;
        // all the fields must be set to a value
        if (! (node && edge && structure)) {
            throw new Error("All the fields must be set to a non-null value");
        }
        return this.grapherObject;
    }

    getErrorMessage(obj: any, enumName: string, enumList: any): string {
        return "Expected object of type " + enumName +", but received " + obj +
        ". \nAllowed types are: " + Object.keys(enumList).join(", ");
    }
}

class Sorter extends Grapher {
    constructor() {
        super(
            NodeType.Bar,
            EdgeType.None,
            DataStructure.BarPlot
        );
    }
}

class BinaryTree extends Grapher {
    constructor() {
        super(
            NodeType.Circle,
            EdgeType.SinglePlainEdge,
            DataStructure.Tree
        );
    }
}

class List extends Grapher {
    constructor() {
        super(
            NodeType.Square,
            EdgeType.None,
            DataStructure.List
        );
    }
}

export {
    Grapher,
    Sorter,
    BinaryTree,
    List
}