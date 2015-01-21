(function($) {
function getMethodHandler(method) {
	return function(url, query, body, cb) {
		var meth = method;
		if (!cb) {
			if (typeof body == "function") {
				cb = body;
				body = null;
			} else if (typeof query == "function") {
				cb = query;
				query = null;
			} else {
				cb = function() {};
			}
		}
		if (url.pathname) url = url.toString();
		if (!url) return cb(new Error("missing url"));
		var base = document.location.pathname.toString();
		if (/\/$/.test(base)) base = base.substring(0, base.length - 1);
		url = url.replace(/^\.\./, base.split('/').slice(0, -1).join('/'));
		url = url.replace(/^\./, base);

		// consume url parameters from query object (even if it is a body)
		if (query) {
			url = url.replace(/\/:(\w+)/g, function(str, name) {
				var val = query[name];
				if (val != null) {
					delete query[name];
					return '/' + val;
				} else {
					return '/:' + name;
				}
			});
		}

		var opts = {};
		if (/^(HEAD|GET|COPY)$/i.test(meth)) {
			query = query || body || {};
			if (meth == "GET") meth = null;
			opts.type = 'GET';
		} else {
			if (!body && query) {
				body = query;
				query = null;
			}
			if (meth == "POST") meth = null;
			opts.type = "POST";
			if (/\.php$/.test(url)) {
				opts.contentType = "application/x-www-form-urlencoded; charset=utf-8";
				opts.data = body || null;
			} else {
				opts.contentType = "application/json; charset=utf-8";
				opts.data = body && JSON.stringify(body) || null;
			}
		}
		//  use custom header - all right with preflighted since it's not GET anyway
		if (meth) opts.headers = {"X-HTTP-Method-Override": meth};

		var querystr = $.param(query || {});
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
				return cb(status, body && body.responseText || body);
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
