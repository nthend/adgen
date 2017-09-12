function Area(caption, pos) {
	var self = this;
	self.type = "area";

	self.caption = caption;
	self.pos = pos;

	self.box = template("_area");
	findelem(self.box, "_text").innerText = caption;

	var poselem = template("_area_pos");
	self.inputs = t.map(["_left", "_top", "_right", "_bottom"], function (i, cn) {
		return findelem(poselem, cn);
	});

	findelem(self.box, "_content").appendChild(poselem);

	self.export = function () {
		var c = {};
		c["position"] = self.pos;
		c["type"] = self.type;
		return c;
	};

	self.move = function (m) {
		var ia = self.pos;
		var cs = settings.control_size;
		var focus = {
			part: -1,
			info: null
		}
		for (var i = 0; i < 4; ++i) {
			var c = [ia[2*(i&1)], ia[2*(i>>1)+1]];
			if (c[0] - cs <= m[0] && c[0] + cs >= m[0] && c[1] - cs <= m[1] && c[1] + cs >= m[1]) {
				focus.part = i;
				return focus;
			}
		}
		if (ia[0] < m[0] && m[0] < ia[2] && ia[1] < m[1] && m[1] < ia[3]) {
			focus.part = 5;
			focus.info = [m[0] - ia[0], m[1] - ia[1]];
			return focus;
		}
		return null;
	};

	self.drag = function (m, focus) {
		var i = focus.part;
		var ia = self.pos;
		var p = [m[0], m[1]];
		if (i >= 5) {
			var d = focus.info;
			var s = [ia[2] - ia[0], ia[3] - ia[1]];
			if (p[0] - d[0] < 0) {
				p[0] = d[0];
			}
			if (p[0] + (s[0] - d[0]) > self.outer.size[0]) {
				p[0] = self.outer.size[0] - (s[0] - d[0]);
			}
			if (p[1] - d[1] < 0) {
				p[1] = d[1];
			}
			if (p[1] + (s[1] - d[1]) > self.outer.size[1]) {
				p[1] = self.outer.size[1] - (s[1] - d[1]);
			}
			ia[0] = p[0] - d[0];
			ia[1] = p[1] - d[1];
			ia[2] = p[0] + s[0] - d[0];
			ia[3] = p[1] + s[1] - d[1];
		} else {
			p[0] = t.clamp(m[0], 0, self.outer.size[0]);
			p[1] = t.clamp(m[1], 0, self.outer.size[1]);
			if ((1 - 2*(i&1))*(ia[2*(1-(i&1))] - p[0]) <= 0) {
				p[0] = ia[2*(1-(i&1))] - (1 - 2*(i&1));
			}
			if ((1 - 2*(i>>1))*(ia[2*(1-(i>>1))+1] - p[1]) <= 0) {
				p[1] = ia[2*(1-(i>>1))+1] - (1 - 2*(i>>1));
			}
			ia[2*(i&1)] = p[0];
			ia[2*(i>>1)+1] = p[1];
		}
		self.resize();
	};

	self.resize = function () {};
	self.redraw = function () {
		self.outer.draw();
	};

	self.clamp = function(width, height) {
		var p = self.pos;
		var r = false;
		if (width >= p[2] - p[0]) {
			if (p[0] < 0) {
				p[0] = 0;
				p[2] -= p[0];
			}
			if (p[2] > width) {
				p[0] -= p[2] - width;
				p[2] = width;
			}
		} else {
			p[0] = 0;
			p[2] = width;
			r = true;
		}
		if (height >= p[3] - p[1]) {
			if (p[1] < 0) {
				p[1] = 0;
				p[3] -= p[1];
			}
			if (p[3] > height) {
				p[1] -= p[3] - height;
				p[3] = height;
			}
		} else {
			p[1] = 0;
			p[3] = height;
			r = true;
		}
		self.synccnv();
		if (r) {
			self.resize();
		}
	};

	self.drawCtrls = function(ctx, focus) {
		var ia = self.pos;

		var fillcolor = "191,191,191";
		var strokecolor = "63,63,63";

		var focusalpha = "0.8";
		var bluralpha = "0.6";

		var cs = settings.control_size;
		for (var i = 0; i < 4; ++i) {
			var c = [ia[2*(i&1)], ia[2*(i>>1)+1]];
			var alpha = bluralpha;
			if (focus.target == self && focus.part == i) {
				alpha = focusalpha;
			}
			ctx.fillStyle = "rgba(" + fillcolor + "," + alpha + ")";
			ctx.strokeStyle = "rgba(" + strokecolor + "," + alpha + ")";
			ctx.fillRect(c[0] - cs, c[1] - cs, 2*cs, 2*cs);
			ctx.strokeRect(c[0] - cs, c[1] - cs, 2*cs, 2*cs);
		}
	};

	t.map(self.inputs, function (i, e) {
		e.addEventListener("change", function () {
			var v = parseInt(e.value);
			if (isNaN(v)) {
				e.classList.add("invalid");
			} else {
				var out = false;
				if (v < 0 || v > ((i % 2) ? self.outer.size[0] : self.outer.size[1])) {
					out = true;
				}
				if (i == 0 || i == 1) {
					if (v >= self.pos[2 + i]) {
						out = true;
					}
				} else {
					if (v <= self.pos[i - 2]) {
						out = true;
					}
				}
				if (out) {
					e.classList.add("invalid");
				} else {
					e.classList.remove("invalid");
					self.syncctrl();
					self.redraw();
				}
			}
		});
	});

	self.synccnv = function () {
		t.map(self.inputs, function (i, e) {
			e.value = self.pos[i];
			e.classList.remove("invalid");
		});
	};

	self.syncctrl = function () {
		t.map(self.inputs, function (i, e) {
			self.pos[i] = parseInt(e.value);
		});
	}
}

