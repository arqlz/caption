
function drawHorizontal(canvas: HTMLCanvasElement, normalizedData: number[]) {
    const dpr = window.devicePixelRatio || 1;    
    const padding = 10;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = (canvas.offsetHeight + padding * 2 ) * dpr;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0,0,canvas.width, canvas.height)
    ctx.scale(dpr, dpr);
    ctx.translate( 0, canvas.offsetHeight / 2 + padding); 


    const width = canvas.offsetWidth / normalizedData.length;
    ctx.fillStyle = "#e7534b";
    for (let i = 0; i < normalizedData.length; i++) {
        let x = width * i;
        let h = normalizedData[i] * canvas.offsetHeight - padding
        if (h<3) h = 1;
        if (i%2 == 0 && h > 1) h = -h;

        ctx.fillRect(x,0,width,h)

    }
}

export class Visualizer {
    containner: HTMLElement
    private canvas: HTMLCanvasElement
    constructor() {
        var div = createDiv({width: 500, margin: "0 auto"})  
        const visualization = createDiv("row")
        const canvas = document.createElement("canvas");
        canvas.classList.add("flex")
        canvas.style.width = "100%";
        canvas.style.height = "100px";
        visualization.append(canvas);
        div.append(visualization)  
        
        this.canvas = canvas;
        this.containner = div;
    }
    render(data) {
        drawHorizontal(this.canvas, data)  
    }
}
