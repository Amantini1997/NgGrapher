// declare type NodeShape = "Circle" | "Square" | "Bar";
// declare type DataStructure = "Tree" | "List" | "BarPlot";
// declare type Edge = "None" | "PlainEdge" | "DirectedEdge" | "DoublyDirectedEdge";

import { AnimatorComponent } from "./animator/animator.component";
import { printRuntimeError } from "./errorGenerator";
import { DataStructure, Edge, EdgeType, NodeType, NodeValue, NodeSelectionMode, Node } from "./interfaces/grapherInterfaces";

// declare type NodeType = "Circle" | "Square" | "Bar";

// declare type DataStructure = "Tree" | "List" | "BarPlot";

// declare type EdgeType = "None" | "SinglePlainEdge" | "SingleDirectedEdge" | "DoubleDirectedEdge"



function getNodeFromDataStructure(dataStructure: DataStructure): NodeType {
    switch(dataStructure) {
        case DataStructure.BarPlot: return NodeType.Bar;
        case DataStructure.List: return NodeType.Square;
        case DataStructure.Tree: return NodeType.Circle;
    }
}

class Grapher {
    private nodeType: NodeType;
    private edgeType: EdgeType;
    private dataStructure: DataStructure;
    private nodes: Node[];    
    private edges: Edge[];
    private lastIndex: number = 0;
    private animator: AnimatorComponent;
    private readonly HEX_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
    private readonly DEFAULT_HEX_COLOR = "#135589";
    private readonly SELECTED_HEX_COLOR = "#2277ee";
    private readonly COMPARED_HEX_COLOR = "#f99f48";

    userInputIsAllowed: boolean = true;

    constructor (
        nodeType?: NodeType,
        dataStructure?: DataStructure,
        initialValues?: NodeValue[],
        edgeType: EdgeType = EdgeType.None
    ) {
        this._setNodeType(nodeType);
        this._setEdgeType(edgeType);   
        this._setDataStructure(dataStructure);
        initialValues = initialValues || [];
        this.nodes = initialValues.map(this._newNode) || [];
    }

    _newNode = (value: NodeValue): Node => {
        return {
            id: this.lastIndex++,
            value: value,
            mode: NodeSelectionMode.None,
            height: null,
            left: null,
            HEXColor: this.DEFAULT_HEX_COLOR
        }
    }

    _setAnimator(animator: AnimatorComponent) {
        this.animator = animator;
    }

    _setNodeType(nodeType: NodeType) {
        this.nodeType = nodeType;
    }

    getNodesType(): NodeType {
        return this.nodeType;
    }

    getNodes(): Node[] {
        return this.nodes;
    }

    setNodeModeSelected(index: number) {
        const node = this.nodes[index];
        node.mode = NodeSelectionMode.Selected;
        node.HEXColor = this.SELECTED_HEX_COLOR;
    }

    setNodeModeCompared(index: number) {
        const node = this.nodes[index];
        node.mode = NodeSelectionMode.Compared
        node.HEXColor = this.COMPARED_HEX_COLOR;
    }

    setNodeModeNone(index: number) {
        const node = this.nodes[index];
        node.mode = NodeSelectionMode.None;
        node.HEXColor = this.DEFAULT_HEX_COLOR;
    }

    setNodeModeCustom(index: number, HEXColor: string) {
        // the HEXColor should be of the form  #ffffff
        // contracted form   #fff  is also accepted.
        // Notice that the hash is added if not included.
        if (!HEXColor.startsWith("#")) {
            HEXColor = "#" + HEXColor; 
        }
        if (!this.HEX_REGEX.test(HEXColor)) {
            throw new Error("HEX color not valid");
        }
        const node = this.nodes[index];
        node.mode = NodeSelectionMode.Custom;
        node.HEXColor = HEXColor;
    }

    _setEdgeType(edgeType: EdgeType) {
        this.edgeType = edgeType;
    }

    getEdgeType(): EdgeType {
        return this.edgeType;
    }

    getEdges(): Edge[] {
        return this.edges;
    }

    _setDataStructure(dataStructure: DataStructure) {
        this.dataStructure = dataStructure;
    }

    getDataStructure(): DataStructure {
        return this.dataStructure;
    }

    getValues(): NodeValue[] {
        return this.nodes.map(node => node.value);
    }

