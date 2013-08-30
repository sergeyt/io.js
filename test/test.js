describe("io.js tests", function() {
	function hex(c) {
		c = c.toLowerCase();
		c = c.charCodeAt(0);
		var a = 'a'.charCodeAt(0);
		var f = 'f'.charCodeAt(0);
		var z = '0'.charCodeAt(0);
		return c >= a && c <= f ? 10 + c - a : c - z;
	}

	function buffer(bytes) {
		if (typeof bytes == 'string') {
			var arr = [];
			for (var i = 0; i+1 < bytes.length; i+=2) {
				var b = hex(bytes.charAt(i)) << 4 | hex(bytes.charAt(i+1));
				arr.push(b);
			}
			bytes = arr;
		}
		return new Uint8Array(bytes).buffer;
	}

	it("stream.read(BOOL)", function() {
		var arr = [0, 1, 0, 2, 0];
		var s = Stream(buffer(arr));
		for (var i = 0; i < arr.length; i++)
			expect(s.read(BOOL)).toEqual(arr[i] != 0);
	});

	it("stream.read(I8)", function() {
		var arr = [-1,-2,3,4,5];
		var s = Stream(buffer(arr));
		for (var i = 0; i < arr.length; i++)
			expect(s.read(I8)).toEqual(arr[i]);
	});

	it("stream.read(U8)", function() {
		var arr = [1, 2, 3, 4, 5];
		var s = Stream(buffer(arr));
		for (var i = 0; i < arr.length; i++)
			expect(s.read(U8)).toEqual(arr[i]);
	});

	it("stream.read(I16)", function() {
		var s = Stream(buffer("cd0b"));
		expect(s.read(I16)).toEqual(0x0bcd);
	});

	it("stream.read(U16)", function() {
		var s = Stream(buffer("cdab"));
		expect(s.read(U16)).toEqual(0xabcd);
	});

	it("stream.read(I32)", function() {
		var s = Stream(buffer("ffdebc0a"));
		expect(s.read(I32)).toEqual(0x0abcdeff);
	});

	it("stream.read(U32)", function() {
		var s = Stream(buffer("abefcdab"));
		expect(s.read(U32)).toEqual(0xabcdefab);
	});

	it("stream.read(F32)", function() {
		var data = [
			{ buf: "00000000", val: 0 },
			{ buf: "000080bf", val: -1 },
			{ buf: "c3f54840", val: 3.14 },
			{ buf: "c3f548c0", val: -3.14 }
		];
		for (var i = 0; i < data.length; i++) {
			var s = Stream(buffer(data[i].buf));
			expect(s.read(F32).toFixed(2)).toEqual(data[i].val.toFixed(2));
		}
	});

	it("stream.read(F64)", function() {
		var data = [
			{ buf: "0000000000000000", val: 0 },
			{ buf: "000000000000f0bf", val: -1 },
			{ buf: "1f85eb51b81e0940", val: 3.14 },
			{ buf: "1f85eb51b81e09c0", val: -3.14 }
		];
		for (var i = 0; i < data.length; i++) {
			var s = Stream(buffer(data[i].buf));
			expect(s.read(F64).toFixed(2)).toEqual(data[i].val.toFixed(2));
		}
	});

	it("stream.read(UTF8)", function() {

		function check(str) {

			var arr = [];
			for (var i = 0; i < str.length; i++)
				arr.push(str.charCodeAt(i));
			arr.push(0);

			var s = Stream(buffer(arr));
			expect(s.read(UTF8)).toEqual(str);
		}

		check("hello!");
	});

	it("stream.read(struct)", function() {
		var s = Stream(buffer("0100000002000000"));
		var v = s.read({ x: I32, y: I32 });
		expect(v.x).toEqual(1);
		expect(v.y).toEqual(2);
	});
});