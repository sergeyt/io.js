/** @const */ var BOOL=0;
/** @const */ var I8=1;
/** @const */ var U8=2;
/** @const */ var I16=3;
/** @const */ var U16=4;
/** @const */ var I32=5;
/** @const */ var U32=6;
/** @const */ var F32=7;
/** @const */ var F64=8;
/** @const */ var DATE=9;
/** @const */ var UTF8=10;

/**
 * Creates binary stream reader with the following API:
 * - stream.read(type) - reads specified type from the stream,
 *   where type could be one of the following values:
 *     BOOL - to read boolean value,
 *     I8 - to read signed 8-bit integer number,
 *     U8 - to read unsigned 8-bit integer number,
 *     I16 - to read signed 16-bit integer number,
 *     U16 - to read unsigned 16-bit integer number,
 *     I32 - to read signed 32-bit integer number,
 *     U32 - to read unsigned 32-bit integer number,
 *     F32 - to read 32-bit floating number,
 *     F64 - to read 64-bit floating number,
 *     UTF8 - to read UTF8 string sequence terminated by zero,
 *     object - to read struct as sequence of primitive types or structs.
 */
function Stream(buffer, offset, length, le){
	if (arguments.length <= 1) offset = 0;
	if (arguments.length <= 2) length = buffer.byteLength;
	if (arguments.length <= 3) le = false;

	var start = offset;
	var pos = offset;
	var view = new DataView(buffer, offset, length);
	var stream = {
		length: length,
		position: function() { return pos; }
	};

	function isObject(v) { return !!(v && (typeof v == 'object')); }

	if (Object.keys === undefined) {
		Object.keys = function(v) {
			var arr = [];
			for (var k in v) {
				arr.push(k);
			}
			return arr;
		};
	}

	stream.read = function(type) {
		if (isObject(type)) return readSeq(type);
		return readPrimitive(type);
	};

	stream.readBytes = function(count) {
		// TODO find a way to read buffer with one call
		var bytes = new Array(count);
		for (var i = 0; i < count; i++)
			bytes[i] = readByte();
		return bytes;
	};

	// TODO origin parameter
	stream.seek = function(offset) {
		pos = offset;
		return stream;
	};

	stream.skip = function(bytes) {
		pos += bytes;
		return stream;
	};

	stream.slice = function(position, size) {
		throw NotImplemented();
	};

	function NotImplemented() { return new Error("not implemented yet!"); }

	function readSeq(type) {
		var keys = Object.keys(type);
		var result = {};
		for (var i = 0; i < keys.length; i++) {
			var k = keys[i];
			var t = type[k];
			var v = stream.read(t);
			result[k] = v;
		}
		return result;
	}

	function readPrimitive(type) {
		var v;
		switch (type){
			case BOOL:
				return !!view.getInt8(pos++);
			case I8:
				return view.getInt8(pos++);
			case U8:
				return view.getUint8(pos++);
			case I16:
				v = view.getInt16(pos, le);
				pos += 2;
				break;
			case U16:
				v = view.getUint16(pos, le);
				pos += 2;
				break;
			case I32:
				v = view.getInt32(pos, le);
				pos += 4;
				break;
			case U32:
				v = view.getUint32(pos, le);
				pos += 4;
				break;
			case F32:
				v = view.getFloat32(pos, le);
				pos += 4;
				break;
			case F64:
				v = view.getFloat64(pos, le);
				pos += 8;
				break;
			case UTF8:
				return readUtf8();
			case DATE:
				throw NotImplemented();
		}
		return v;
	}

	function readByte(){
		return view.getUint8(pos++);
	}

	// TODO: find native way to read utf8 strings from array buffer

	/*
	 * UTF8 to unicode algorithm:
	 * Let's take a UTF-8 byte sequence. The first byte in a new sequence will tell us how long the sequence is.
	 * Let's call the subsequent decimal bytes z y x w v u.
	 * 
	 * If z is between and including 0 - 127, then there is 1 byte z. The decimal Unicode value ud = the value of z.
	 * If z is between and including 192 - 223, then there are 2 bytes z y; ud = (z-192)*64 + (y-128)
	 * If z is between and including 224 - 239, then there are 3 bytes z y x; ud = (z-224)*4096 + (y-128)*64 + (x-128)
	 * If z is between and including 240 - 247, then there are 4 bytes z y x w; ud = (z-240)*262144 + (y-128)*4096 + (x-128)*64 + (w-128)
	 * If z is between and including 248 - 251, then there are 5 bytes z y x w v; ud = (z-248)*16777216 + (y-128)*262144 + (x-128)*4096 + (w-128)*64 + (v-128)
	 * If z is 252 or 253, then there are 6 bytes z y x w v u; ud = (z-252)*1073741824 + (y-128)*16777216 + (x-128)*262144 + (w-128)*4096 + (v-128)*64 + (u-128)
	 * If z = 254 or 255 then there is something wrong!
	 * 
	 * Example: take the decimal Unicode designation 8482 (decimal), which is for the trademark sign. 
	 * This number is larger than 2048, so we get three numbers.
	 * The first number is 224 + (8482 div 4096) = 224 + 2 = 226.
	 * The second number is 128 + (8482 div 64) mod 64) = 128 + (132 mod 64) = 128 + 4 = 132.
	 * The third number is 128 + (8482 mod 64) = 128 + 34 = 162.
	 * Now the other way round. We see the numbers 226, 132 and 162. What is the decimal Unicode value?
	 * In this case: (226-224)*4096+(132-128)*64+(162-128) = 8482.
	 * And the conversion between hexadecimal and decimal? Come on, this is not a math tutorial! In case you don't know, use a calculator.
	*/
	function readUtf8(bytesToRead) {
		if (arguments.length == 0) bytesToRead = -1;

		var s = "";
		var byteCount = 0;

		while (bytesToRead == -1 || byteCount < bytesToRead) {
			var b0 = readByte();
			byteCount++;
			if (b0 == 0) break;

			if ((b0 & 0x80) == 0) {
				s += String.fromCharCode(b0);
				continue;
			}

			var ch;
			var b1 = readByte();
			byteCount++;
			if (b1 == 0) {
				//Dangling lead byte, do not decompose
				s += String.fromCharCode(b0);
				break;
			}

			if ((b0 & 0x20) == 0) {
				ch = String.fromCharCode(((b0 & 0x1F) << 6) | (b1 & 0x3F));
			} else {
				var b2 = readByte();
				byteCount++;
				if (b2 == 0) {
					//Dangling lead bytes, do not decompose
					s += String.fromCharCode((b0 << 8) | b1);
					break;
				}

				var ch32;
				if ((b0 & 0x10) == 0) {
					ch32 = ((b0 & 0x0F) << 12) | ((b1 & 0x3F) << 6) | (b2 & 0x3F);
				} else {
					var b3 = readByte();
					byteCount++;
					if (b3 == 0) {
						s += String.fromCharCode((b0 << 8) | b1);
						s += String.fromCharCode(b2);
						break;
					}
					ch32 = ((b0 & 0x07) << 0x18) // combine 6 bit parts
							| ((b1 & 0x3F) << 12)
							| ((b2 & 0x3F) << 6)
							| (b3 & 0x3F);
				}

				if ((ch32 & 0xFFFF0000) == 0) {
					ch = String.fromCharCode(ch32);
				} else {
					//break up into UTF16 surrogate pair
					s += String.fromCharCode((ch32 >> 10) | 0xD800);
					ch = String.fromCharCode((ch32 & 0x3FF) | 0xDC00);
				}
			}

			s += ch;
		}

		return s;
	}

	return stream;
}

