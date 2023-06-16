//TODO THIS NEEDS MASSIVE REWRITE LMAO

type SlideComponent = {
    element: string; 
    styles: string | undefined; 
    data: string;
}



let presentation: SlideComponent[][] = [];
let currentSlide = 0;
let finalSlide = 0;
let styles = new Map<string, string>();


const readSlidesData = (filePath: string): string => {
    // @ts-expect-error
    const read = window.api.readFileSync(filePath);
    return read;
}

const parseSlidesData = (slidesData: string): void => {
    let lines = slidesData
        .split("\n")
        .filter((line) => line !== "");

    //THIS FUCKING SUCKS
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].indexOf("#") !== -1) {
            lines[i] = lines[i].trimStart();
        }
    }

    //LOOKING AT THIS MAKES ME CRY HOLY FUCK REWRITE EVERYTHING
    let num = 0;
    if (lines[0].split(" ")[0] === "#styling") {
        lines.splice(0, 1);
        for (const [i, line] of lines.entries()) {
            let tag = line.split(" ")[0];
            if (tag === "#slide") {
                num = i;
                break;
            }
            let className: string;
            if (tag.startsWith("#")) {
                className = tag.split("#")[1];
                let classStyles = "";
                let j = i+1;
                while (true) {
                    if (lines[j][0] === "#") {
                        break;
                    }
                    classStyles += lines[j] + "; "
                    j++;
                }
                styles.set(className, classStyles);
            }
        }

    }

    lines = lines.slice(num)

    let slide: SlideComponent[] = [];
    lines.splice(0, 1);

    for (const [i, line] of lines.entries()) {
        switch(line.split(" ")[0]) {
            case "#slide":
                presentation.push(slide)
                slide = [];
                break;
            case "#header":
                let name = line.split(" name = ")[1];
                const header: SlideComponent = {
                    element: "h1",
                    styles: styles.get(name),
                    data: lines[i+1],
                }
                slide.push(header);
                break;
            case "#image":
                const image: SlideComponent = {
                    element: "img",
                    styles: "",
                    data: lines[i+1],
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
            case "#paragraph":
                const paragraph: SlideComponent = {
                    element: "p",
                    styles: "",
                    data: "",
                }
                let k = i+1;
                while (true) {
                    if (k>lines.length-1) {
                        break;
                    }
                    if (lines[k][0] === "#") {
                        break;
                    }
                    paragraph.data += lines[k] + "<br/>";
                    k++;
                }
                slide.push(paragraph);
                break;
            case "#list":
                const list: SlideComponent = {
                    element: "ul",
                    styles: "",
                    data: "",
                }
                let l = i+1;
                while (true) {
                    if (l>lines.length-1) {
                        break;
                    }
                    let tag = lines[l].split(" ")[0];
                    if (tag !== "#li") {
                        break;
                    }
                    if (lines[l][0] !== "#") {
                        break;
                    }
                    console.log(line)
                    list.data += "<li>" + lines[l].split("#li ")[1] + "</li>";
                    l++;
                }
                /*
                */
                slide.push(list);
                break;
            case "#space":
                const space: SlideComponent = {
                    element: "space",
                    styles: "",
                    data: "",
                }
                slide.push(space);
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
                htmlElement.style.cssText = slideComponent.styles ?? "";
                slide?.appendChild(htmlElement);
                break;
            case "p":
                const paragraph = document.createElement(slideComponent.element);
                paragraph.innerHTML = slideComponent.data;
                paragraph.style.fontSize = "16pt"
                slide?.appendChild(paragraph);
                break;
            case "ul":
                const list = document.createElement(slideComponent.element);
                list.innerHTML = slideComponent.data;
                list.style.fontSize = "20pt"
                slide?.appendChild(list);
                break;
            case "img":
                const image = document.createElement(slideComponent.element);
                const div = document.createElement("div");
                image.src = slideComponent.data;
                div.style.flexBasis = "100%";
                div.style.display = "flex";
                div.style.flexDirection = "column";
                div.style.alignItems = "center";
                div.style.justifyContent = "center";
                div.appendChild(image);
                slide?.appendChild(div);
                break;
            case "code":
                var wrapper = document.createElement('div');
                wrapper.style.whiteSpace = "pre";
                wrapper.innerHTML= slideComponent.data;
                slide?.appendChild(wrapper);

                break;
            case "space":
                var space = document.createElement('div');
                space.style.height = "50px";
                space.style.width= "200px";
                slide?.appendChild(space);

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

const data = readSlidesData("./slides-script.txt");
parseSlidesData(data);
renderCurrentSlide();
setupEventListeners();