    _deleteNodeAtIndex(index: number): NodeValue {
        const nodeToRemove = this.nodes.splice(index, 1)[0];
        const nodeValue = nodeToRemove.value;
        this.nodes.forEach((node, nodeIndex) => {
            if (nodeIndex < index) {
                this.animator.shiftNodeToRight(node);
            } else {
                this.animator.shiftNodeToLeft(node);
            }
        });
        return nodeValue;
    }

    _addNodeAtIndex(index: number, value: NodeValue) {
        const newNode = this._newNode(value);
        this.nodes.forEach((node, nodeIndex) => {
            if (nodeIndex < index) {
                this.animator.shiftNodeToLeft(node);
            } else {
                this.animator.shiftNodeToRight(node);
            }
        });
        this.nodes.splice(index, 0, newNode);
    }

    swap(index1: number, index2: number) {
        [this.nodes[index1], this.nodes[index2]] = [this.nodes[index2], this.nodes[index1]];
        this.refreshGraph();
        [this.nodes[index1].left, this.nodes[index2].left] = [this.nodes[index2].left, this.nodes[index1].left];
        this.refreshGraph(true);
    }

    refreshGraph(nodeWasAdded: boolean = false) {
        this.animator.refreshGraph(nodeWasAdded);
    }

    push(value: NodeValue) {
        this._addNodeAtIndex(this.nodes.length, value);
        this.refreshGraph(true);
    }

    pop(): NodeValue {
        const removedNodeValue = this._deleteNodeAtIndex(this.nodes.length - 1);
        this.refreshGraph();
        return removedNodeValue;
    }

    unshift(value: NodeValue) {
        this._addNodeAtIndex(0, value);
        this.refreshGraph(true);
    }

    shift(): NodeValue {
        const removedNodeValue = this._deleteNodeAtIndex(0);
        this.refreshGraph();
        return removedNodeValue;
    }

    insertAt(index: number, value: NodeValue) {
        this._addNodeAtIndex(index, value);
        this.refreshGraph(true);
    }

    removeAt(index: number): NodeValue {
        const removedNodeValue = this._deleteNodeAtIndex(index);
        this.refreshGraph();
        return removedNodeValue;
    }

    replaceAt(index: number, value: NodeValue): NodeValue {
        const node = this.nodes[index];
        const oldValue = node.value;
        node.value = value;
        this.refreshGraph(true);
        return oldValue;
    }

    getErrorMessage(obj: any, enumName: string, enumList: any): string {
        return `Expected object of type ${enumName}, but received ${obj}<br><br>` + 
               `Allowed types are: ${Object.keys(enumList).join(", ")}`;
    }

    _printError(error: Error) {
        // the difference between the user code, and the code
        // used by the browser to generate a dynamic function
        // e.g. function anonymous() { ...
        const BOILER_CODE_LENGTH = 2;
        const message = error.message;
        // the second row of the error.stack object is the 
        // row specifying the specific error
        const error_row = error.stack.split("\n").find(line => line.trim().startsWith("at eval"));
        const error_row_elements = error_row.split(":");
        const col_error = error_row_elements.pop().slice(0, -1);
        const line_error = Number(error_row_elements.pop()) - BOILER_CODE_LENGTH;
        const messageHTML = `
            line: ${line_error}
            <br>
            column: ${col_error}
            <hr>
            message: ${message} 
            <hr>
            stack message: ${error.stack.split("\n").map(x => "<br> &nbsp; " + x)}
        `;
        printRuntimeError(messageHTML);
    }

}

class Sorter extends Grapher {
    constructor(initialValues?: NodeValue[]) {
        super(
            NodeType.Bar,
            DataStructure.BarPlot,
            initialValues,
            EdgeType.None
        );
    }
}

class BinaryTree extends Grapher {
    constructor(initialValues?: NodeValue[]) {
        super(
            NodeType.Circle,
            DataStructure.Tree,
            initialValues,
            EdgeType.SinglePlainEdge
        );
    }
}

class List extends Grapher {
    constructor(initialValues?: NodeValue[]) {
        super(
            NodeType.Square,
            DataStructure.List,
            initialValues,
            EdgeType.None
        );
    }
}

export {
    Grapher,
    Sorter,
    BinaryTree,
    List,
    Node,
    NodeType,
    NodeSelectionMode,
    EdgeType,
    DataStructure,
    getNodeFromDataStructure
}