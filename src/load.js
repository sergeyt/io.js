function load(url, complete, progress, responseType) {
  var xhr = new XMLHttpRequest();
  var async = true;
  xhr.open("GET", url, async);
  xhr.responseType = responseType || "arraybuffer";
  if (progress) {
	xhr.onprogress = function(event) {
	  progress(xhr.response, event.loaded, event.total);
	};
  }
  xhr.onload = function(e) {
	if (xhr.status == 200) {
	  complete(xhr.response);
	} else {
	  complete(null, xhr.statusText);
	}
  };
  xhr.setRequestHeader("If-Modified-Since", "Fri, 01 Jan 1960 00:00:00 GMT"); // no-cache
  xhr.send();
}