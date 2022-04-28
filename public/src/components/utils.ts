const pixelFields = ["margin", "marginLeft", "marginRight", "marginTop","marginBottom", 
    "padding", "paddingLeft", "paddingRight", "paddingTop","paddingBottom",
    "left", "top", "right", "bottom","width","height", "minWidth", "minHeight", 
    "maxWidth", "maxHeight", "borderWidth"]
export function applyStyle(div: HTMLElement, style: any) {
    Object.keys(style || {}).forEach(k => {
        let is_number = pixelFields.indexOf(k) >= 0
        if (is_number && typeof style[k] == "number") div.style[k] = style[k]+"px"
        else div.style[k] = style[k]
   
    })
}


interface  ICreateElement {
    (type: "button", styleOrClass?: string | object, style?: object): HTMLButtonElement;
    (type: "div", styleOrClass?: string | object, style?: object): HTMLDivElement;
    (type: string, styleOrClass?: string | object, style?: object): HTMLElement;
}
export const createElement: ICreateElement = (type: string, styleOrClass?: string | object, style?: object) => {
    var __style = typeof styleOrClass == "object"? styleOrClass : style || {}
    var __className = typeof styleOrClass == "string"? styleOrClass : ""
    var div = document.createElement(type)
    div.className = __className
    applyStyle(div, __style)
    return div as any
} 

export function createDiv(styleOrClass?: string | object, style?: object) {
    var __style = typeof styleOrClass == "object"? styleOrClass : style || {}
    var __className = typeof styleOrClass == "string"? styleOrClass : ""
    var div = document.createElement("div")
    div.className = __className
    applyStyle(div, __style)
    return div
}
