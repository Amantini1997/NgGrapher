import { DataStructure, NodeType } from "./grapher";

export interface CodeComment {
    code: string,
    comment: string
}

declare type ExecutableCode = string;

// executable plus display code
export interface CodeED {
    executable: ExecutableCode,
    displayable: CodeComment[],
    initialValues: any[],
    nodeType: NodeType,
    structure: DataStructure
}