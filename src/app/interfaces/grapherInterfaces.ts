enum NodeType {
    Square = "Square",
    Bar = "Bar"
}

enum DataStructure {
    List = "List",
    BarPlot = "BarPlot"
}

enum NodeSelectionMode {
    None = "None",
    Selected = "Selected",
    Compared = "Compared",
    Custom = "Custom"
}

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
    NodeSelectionMode,
    DataStructure
}