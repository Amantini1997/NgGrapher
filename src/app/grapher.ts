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

// interface GrapherJSON {
//     nodeType: NodeType,
//     edgeType: EdgeType,
//     structure: DataStructure,
//     nodes: Array<any>,
//     edges: Array<Edge>,
//     initialValues: Array<number>,
//     swap: Function
// }

declare type Edge = [any, any];

enum NodeSelectionMode {
    None = "None",
    Selected = "Selected",
    Compared = "Compared"
}

interface Node {
    id: number,
    value: number,
    mode: NodeSelectionMode 
}

class Grapher {
    private nodeType: NodeType;
    private edgeType: EdgeType;
    private structure: DataStructure;
    private nodes: Array<Node>;    
    private edges: Array<Edge>;
    private swapFunction: Function;
    private index: number = 0;

    private readonly DEFAULT_INITIAL_VALUES = [1, 6, 2, 4, 8, 0, 8, 3];

    userInputIsAllowed: boolean = true;

    constructor (
        nodeType?: NodeType,
        edgeType?: EdgeType,
        structure?: DataStructure,
        initialValues?: Array<any>
    ) {
        this._setNodeType(nodeType);
        this._setEdgeType(edgeType);   
        this._setDataStructure(structure);
        initialValues = initialValues || this.DEFAULT_INITIAL_VALUES;
        this.nodes = initialValues.map(value => {
            return {
                id: this.index++,
                value: value,
                mode: NodeSelectionMode.None
            }
        }) || [];
    }

    _setNodeType(nodeType: NodeType) {
        if (NodeType[nodeType]) {
            this.nodeType = nodeType;
        } else {
            throw new Error(this.getErrorMessage(nodeType, "NodeType", NodeType));
        }
    }

    getNodeType(): NodeType {
        return this.nodeType;
    }

    getNodes(): Array<Node> {
        return this.nodes;
    }

    setNodeModeSelected(id: number) {
        const node = this.nodes.find(node => node.id == id);
        node.mode = NodeSelectionMode.Selected;
    }

    setNodeModeCompared(id: number) {
        const node = this.nodes.find(node => node.id == id);
        node.mode = NodeSelectionMode.Compared
    }

    setNodeModeNone(id: number) {
        const node = this.nodes.find(node => node.id == id);
        node.mode = NodeSelectionMode.None;
    }

    _setEdgeType(edgeType: EdgeType) {
        if (EdgeType[edgeType]) {
            this.edgeType = edgeType;
        } else {
            throw new Error(this.getErrorMessage(edgeType, "EdgeType", EdgeType));
        }
    }

    getEdgeType(): EdgeType {
        return this.edgeType;
    }

    getEdges(): Array<Edge> {
        return this.edges;
    }

    _setDataStructure(structure: DataStructure) {
        if (DataStructure[structure]) {
            this.structure = structure;
        } else {
            throw new Error(this.getErrorMessage(structure, "DataStructure", DataStructure));
        }
    }

    getDataStructure(): DataStructure {
        return this.structure;
    }

    getElementAt(index: number): Node {
        return this.nodes[index];
    }

    // setDefaultUserInput(input: Array<any>) {
    //     this.defaultUSerInput = input;
    // }

    setSwapFunction(swapFunction: Function) {
        this.swapFunction = swapFunction;
    }

    swap(index1: string, index2: string) {
        console.log(index1, index2)
        this.swapFunction(index1, index2);
    }

    blockUserInput() {
        this.userInputIsAllowed = false;
    }

    push(node: any) {
        this.nodes.push(node);
    }

    pop(): any {
        return this.nodes.pop();
    }

    unshift(node: any) {
        this.nodes.unshift(node);
    }

    shift(): any {
        return this.nodes.shift();
    }

    insertAt(node: any, index: number) {
        this.nodes.splice(index, 0, node);
    }

    removeAt(index: number): any {
        return this.nodes.splice(index, index)[0];
    }

    noShiftRemoveAt(index: number): any {
        const removedNode = this.nodes[index];
        delete this.nodes[index];
        return removedNode;
    }

    replaceAt(node: any, index: number): any {
        return this.nodes.splice(index, 1, node)[0];
    }

    // buildGraph(): GrapherJSON {
    //     // all the fields must be set to a value
    //     if (! (this.nodeType && this.edgeType && this.structure)) {
    //         throw new Error("All the fields must be set to a non-null value");
    //     }
    //     return null;
    // }

    getErrorMessage(obj: any, enumName: string, enumList: any): string {
        return "Expected object of type " + enumName +", but received " + obj +
        ". \nAllowed types are: " + Object.keys(enumList).join(", ");
    }


}

class Sorter extends Grapher {
    constructor(initialValues?: Array<any>) {
        super(
            NodeType.Bar,
            EdgeType.None,
            DataStructure.BarPlot,
            initialValues
        );
    }
}

class BinaryTree extends Grapher {
    constructor(initialValues?: Array<any>) {
        super(
            NodeType.Circle,
            EdgeType.SinglePlainEdge,
            DataStructure.Tree,
            initialValues
        );
    }
}

class List extends Grapher {
    constructor(initialValues?: Array<any>) {
        super(
            NodeType.Square,
            EdgeType.None,
            DataStructure.List,
            initialValues
        );
    }
}

export {
    Grapher,
    Sorter,
    BinaryTree,
    List,
    NodeType,
    NodeSelectionMode,
    EdgeType,
    DataStructure
}