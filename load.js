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
  xhr.onreadystatechange = function(event) {
	if (xhr.readyState === 4) {
	  if (xhr.status !== 200 && xhr.status !== 0) {
		complete(null, xhr.statusText);
		return;
	  }
	  complete(xhr.response);
	}
  }
  xhr.setRequestHeader("If-Modified-Since", "Fri, 01 Jan 1960 00:00:00 GMT"); // no-cache
  xhr.send(null);
}