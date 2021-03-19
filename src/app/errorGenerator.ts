let currentPopUp: HTMLDivElement;

function printError(title: string, messageHTML: string) {
    const errorWindow = window.open("", title, "width=1000, height=400");
    errorWindow.document.body.innerHTML = `<h2>${title}</h2> <br> ${messageHTML}`;
}

function printSyntaxError(messageHTML: string) {
    printError("Syntax Error", messageHTML);
}

function printRuntimeError(messageHTML: string) {
    printError("Runtime Error in input code", messageHTML);
}

function interactionError(interactionErrorReason: string) {
    const popUp = createPopUp("This action cannot be performed", interactionErrorReason); 
    document.body.appendChild(popUp);
    setTimeout(deleteCurrentPopUp, 5000);
}

function createPopUp(title: string, message: string): HTMLDivElement {
    if (currentPopUp) {
        deleteCurrentPopUp();
    }
    currentPopUp = document.createElement("div");
    currentPopUp.id = new Date().toString();
    currentPopUp.classList.add("popup");
    const closeButton = document.createElement("button");
    closeButton.onclick = deleteCurrentPopUp;
    closeButton.innerHTML = "x";
    currentPopUp.innerHTML = `
        <h3>${title}</h3>
        <div>${message}</div>
    `
    currentPopUp.appendChild(closeButton);
    return currentPopUp;
}

function deleteCurrentPopUp() {
    if(!currentPopUp) return;
    currentPopUp.parentNode.removeChild(currentPopUp);
    currentPopUp = null;
}

export {
    printError,
    printSyntaxError,
    printRuntimeError,
    interactionError
}