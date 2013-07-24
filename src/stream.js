/** @const */ var BOOL=0;
/** @const */ var I8=1;
/** @const */ var U8=2;
/** @const */ var I16=3;
/** @const */ var U16=4;
/** @const */ var I32=5;
/** @const */ var U32=6;
/** @const */ var SINGLE=7;
/** @const */ var DOUBLE=8;
/** @const */ var DATE=9;
/** @const */ var UTF8=10;

function Stream(buffer, offset, length, le){
	if (arguments.length <= 1) offset = 0;
	if (arguments.length <= 2) length = buffer.byteLength;
	if (arguments.length <= 3) le = false;
	var start = offset;
	var pos = offset;
	var view = new DataView(buffer, offset, length);
	var stream = {};

	function readPrimitive(type){
		switch (type){
			case BOOL:
				return !!view.getInt8(pos++);
			case I8:
				return view.getInt8(pos++);
			case U8:
				return view.getUint8(pos++);
			case I16:
				return view.getInt16(pos+=2, le);
			case U16:
				return view.getUint16(pos+=2, le);
			case I32:
				return view.getInt32(pos+=4, le);
			case U32:
				return view.getUint32(pos+=4, le);
			case FLOAT:
				return view.getFloat32(pos+=4, le);
			case DOUBLE:
				return view.getFloat64(pos+=8, le);
			case UTF8:
				throw new Error("not implemented!");
		}
	}

	stream.read = function(type){
		return readPrimitive(type);
	};

	return stream;
}

