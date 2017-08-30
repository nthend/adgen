t = {}

t.elem = function (id) {
	return document.getElementById(id);
}

t.ajax = function ajax(path, ok, err) {
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
	req.open("GET", path, true);
	req.send();
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