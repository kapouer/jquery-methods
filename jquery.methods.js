(function($) {
function getMethodHandler(method) {
	return function(url, query, body, cb) {
		var meth = method;
		if (!cb) {
			if (typeof body == "function") {
				cb = body;
				body = query;
				query = null;
			} else if (!body && typeof query == "function") {
				cb = query;
				query = null;
			}
		}
		if (url.pathname) url = url.toString();
		if (!url) return cb(new Error("missing url"));
		var base = document.location.pathname.toString();
		if (/\/$/.test(base)) base = base.substring(0, base.length - 1);
		url = url.replace(/^\.\./, base.split('/').slice(0, -1).join('/'));
		url = url.replace(/^\./, base);
		var opts = {};
		if (/^(HEAD|GET|COPY|DELETE)$/i.test(meth)) {
			query = query || body || {};
			if (meth == "GET") meth = null;
			opts.type = 'GET';
		} else {
			body = body || {};
			if (meth == "POST") meth = null;
			opts.type = "POST";
			opts.contentType = "application/json; charset=utf-8";
			opts.data = JSON.stringify(body);
		}
		//  use custom header - all right with preflighted since it's not GET anyway
		if (meth) opts.headers = {"X-HTTP-Method-Override": meth};
		var qobj = {};
		for (var k in query) qobj[k] = query[k];
		if (query) url = url.replace(/\/:(\w+)/g, function(str, name) {
			var val = qobj[name];
			if (val != null) {
				delete qobj[name];
				return '/' + val;
			} else {
				return '/:' + name;
			}
		});
		var querystr = $.param(qobj || {});
		if (querystr) url += (url.indexOf('?') > 0 ? "&" : "?") + querystr;
		opts.url = url;

		return $.ajax(opts).always(function(body, ts, res) {
			var status = res && res.status || body.status;
			if (status >= 200 && status < 400) {
				if (typeof body == "string") body = null; // discard non-json
				body = res.getResponseHeader('Location') || body;
				return cb(null, body);
			} else {
				if (!status) status = -1;
				return cb(status);
			}
		});
	};
}
$.HEAD = getMethodHandler("HEAD");
$.GET = getMethodHandler("GET");
$.PUT = getMethodHandler("PUT");
$.POST = getMethodHandler("POST");
$.DELETE = getMethodHandler("DELETE");
$.COPY = getMethodHandler("COPY");

})(jQuery);
