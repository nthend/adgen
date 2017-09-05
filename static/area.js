function Area(text, pos, fill) {
	var self = this;
	self.type = "area";

	self.text = text;
	self.pos = pos;
	self.fill = fill;

	self.box = template("_area");
	findelem(self.box, "_text").innerText = text;

	var pos = template("_area_pos");
	self.inputs = t.map(["_left", "_top", "_right", "_bottom"], function (i, cn) {
		return findelem(pos, cn);
	});

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
	};

	self.draw = function(ctx, focus) {
		var ia = self.pos;
			var rectcol, textcol;
			if (focus.target == self && focus.part == 5) {
				rectcol = "rgba(191,191,191,0.8)";
				textcol = "rgba(63,63,63,0.8)";
			} else {
				rectcol = "rgba(191,191,191,0.4)";
				textcol = "rgba(63,63,63,0.4)";
			}

			if (self.fill) {
				ctx.fillStyle = rectcol;
				ctx.fillRect(ia[0], ia[1], ia[2]-ia[0], ia[3]-ia[1]);
			} else {
				ctx.strokeStyle = rectcol;
				ctx.strokeRect(ia[0], ia[1], ia[2]-ia[0], ia[3]-ia[1]);
			}

			var text = self.text;
			ctx.textBaseline = "middle";
			ctx.font = t.min((ia[2] - ia[0])/5, (ia[3] - ia[1])/2) + "px Arial";
			ctx.fillStyle = textcol;
			var tx = (ia[0] + ia[2])/2 - ctx.measureText(text).width/2;
			var ty = (ia[1] + ia[3])/2;
			ctx.fillText(text, tx, ty);

			var cs = settings.control_size;
			for (var i = 0; i < 4; ++i) {
				var c = [ia[2*(i&1)], ia[2*(i>>1)+1]];
				if (focus.target == self && focus.part == i) {
					ctx.fillStyle = "rgba(191,191,191,0.8)";
				} else {
					ctx.fillStyle = "rgba(191,191,191,0.4)";
				}
				ctx.fillRect(c[0] - cs, c[1] - cs, 2*cs, 2*cs);
			}
	};

	self.clamp = function(width, height) {
		var p = self.pos;
		p[0] = t.clamp(p[0], 0, width-1);
		p[1] = t.clamp(p[1], 0, height-1);
		p[2] = t.clamp(p[2], 0, width);
		p[3] = t.clamp(p[3], 0, height);
	}

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
					self.outer.draw();
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

	findelem(self.box, "_content").appendChild(pos);
}

function Image(text, pos) {
	Area.call(this, text, pos, true);
	var self = this;
	self.type = "image";
}

function Text(text, pos) {
	Area.call(this, text, pos, false);
	var self = this;
	self.type = "text";
	self.color = "#3F3F3F";
	self.value = "Text";
	self.font = "arialnb.ttf";
	self.size = 64;
}
