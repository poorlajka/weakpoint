import { readFileSync } from 'fs';

type Presentation = {
    slides: Slide[];
}

type Slide = {
    slideComponents: SlideComponent[];
}

interface SlideComponent {
    render(): void; 
}

class Header implements SlideComponent {
    render = (): void => {

    }
}

let data: string;

const readSlidesData = (filePath: string): string => {
    try {
        data = readFileSync('/Users/joe/test.txt', 'utf8');
    } catch (err) {
        console.error(err);
    }
    return "hi";
}

const parseSlidesData = (slidesData: string): Presentation => {
    let lines = slidesData.split("\n");


    let s: Slide = {slideComponents}
    let p: Presentation = {slides: ["dd", "fdfd"]};
} 

const renderCurrentSlide = (): void => {
    for (slideComponents of presentation.slides[slideNr]) {
        slideComponent.render();
    }
}

const main = (): void => {
    const slidesData = readSlidesData("placeholder");
    let presentation = parseSlidesData(slidesData);
    let slideNr = 0;
    let running = true;
    element.addEventListener

}

main();

const para = document.createElement("p");
const node = document.createTextNode("This is new.");
para.appendChild(node);

const element = document.getElementById("slide");
element?.appendChild(para)
