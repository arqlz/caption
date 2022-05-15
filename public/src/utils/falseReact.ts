const pixelFields = ["margin", "marginLeft", "marginRight", "marginTop","marginBottom", 
    "padding", "paddingLeft", "paddingRight", "paddingTop","paddingBottom",
    "left", "top", "right", "bottom","width","height"]
function applyStyle(div: HTMLElement, style: any) {
    Object.keys(style || {}).forEach(k => {
        let is_number = pixelFields.indexOf(k) >= 0
        if (is_number && typeof style[k] == "number") div.style[k] = style[k]+"px"
        else div.style[k] = style[k]
   
    })
}

const renameDic = {onClick: "onclick", onInput: "oninput", onChange: "onchange"}
function apply(div: HTMLElement, style: any) {
    Object.keys(style || {}).forEach(k => {
        div[ renameDic[k] || k] = style[k]

    })
}

export class FalseReact {
    static createElement(functionOrString, props, ...childrens) {       
        if (typeof functionOrString == "string") {
          
            var element = document.createElement(functionOrString)
            var props = props || {}
            apply(element, props)
            if (props && props.style) applyStyle(element, props.style) 
        
            for (var child of childrens) {            
                if (Array.isArray(child)) {                    
                    for (var ch of child) {
                        element.append(ch)
                    }
                } else {
                    element.append(child)
                }
            }
            if (props && props.ref) props.ref(element)
            return element
        } else {
            let ops = Object.assign({}, props)
            if (childrens && ops) ops.children = childrens
            return functionOrString(ops, childrens)
        }
    }
    static render(functionOrString, target: HTMLElement) {
        target.appendChild(functionOrString)
    }
}

