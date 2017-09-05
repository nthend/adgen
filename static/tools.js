t = {}

t.elem = function (id) {
	return document.getElementById(id);
}

t.ajax = function ajax(path, data, ok, err) {
	let req = new XMLHttpRequest();
	if (!req) {
		err(null);
		return null;
	}
	req.onreadystatechange = function() {
		if (this.readyState == XMLHttpRequest.DONE) {
			if (this.status == 200) {
				ok && ok(this.responseText);
			} else {
				err && err(this.status);
			}
		}
	};
	if (data) {
		req.open("POST", path, true);
		req.setRequestHeader("Content-type", "text/plain");
		req.send(data); 
	} else {
		req.open("GET", path, true);
		req.send();
	}
	return req;
}

t.mousepos = function (e, t) {
	var pos = [0, 0];
	pos[0] = e.pageX - t.offsetLeft;
	pos[1] = e.pageY - t.offsetTop;
	return pos;
}

t.min = function (a, b) {
	return a < b ? a : b;
}

t.max = function (a, b) {
	return a > b ? a : b;
}

t.clamp = function (v, a, b) {
	return v < a ? a : b < v ? b : v;
}

t.map = function (arr, func) {
	var out = [];
	for (var i = 0; i < arr.length; ++i) {
		out.push(func(i, arr[i]));
	}
	return out;
}

t.rgb = function (hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null;
}