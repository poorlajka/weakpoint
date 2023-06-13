
type SlideComponent = {
    element: string; 
    styles: string; 
    data: string;
}

let presentation: SlideComponent[][] = [];
let currentSlide = 0;
let finalSlide = 0;

const readSlidesData = (filePath: string): string => {
    // @ts-expect-error
    const read = window.api.readFileSync(filePath);
    return read;
}

const parseSlidesData = (slidesData: string): void => {
    let lines = slidesData
        .split("\n")
        .filter((line) => line !== "");

    let slide: SlideComponent[] = [];
    lines.splice(0, 1);

    for (const [i, line] of lines.entries()) {
        switch(line.split(" ")[0]) {
            case "#slide":
                presentation.push(slide)
                slide = [];
                break;
            case "#header":
                const header: SlideComponent = {
                    element: "h1",
                    styles: "",
                    data: line.split("#header ")[1],
                }
                slide.push(header);
                break;
            case "#image":
                const image: SlideComponent = {
                    element: "img",
                    styles: "",
                    data: line.split("#image ")[1],
                }
                slide.push(image);
                break;
            case "#code":
                const code: SlideComponent = {
                    element: "code",
                    styles: "",
                    data: "",
                }
                let j = i+1;
                while (true) {
                    if (j>lines.length-1) {
                        break;
                    }
                    if (lines[j][0] === "#") {
                        break;
                    }
                    // @ts-expect-error
                    code.data += window.api.highlightAuto(lines[j]) + "<br>";
                    j++;
                }
                slide.push(code);
                break;
        }
    }
    presentation.push(slide)
    finalSlide = presentation.length - 1;
} 

const renderCurrentSlide = (): void => {
    const slide = document.getElementById("slide");
    while (slide?.lastElementChild) {
        slide?.removeChild(slide?.lastElementChild);
    }

    for (const slideComponent of presentation[currentSlide]) {
        switch(slideComponent.element) {
            case "h1":
                const htmlElement = document.createElement(slideComponent.element);
                const textNode = document.createTextNode(slideComponent.data);
                htmlElement.appendChild(textNode);
                slide?.appendChild(htmlElement);
                break;
            case "img":
                const image = document.createElement(slideComponent.element);
                image.src = slideComponent.data;
                slide?.appendChild(image);
                break;
            case "code":
                var wrapper= document.createElement('div');
                wrapper.innerHTML= slideComponent.data;
                var div = wrapper.firstChild;
                slide?.appendChild(wrapper);
                
                break;
        }
    }
}

const setupEventListeners = (): void => {
    const slide = document.getElementById("slide");
    slide?.addEventListener("click", () => {
        if (currentSlide < finalSlide) {
            currentSlide++;
        }
        renderCurrentSlide();
    });

    window.addEventListener('keypress', (event: KeyboardEvent): void => {
        const key = event.key;
        switch (key) {
            case "d":
                if (currentSlide < finalSlide) {
                    currentSlide++;
                }
                break;
            case "a": 
                if (currentSlide > 0) {
                    currentSlide--;
                }
                break;
        }
        renderCurrentSlide();
    }, true);
}

const data = readSlidesData("./slides-script");
parseSlidesData(data);
renderCurrentSlide();
setupEventListeners();

