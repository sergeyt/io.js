describe("io.js tests", function() {
	function buffer(bytes) {
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
		var s = Stream(buffer([0x0b, 0xcd]));
		expect(s.read(I16)).toEqual(0x0bcd);
	});

	it("stream.read(U16)", function() {
		var s = Stream(buffer([0xab, 0xcd]));
		expect(s.read(U16)).toEqual(0xabcd);
	});

	it("stream.read(I32)", function() {
		var s = Stream(buffer([0x0b, 0xcd, 0xef, 0xab]));
		expect(s.read(I32)).toEqual(0x0bcdefab);
	});

	it("stream.read(U32)", function() {
		var s = Stream(buffer([0xab, 0xcd, 0xef, 0xab]));
		expect(s.read(I32)).toEqual(0xabcdefab);
	});

	it("stream.read(F32)", function() {
		var s = Stream(buffer([0x0b, 0xcd, 0xef, 0xab]));
		expect(s.read(F32)).toEqual(0x0bcdefab);
	});

	it("stream.read(F64)", function() {
		var s = Stream(buffer([0x0b, 0xcd, 0xef, 0xab, 0x0b, 0xcd, 0xef, 0xab]));
		expect(s.read(F64)).toEqual(0x0bcdefab);
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
		var s = Stream(buffer([0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x02]));
		var v = s.read({ x: I32, y: I32 });
		expect(v.x).toEqual(1);
		expect(v.y).toEqual(2);
	});
});