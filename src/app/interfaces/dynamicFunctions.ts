interface DynamicFunction {
    name: string,
    body: GeneratorFunction,
    params?: [
        {
            name: string,
            type: InputType
        }
    ],
    lines?: LinesSelection
};

interface LinesSelection {
    start: number,
    end: number
}

const REGEXES = {
    NUMERICAL_SERIES: /^[\-]{0,1}\d+(\.\d+){0,1}(\s*\,\s*[\-]{0,1}\d+(\.\d+){0,1})*\s*$/,
    NUMERICAL: /^[\-]{0,1}\d*(\.\d+)*$/,
    ANY: /\./
}

enum InputType {
    Number = "number",
    NumberList = "numberList",
    String = "string",
    StringList = "stringList"
}

export {
    DynamicFunction,
    LinesSelection,
    InputType,
    REGEXES
}