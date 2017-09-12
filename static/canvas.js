function Canvas(elem, size, color) {
	var self = this;
	self.elem = elem;
	self.context = elem.getContext("2d");
	self.areas = [];

	self.cs = settings.control_size;

	self.color = color;
	t.elem("canvas_color").value = color;
	t.elem("canvas_color").addEventListener("change", function () {
		self.color = t.elem("canvas_color").value;
		self.draw();
	});

	self.size = [0, 0];
	self.resize = function (w, h) {
		self.size = [w, h];
		self.elem.width = w;
		self.elem.height = h;
		t.map(self.areas, function (k, area) {
			area.clamp(w, h);
		});
		t.elem("canvas_width").value = w;
		t.elem("canvas_height").value = h;
		self.draw();
	};
	
	var input_resize = function () {
		var w = parseInt(t.elem("canvas_width").value);
		var h = parseInt(t.elem("canvas_height").value);
		if (!isNaN(w) && !isNaN(h)) {
			self.resize(w, h);
		}
	};
	t.elem("canvas_width").addEventListener("change", input_resize);
	t.elem("canvas_height").addEventListener("change", input_resize);

	self.addArea = function (area) {
		self.areas.push(area);
		area.outer = self;
		area.clamp(self.size[0], self.size[1]);

		findelem(area.box, "_up").onclick = function () {
			for (var k = 0; k < self.areas.length; ++k) {
				var a = self.areas[k];
				if (a == area && k > 0) {
					self.areas[k] = self.areas[k-1];
					self.areas[k-1] = a;
					break;
				}
			}
			self.buildlist();
			self.draw();
		};
		findelem(area.box, "_down").onclick = function () {
			for (var k = 0; k < self.areas.length; ++k) {
				var a = self.areas[k];
				if (a == area && k + 1 < self.areas.length) {
					self.areas[k] = self.areas[k+1];
					self.areas[k+1] = a;
					break;
				}
			}
			self.buildlist();
			self.draw();
		};
		findelem(area.box, "_del").onclick = function () {
			for (var k = 0; k < self.areas.length; ++k) {
				var a = self.areas[k];
				if (a == area) {
					self.areas.splice(k, 1);
					break;
				}
			}
			self.buildlist();
			self.draw();
		};

		self.buildlist();
		self.synccnv();
	}

	self.buildlist = function () {
		t.elem("area_list").innerHTML = "";
		for (var k = 0; k < self.areas.length; ++k) {
			var area = self.areas[k];
			t.elem("area_list").appendChild(area.box);
		}
	};

	self.import = function (config) {

	};

	self.export = function () {
		return {
			canvas: {
				dimensions: [self.size[0], self.size[1]],
				background: t.rgb(self.color),
			},
			areas: t.map(self.areas, function (i, area) {
				return area.export();
			})
		};
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
		for (var k = 0; k < self.areas.length; ++k) {
			var area = self.areas[self.areas.length - k - 1];
			var af = area.move(m);
			if (af) {
				self.focus = af;
				self.focus.target = area;
				return;
			}
		}
		self.focus.target = null;
	}
	self.pick = function (m) {
		self.move(m);
	}
	self.drag = function (m) {
		for (var k = 0; k < self.areas.length; ++k) {
			var area = self.areas[k];
			if (self.focus.target == area) {
				area.drag(m, self.focus);
			}
		}
		self.synccnv();
	}
	self.drop = function (m) {
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
		
		ctx.fillStyle = self.color;
		ctx.fillRect(0, 0, w, h);
		
		for (var k = 0; k < self.areas.length; ++k) {
			var area = self.areas[k];
			area.draw(ctx, self.focus);
		}
	}

	self.synccnv = function () {
		t.map(self.areas, function (k, area) {
			area.synccnv();
		});
	}
	self.syncctrl = function () {
		t.map(self.areas, function (k, area) {
			area.syncctrl();
		});
		self.draw();
	}

	self.resize(size[0], size[1]);
}
