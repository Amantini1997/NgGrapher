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

enum NodeSelectionMode {
    None = "None",
    Selected = "Selected",
    Compared = "Compared",
    Custom = "Custom"
}

declare type Edge = [any, any];

declare type NodeValue = number | string;

interface Node {
    id: number,
    value: NodeValue,
    mode: NodeSelectionMode,    // the mode of the node which affects its colors
    height: number,             // the height of the node
    left: number,               // the left-distance from the container
    HEXColor: string            // the user selected Hexadecimal-like color for Custom mode
}

export {
    NodeType,
    Node,
    NodeValue,
    EdgeType,
    NodeSelectionMode,
    Edge,
    DataStructure
}