function Image(caption, pos) {
	Area.call(this, caption, pos);
	var self = this;
	self.type = "image";
	self.text = "Image";

	var _export = self.export;
	self.export = function () {
		var c = _export();
		c["imagetype"] = self.imgtype;
		return c;
	};

	self.draw = function(ctx, focus) {
		var ia = self.pos;

		var fillcolor = "191,191,191";
		var strokecolor = "63,63,63";

		var focusalpha = "0.8";
		var bluralpha = "0.6";

		var alpha = bluralpha;
		if (focus.target == self && focus.part == 5) {
			alpha = focusalpha;
		}
		
		ctx.fillStyle = "rgba(" + fillcolor + "," + alpha + ")";
		ctx.fillRect(ia[0], ia[1], ia[2]-ia[0], ia[3]-ia[1]);

		ctx.strokeStyle = "rgba(" + strokecolor + "," + alpha + ")";
		ctx.strokeRect(ia[0], ia[1], ia[2]-ia[0], ia[3]-ia[1]);

		var text = self.text;
		ctx.textBaseline = "middle";
		ctx.font = t.min((ia[2] - ia[0])/5, (ia[3] - ia[1])/2) + "px Arial";
		ctx.fillStyle = "rgba(" + strokecolor + "," + alpha + ")";
		var tx = (ia[0] + ia[2])/2 - ctx.measureText(text).width/2;
		var ty = (ia[1] + ia[3])/2;
		ctx.fillText(text, tx, ty);

		self.drawCtrls(ctx, focus);
	};
}

