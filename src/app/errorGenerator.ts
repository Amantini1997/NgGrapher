function printError(title, messageHTML) {
    const errorWindow = window.open("", title, "width=1000, height=400");
    errorWindow.document.body.innerHTML = `<h2>${title}</h2> <br> ${messageHTML}`;
}

function printSyntaxError(messageHTML) {
    printError("Syntax Error", messageHTML);
}

function printRuntimeError(messageHTML) {
    printError("Runtime Error in input code", messageHTML);
}

export {
    printError,
    printSyntaxError,
    printRuntimeError
}