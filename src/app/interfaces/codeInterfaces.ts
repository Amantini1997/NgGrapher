import { DataStructure, NodeType } from "./grapherInterfaces";

export interface DisplayableCodeComment {
    code: string,
    comment: string
}

declare type ExecutableCode = string;

export interface AnimationConfig {
    executable: ExecutableCode,
    displayableCodeComments: DisplayableCodeComment[],
    initialValues: any[],
    nodeType: NodeType,
    dataStructure: DataStructure
}