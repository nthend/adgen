function Canvas(elem) {
	var self = this;
	self.elem = elem;
	self.context = elem.getContext("2d");

	self.imgarea = {
		pos: [150, 150, 450, 450], // LTRB
		inputs: t.map(["imgleft", "imgtop", "imgright", "imgbottom"], function (i, id) { return t.elem(id); }),
		cs: 16
	};

	self.focus = {
		target: null,
		part: 0,
		info: null
	};

	self.mouse = {
		left: false,
		pos: [0, 0]
	};
	window.addEventListener("mousemove", function(e) {
		var m = t.mousepos(e, elem);
		self.mouse.pos[0] = m[0];
		self.mouse.pos[1] = m[1];
		if (self.mouse.left) {
			self.drag(m);
		} else {
			self.move(m);
		}
		self.draw();
	});
	window.addEventListener("mousedown", function(e) {
		var m = t.mousepos(e, elem);
		self.mouse.pos[0] = m[0];
		self.mouse.pos[1] = m[1];
		if (m[0] >= 0 && m[0] < self.elem.width && m[1] >= 0 && m[1] < self.elem.height) {
			self.mouse.left = true;
			self.pick(m);
			self.draw();
		}
	});
	
	self.move = function (m) {
		var ia = self.imgarea.pos;
		var cs = self.imgarea.cs;
		for (var i = 0; i < 4; ++i) {
			var c = [ia[2*(i&1)], ia[2*(i>>1)+1]];
			if (c[0] - cs <= m[0] && c[0] + cs >= m[0] && c[1] - cs <= m[1] && c[1] + cs >= m[1]) {
				self.focus.target = "imgarea";
				self.focus.part = i;
				return;
			}
		}
		if (ia[0] < m[0] && m[0] < ia[2] && ia[1] < m[1] && m[1] < ia[3]) {
			self.focus.target = "imgarea";
			self.focus.part = 5;
			self.focus.info = [m[0] - ia[0], m[1] - ia[1]];
			return;
		}
		self.focus.target = null;
	}
	self.pick = function (m) {
		console.log("pick");
		self.move(m);
	}
	self.drag = function (m) {
		console.log("drag");
		if (self.focus.target == "imgarea") {
			var i = self.focus.part;
			var ia = self.imgarea.pos;
			var p = [m[0], m[1]];
			if (i >= 5) {
				var d = self.focus.info;
				var s = [ia[2] - ia[0], ia[3] - ia[1]];
				if (p[0] - d[0] < 0) {
					p[0] = d[0];
				}
				if (p[0] + (s[0] - d[0]) > self.elem.width) {
					p[0] = self.elem.width - (s[0] - d[0]);
				}
				if (p[1] - d[1] < 0) {
					p[1] = d[1];
				}
				if (p[1] + (s[1] - d[1]) > self.elem.height) {
					p[1] = self.elem.height - (s[1] - d[1]);
				}
				ia[0] = p[0] - d[0];
				ia[1] = p[1] - d[1];
				ia[2] = p[0] + s[0] - d[0];
				ia[3] = p[1] + s[1] - d[1];
			} else {
				p[0] = t.clamp(m[0], 0, self.elem.width);
				p[1] = t.clamp(m[1], 0, self.elem.height);
				if ((1 - 2*(i&1))*(ia[2*(1-(i&1))] - p[0]) <= 0) {
					p[0] = ia[2*(1-(i&1))] - (1 - 2*(i&1));
				}
				if ((1 - 2*(i>>1))*(ia[2*(1-(i>>1))+1] - p[1]) <= 0) {
					p[1] = ia[2*(1-(i>>1))+1] - (1 - 2*(i>>1));
				}
				ia[2*(i&1)] = p[0];
				ia[2*(i>>1)+1] = p[1];
			}
		}
		self.syncimg();
	}
	self.drop = function (m) {
		console.log("drop");
		self.drag(m);
	}

	var drop_handler = function (e) {
		var m = t.mousepos(e, elem);
		self.mouse.pos[0] = m[0];
		self.mouse.pos[1] = m[1];
		if (self.mouse.left) {
			self.drop(m);
		}
		self.mouse.left = false;
		self.draw();
	}
	window.addEventListener("mouseup", drop_handler);

	self.draw = function () {
		var ctx = self.context;
		var m = self.mouse.pos;
		var w = self.elem.width, h = self.elem.height;
		ctx.clearRect(0, 0, w, h);
		
		ctx.fillStyle = "#AAAAAA";
		ctx.fillRect(0, 0, w, h);
		
		var ia = self.imgarea.pos;
		if (self.focus.target == "imgarea" && self.focus.part == 5) {
			ctx.fillStyle = "#EEEEEE";
		} else {
			ctx.fillStyle = "#DDDDDD";
		}
		ctx.fillRect(ia[0], ia[1], ia[2]-ia[0], ia[3]-ia[1]);

		var text = "Image";
		ctx.textBaseline = "middle";
		ctx.font = t.min((ia[2] - ia[0])/5, (ia[3] - ia[1])/2) + "px Arial";
		ctx.fillStyle = "#AAAAAA";
		var tx = (ia[0] + ia[2])/2 - ctx.measureText(text).width/2;
		var ty = (ia[1] + ia[3])/2;
		ctx.fillText(text, tx, ty);

		var cs = self.imgarea.cs;
		for (var i = 0; i < 4; ++i) {
			var c = [ia[2*(i&1)], ia[2*(i>>1)+1]];
			if (self.focus.target == "imgarea" && self.focus.part == i) {
				ctx.fillStyle = "rgba(255,255,255,0.8)";
			} else {
				ctx.fillStyle = "rgba(255,255,255,0.4)";
			}
			ctx.fillRect(c[0] - cs, c[1] - cs, 2*cs, 2*cs);
		}
	}

	self.draw();

	self.syncimg = function () {
		t.map(self.imgarea.inputs, function (i, e) {
			e.value = self.imgarea.pos[i];
			e.classList.remove("invalid");
		});
	}
	self.synctext = function () {
		t.map(self.imgarea.inputs, function (i, e) {
			self.imgarea.pos[i] = parseInt(e.value);
		});
		self.draw();
	}
	t.map(self.imgarea.inputs, function (i, e) {
		e.addEventListener("change", function () {
			var v = parseInt(e.value);
			if (isNaN(v)) {
				e.classList.add("invalid");
			} else {
				var out = false;
				if (v < 0 || v > ((i % 2) ? self.elem.height : self.elem.width)) {
					out = true;
				}
				if (i == 0 || i == 1) {
					if (v >= self.imgarea.pos[2 + i]) {
						out = true;
					}
				} else {
					if (v <= self.imgarea.pos[i - 2]) {
						out = true;
					}
				}
				if (out) {
					e.classList.add("invalid");
				} else {
					e.classList.remove("invalid");
					self.synctext();
				}
			}
		});
	});

	self.syncimg();
}

var canvas = null;

window.addEventListener("load", function () {
	canvas = new Canvas(t.elem("canvas"));

});