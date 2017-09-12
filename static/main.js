settings = {
	control_size: 16,
}

function template(cn) {
	return t.elem("hiddenhtml").querySelector("#hiddenhtml > ." + cn).cloneNode(true)
}

function findelem(node, cn) {
	return node.getElementsByClassName(cn)[0];
}

var canvas = null;

function resize() {
	t.elem("area_list").style.height = (window.innerHeight - t.elem("new_elem_box").offsetHeight - 60) + "px";
}

function main() {
	canvas = new Canvas(t.elem("canvas"), [600, 600], "#FFFFFF");

	t.elem("new_add").onclick = function () {
		var sel = t.elem("new_type");
		var opt = sel.options[sel.selectedIndex].value;
		if (opt == "image") { 
			var imgsel = t.elem("new_image_type");
			var imgopt = imgsel.options[imgsel.selectedIndex].value;
			if (imgopt == "fixed") {
				canvas.addArea(new ImageFixed([150, 100, 450, 400])); 
			} else if (imgopt == "random") {
				canvas.addArea(new ImageRandom([150, 100, 450, 400])); 
			} else {
				console.error("Unknown image type");
			}
		} else if (opt == "text") {
			var textsel = t.elem("new_text_type");
			var textopt = textsel.options[textsel.selectedIndex].value;
			if (textopt == "fixed") {
				canvas.addArea(new TextFixed([100, 250, 500, 350]));
			} else if (textopt == "range") {
				canvas.addArea(new TextRange([100, 250, 500, 350]));
			} else {
				console.error("Unknown text type");
			}
		} else {
			console.error("Unknown area type");
		}
	};
	var sel = t.elem("new_type");
	var sel_update = function () {
		t.map(sel.options, function (i, o) {
			var el = t.elem("new_" + o.value);
			if (i == sel.selectedIndex) {
				el.style.display = "block";
			} else {
				el.style.display = "none";
			}
		});
	};
	sel.onchange = sel_update;
	sel_update();

	t.elem("export").onclick = function () {
		console.log(JSON.stringify(canvas.export()));
	};
	t.elem("generate").onclick = function () {
		var count = parseInt(t.elem("gen_number").value);
		if (!isNaN(count)) {
			t.ajax("/generate", JSON.stringify({
				count: count,
				config: canvas.export()
			}));
		}
	}

	resize();
}

window.addEventListener("resize", resize);
window.addEventListener("load", main);
