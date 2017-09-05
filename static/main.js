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

window.addEventListener("load", function () {
	canvas = new Canvas(t.elem("canvas"), [600, 600], "#7F7F7F");

	t.elem("new_add").onclick = function () {
		var sel = t.elem("new_type");
		var opt = sel.options[sel.selectedIndex].value;
		if (opt == "image") { 
			canvas.addArea(new Image("Image", [150, 100, 450, 400])); 
		} else if (opt == "text") {
			canvas.addArea(new Text("Text", [100, 250, 500, 350]));
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
});