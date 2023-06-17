

type Presentation = {
    slides: HTMLElement[][];
    currentSlide: number;
}

const nextSlide = (): void => {
    if (presentation.currentSlide < presentation.slides.length-1) {
        presentation.currentSlide++
    }
}

const prevSlide = (): void => {
    if (presentation.currentSlide > 0) {
        presentation.currentSlide--
    }
}

const readSlidesData = (filePath: string): string => {
    // @ts-expect-error
    return window.api.readFileSync(filePath);
}

const setupEventListeners = (): void => {
    const slide = document.getElementById("slide");
    /*
    slide?.addEventListener("click", () => {
        nextSlide();
        renderCurrentSlide();
    });
    */

    document.onkeydown = (e) => {
        const key = e.key;
        switch (key) {
            case "ArrowRight": case "d":
                nextSlide();
                renderCurrentSlide();
                break;
            case "ArrowLeft": case "a":
                prevSlide();
                renderCurrentSlide();
                break;
            case "f":
                // @ts-expect-error
                window.api.toggleFullScreen();
                break;
            case "r":
                if (updating) {
                    window.clearInterval(intervalID);
                    if (slide != undefined) {
                        slide.style.borderStyle = "none";
                        updating = false;
                    }
                }
                else {
                    if (slide != undefined) {
                        slide.style.borderStyle = "solid";
                        slide.style.borderWidth = "0.5px";
                        slide.style.borderColor = "#ff1212";
                    }

                    intervalID = window.setInterval(loadPresentation, 100);
                    updating = true;
                }
                break;
        }
    };
}

const renderCurrentSlide = () => {
    const slide = document.getElementById("slide");

    while (slide?.lastElementChild) {
        slide?.removeChild(slide?.lastElementChild);
    }

    for (const element of presentation.slides[presentation.currentSlide]) {
        slide?.appendChild(element);
    }
}

const createHeaderElement = (componentInput: string[]): HTMLElement => {
    const header = document.createElement("h1");
    header.innerText = componentInput[0];
    return header;
}

const createParagraphElement = (componentInput: string[]): HTMLElement => {
    const text = componentInput.join("\n");
    const paragraph = document.createElement("p");
    paragraph.innerText = text;
    return paragraph;
}

const createListElement = (componentInput: string[]): HTMLElement => {
    const list = document.createElement("ul");
    for (const liText of componentInput) {
        const listItem = document.createElement("li");
        listItem.innerText = liText;
        list.appendChild(listItem);
    }
    return list;
}

const createOrderedListElement = (componentInput: string[]): HTMLElement => {
    const list = document.createElement("ol");
    for (const liText of componentInput) {
        const listItem = document.createElement("li");
        listItem.innerText = liText;
        list.appendChild(listItem);
    }
    return list;
}

const createImageElement = (componentInput: string[]): HTMLElement => {
    const image = document.createElement("img");
    image.src = componentInput[0];
    return image;
}

const createVideoElement = (componentInput: string[]): HTMLElement => {
    const video = document.createElement("video");

    //TODO REMOVE THIS SET SANE DEFAULT IN CSS GOES FOR ALL COMPONENTS :)
    video.height = 230;
    video.width = 400;

    video.src = componentInput[0];
    video.controls = true;
    video.style.outline = "none";
    video.volume = 0.15;
    return video;
}

const createCodeElement = (componentInput: string[]): HTMLElement => {
    const div = document.createElement('div');
    div.style.whiteSpace = "pre";
    for (const line of componentInput) {
        // @ts-expect-error
        div.innerHTML += window.api.highlightAuto(line) + "<br>";

    }
    return div
}

const createPaddingElement = (componentInput: string[]): HTMLElement => {
    const div = document.createElement('div');
    div.style.height = componentInput[0];
    div.style.width = "50px";
    return div;
}

const createComponentElement = (componentType: string,
                                componentInput: string[]): HTMLElement => {
    switch (componentType) {
        case "#header":
            return createHeaderElement(componentInput);
        case "#paragraph":
            return createParagraphElement(componentInput);
        case "#list":
            return createListElement(componentInput);
        case "#orderedList":
            return createOrderedListElement(componentInput);
        case "#image":
            return createImageElement(componentInput);
        case "#video":
            return createVideoElement(componentInput);
        case "#code":
            return createCodeElement(componentInput);
        case "#padding":
            return createPaddingElement(componentInput);
        default:
            return document.createElement("div");
    }
}

const isComponent = (line: string): boolean => {
    return line.startsWith("#")
}

const parseComponent = (lines:string[]): [string, string, string[]] => {
    const componentType = lines[0].split(" ")[0];
    const componentName = lines[0].split(" = ")[1];

    const nextTagIndex= lines
        .slice(1)
        .findIndex(line => isComponent(line));

    const inputEnd = (nextTagIndex !== -1) ? nextTagIndex+1 : lines.length;
    const componentInput = lines.slice(1, inputEnd);

    return [componentType, componentName, componentInput];
}

const splitAndTrim = (script: string): string[] => {
    let lines = script
        .split(/\r?\n/)
        .filter(line => line.trim() !== "");

    return lines
        .map((line) => {
            return line.includes("#") ? line.trimStart() : line;
        });
}

const parseStyles = (lines: string[]): Map<string, string> => {
    const styles = new Map<string, string>;

    let name: string = "";
    for(const line of lines) {
        if (isComponent(line)) {
            name = line.split("#")[1];
            continue
        }
        if (name === "") {
            continue;
        }
        if (styles.has(name)) {
            styles.set(name, styles.get(name) + line.trim() + ";");
        }
        else {
            styles.set(name, line.trim() + ";");
        }
    }

    return styles;
}

const parseScript = (script: string): HTMLElement[][] => {
    let lines = splitAndTrim(script);
    let slidesStartIndex = lines.findIndex(line => line.includes("#slide"));

    let styles: Map<string, string> = new Map<string, string>;
    styles = parseStyles(lines.slice(1, slidesStartIndex));
    const presentationLines = lines.slice(slidesStartIndex+1);

    const elements: HTMLElement[][] = [];
    let slideElements: HTMLElement[] = [];

    for (let i = 0; i < presentationLines.length; ++i) {
        if (!isComponent(presentationLines[i])) {
            continue;
        }

        const [componentType, componentName, componentInput]
            = parseComponent(presentationLines.slice(i));

        if (componentType === "#slide") {
            elements.push(slideElements);
            slideElements = [];
            continue;
        }

        const element = createComponentElement(componentType, componentInput);
        console.log(styles.get(componentName))
        element.style.cssText += styles.get(componentName) ?? "";
        slideElements.push(element);
        i += componentInput.length;
    }
    elements.push(slideElements);

    return elements;
}

let presentation: Presentation = {slides: [], currentSlide: 0};
let updating: boolean = false;
let intervalID: number;

const loadPresentation = (): void => {
    const script = readSlidesData("./slides-script.txt");
    presentation.slides = parseScript(script);
    renderCurrentSlide();
}

const main = (): void => {
    loadPresentation();
    setupEventListeners();
}

main();
