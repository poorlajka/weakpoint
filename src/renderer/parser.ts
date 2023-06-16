type Presentation = {
    slides: HTMLElement[][];
    slidesCount: number;
    currentSlide: number;
}

let presentation: Presentation;

const main = (): void => {
    const script = readSlidesData("./slides-script.txt");
    const slides = parseScript(script);

    presentation = {
        slides: slides,
        slidesCount: slides.length(),
        currentSlide = 0,
    };

    setupEventListeners();

    renderSlide();
}

const createHeaderElement (componentInput: string[]): HTMLelement => {


}

const createElement = (componentType: string, 
    componentInput: string[], 
    componentName: string): HTMLElement | null => {

    switch (componentType) {
        case "#header":
            return createHeaderElement(componentInput, componentName);
        case "#paragraph":
            return createParagraphElement(componentInput, componentName);
        case "#list":
            return createListElement(componentInput, componentName);
        case "#image":
            return createImageElement(componentInput, componentName);
        case "#code":
            return createCodeElement(componentInput, componentName);
        default:
            return null;
    }
}

const splitAndTrim = (script: string): string[] => {
    let lines = script
        .split(/\r?\n/)
        .filter(line => line.trim() !== "");

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].indexOf("#") !== -1) {
            lines[i] = lines[i].trimStart();
        }
    }

    return lines;
}

const parseComponent = (lines:string[]): [string, string, string[]] => {
        const componentType = lines[0].split(" ")[0];
        const componentName = lines[0].split(" ")[2];
        const inputEnd = lines.slice(1).findIndex(line => line[0] === "#");
        const componentInput = lines.slice(1, inputEnd);
        return [componentType, componentName, componentInput];
}

const parseScript = (script: string): HTMLElement[][] => {
    const lines = splitAndTrim(script);
    const elements: HTMLElement[][] = [];

    let lineNr = 0;
    let slideNr = 0;
    while (true) {
        if (lineNr > lines.length) {
            break;
        }
        const [componentType, componentName, componentInput] 
            = parseComponent(lines.slice(lineNr));

        if (componentType === "#slide") {
            slideNr++;
            continue;
        }

        const element = createElement(componentType, componentInput, componentName) 
            ?? "syntax error!";
        if (element !== "syntax error!") {
            elements[slideNr].push(element);
        }
        lineNr = inputEnd + 1;
    }

    return elements;
}

const renderSlide = () => {
    const slide = document.getElementById("slide");

    while (slide?.lastElementChild) {
        slide?.removeChild(slide?.lastElementChild);
    }
    for (const element of presentation.slides[presentation.slidesCount]) {
        slide?.appendChild(element);
    }
}