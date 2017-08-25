
MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

var observer = new MutationObserver(function(mutations, observer) {
    // fired when a mutation occurs
    for(var i = 0; i < mutations.length; i++)
    {
        var elem = mutations[i].target;

        walk(elem);
    }
});

// define what element should be observed by the observer
// and what types of mutations trigger the callback
observer.observe(document.body, {
  subtree: true,
  childList: true
});

walk(document.body);

function walk(node) 
{
    var child, next;
    
    if(node.tagName)
    {
        var tagName = node.tagName.toLowerCase();

        if (tagName == 'input' || tagName == 'textarea' || tagName == 'style') {
            return;
        }
    }
	
	switch ( node.nodeType )  
	{
		case 1:  // Element
		case 9:  // Document
        case 11: // Document fragment
            if(node.getAttribute("original-color"))
                return;
        
            var ancestor = node.parentElement;
        
            while(ancestor != null)
            {
                if(ancestor.getAttribute("original-color"))
                    return;
        
                ancestor = ancestor.parentElement
            }

			child = node.firstChild;
			while ( child ) 
			{
				next = child.nextSibling;
				walk(child);
				child = next;
			}
			break;

		case 3: // Text node
			handleText(node);
			break;
	}
}

function handleText(textNode) 
{
    var regex = /(#[0-9a-fA-F]{6})/g;

    textNode.data.replace(regex, function(all) {
        var args = [].slice.call(arguments);
        var offset = args[args.length - 2];

        if(offset > textNode.data.length)
            return;

        var newTextNode = textNode.splitText(offset);

        newTextNode.data = newTextNode.data.substr(all.length);
        insertNode.apply(window, [textNode].concat(args));
        textNode = newTextNode;
    });
}

function insertNode(node, match, offset) {
    var foreground = "#ffffff";

    var lum = rgbToLuminance(hexToRgb(match));

    if(lum >= 50)
        foreground = "#000000";
    
    var span = document.createElement("span");
    span.style = 'background-color: ' + match + '; color: ' + foreground;
    span.textContent = match;
    span.title = "Triple-click to change formats";
    span.setAttribute("original-color", match);
    span.setAttribute("original-color-type", "hex");
    span.setAttribute("color-type", "hex");
    span.addEventListener("click", function(e){
        if (e.detail !== 3) {
            return;
        }

        var elem = e.target;
        if(elem.getAttribute("color-type") == "hex") {
            elem.textContent = "rgb(" + hexToRgb(elem.getAttribute("original-color")).join(", ") + ")";
            elem.setAttribute("color-type", "rgb");
        } else {
            elem.textContent = elem.getAttribute("original-color");
            elem.setAttribute("color-type", "hex");
        }
    });

    node.parentNode.insertBefore(span, node.nextSibling); 
}

function rgbToLuminance(rgb) {
    var b, d, g, max, min, r, l;
    r = rgb[0] / 255;
    g = rgb[1] / 255;
    b = rgb[2] / 255;
    max = Math.max(r, g, b);
    min = Math.min(r, g, b);
    l = (max + min) / 2;

    l = Math.round(l * 100);
    

    return l;
}

function hexToRgb(hex) {
    var rgb;

    hex = hex.replace('#', '');
    if (hex.length === 3) {
      hex += hex;
    }
    rgb = hex.match(/.{1,2}/g).map(function(val) {
      return parseInt(val, 16);
    });
    return rgb;
}