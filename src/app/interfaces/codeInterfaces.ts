import { DataStructure, NodeType } from "./grapherInterfaces";

export interface DisplayableCodeComment {
    code: string,
    comment: string
}

export interface AnimationConfig {
    executable: string,
    displayableCodeComments: DisplayableCodeComment[],
    initialValues: any[],
    nodeType: NodeType,
    dataStructure: DataStructure
}