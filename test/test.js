describe("io.js tests", function(){
	it("read i8", function(){
		var arr = [1,2,3,4,5];
		var buf = new Uint8Array(arr).buffer;
		var s = Stream(buf);
		for (var i = 0; i < arr.length; i++)
			expect(s.read(I8)).toEqual(arr[i]);
	});
});