function Text(caption, pos) {
	Area.call(this, caption, pos);
	var self = this;
	self.type = "text";
	self.color = "#000000";
	self.value = "Text";
	self.font = "arial";
	self.fontname = "Arial";
	self.fontsize = 64;

	self.textscale = 0.8;

	var _export = self.export;
	self.export = function () {
		var c = _export();
		c["texttype"] = self.texttype;
		c["font"] = self.font;
		c["size"] = self.fontsize;
		c["color"] = t.rgb(self.color);
		return c;
	};

	var optselem = template("_text_opts");
	self.textinputs = {};
	t.map(["font", "size", "color"], function (i, name) {
		self.textinputs[name] = findelem(optselem, "_text_" + name);
	})
	findelem(self.box, "_content").appendChild(optselem);

	var ti = self.textinputs;
	ti["font"].onchange = function () {
		var sel = ti["font"];
		var opt = sel.options[sel.selectedIndex];
		self.font = opt.value;
		self.fontname = opt.innerText;
	};

	ti["size"].value = self.fontsize;
	ti["size"].onchange = function () {
		var inp = ti["size"];
		var size = parseInt(inp.value);
		if (!isNaN(size) && size > 0) {
			var p = self.pos;
			var c = (p[1] + p[3])/2;
			var d = Math.ceil(0.5*size/self.textscale);
			p[1] = c - d;
			p[3] = c + d;
			self.fontsize = size;
			self.clamp(self.outer.size[0], self.outer.size[1]);
			self.redraw();
		}
	};
	self.resize = function () {
		self.fontsize = Math.floor((self.pos[3] - self.pos[1])*self.textscale);
		ti["size"].value = self.fontsize;
	};

	ti["color"].value = self.color;
	ti["color"].onchange = function () {
		self.color = ti["color"].value;
		self.redraw();
	};

	self.draw = function(ctx, focus) {
		var ia = self.pos;

		var fillcolor = "191,191,191";
		var strokecolor = "63,63,63";

		var focusalpha = "0.8";
		var bluralpha = "0.6";

		var alpha = bluralpha;
		if (focus.target == self && focus.part == 5) {
			alpha = focusalpha;
		}

		ctx.strokeStyle = "rgba(" + fillcolor + "," + alpha + ")";
		ctx.strokeRect(ia[0]+1, ia[1]+1, ia[2]-ia[0]-2, ia[3]-ia[1]-2);

		ctx.strokeStyle = "rgba(" + strokecolor + "," + alpha + ")";
		ctx.strokeRect(ia[0], ia[1], ia[2]-ia[0], ia[3]-ia[1]);

		var text = self.value;
		ctx.textBaseline = "middle";
		ctx.font = self.fontsize + "px " + self.fontname;
		ctx.fillStyle = self.color;
		var tx = (ia[0] + ia[2])/2 - ctx.measureText(text).width/2;
		var ty = (ia[1] + ia[3])/2;
		ctx.fillText(text, tx, ty);

		self.drawCtrls(ctx, focus);
	};

	self.resize();
}

function ImageFixed(pos) {
	Image.call(this, "Fixed image", pos);
	var self = this;
	self.imgtype = "fixed";
}

function ImageRandom(pos) {
	Image.call(this, "Random image", pos);
	var self = this;
	self.imgtype = "random";
}

function TextFixed(pos) {
	Text.call(this, "Fixed text", pos);
	var self = this;

	self.texttype = "fixed";

	var _export = self.export;
	self.export = function () {
		var c = _export();
		c["value"] = self.value;
		return c;
	};

	var optselem = template("_text_fixed_opts");
	findelem(self.box, "_content").appendChild(optselem);

	var valelem = findelem(optselem, "_text_fixed_value");
	self.textinputs["value"] = valelem;

	valelem.value = self.value;
	valelem.onchange = function () {
		self.value = valelem.value;
		self.redraw();
	};
}

function TextRange(pos) {
	Text.call(this, "Range text", pos);
	var self = this;

	self.texttype = "range";

	self.minval = 999;
	self.maxval = 1999;
	self.stepval = 100;
	self.prefix = "";
	self.postfix = "";

	var _export = self.export;
	self.export = function () {
		var c = _export();
		c["min"] = self.minval;
		c["max"] = self.maxval;
		c["step"] = self.stepval;
		c["prefix"] = self.prefix;
		c["postfix"] = self.postfix;
		return c;
	};

	var optselem = template("_text_range_opts");
	findelem(self.box, "_content").appendChild(optselem);

	t.map(["min", "step", "max", "prefix", "postfix"], function (i, name) {
		self.textinputs[name] = findelem(optselem, "_text_range_" + name);
	});
	var ti = self.textinputs;

	self.genvalue = function () {
		self.value = self.prefix + self.minval + self.postfix;
	};

	ti["min"].value = self.minval;
	ti["min"].onchange = function () {
		var val = parseInt(ti["min"].value)
		if (!isNaN(val)) {
			self.minval = val;
			self.genvalue();
			self.redraw();
		}
	};
	ti["max"].value = self.maxval;
	ti["max"].onchange = function () {
		var val = parseInt(ti["max"].value)
		if (!isNaN(val)) {
			self.maxval = val;
			self.genvalue();
			self.redraw();
		}
	};
	ti["step"].value = self.stepval;
	ti["step"].onchange = function () {
		var val = parseInt(ti["step"].value)
		if (!isNaN(val)) {
			self.stepval = val;
			self.genvalue();
			self.redraw();
		}
	};

	ti["prefix"].value = self.prefix;
	ti["prefix"].onchange = function () {
		self.prefix = ti["prefix"].value;
		self.genvalue();
		self.redraw();
	};

	ti["postfix"].value = self.postfix;
	ti["postfix"].onchange = function () {
		self.postfix = ti["postfix"].value;
		self.genvalue();
		self.redraw();
	};

	self.genvalue();
}
