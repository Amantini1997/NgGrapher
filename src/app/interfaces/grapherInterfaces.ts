enum NodeType {
    Square = "Square",
    Bar = "Bar"
}

enum DataStructure {
    List = "List",
    BarPlot = "BarPlot"
}

declare type NodeValue = number | string;

interface AnimationNode {
    id: number,
    value: NodeValue,
    height: number,             // the height of the node
    left: number,               // the distance from the left margin of the container
    HEXColor: string            // the color expressed as hexadecimal value
}

export {
    NodeType,
    AnimationNode,
    NodeValue,
    DataStructure
}