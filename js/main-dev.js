
requirejs.config({
	//By default load any module IDs from js/lib
	baseUrl: 'js',
	//except, if the module ID starts with "app",
	//load it from the js/app directory. paths
	//config is relative to the baseUrl, and
	//never includes a ".js" extension since
	//the paths config could be for a directory.
	paths: {
		bower: '../bower_components'
	}
});


function buildUrl(url, parameters){
	var qs = "";
	for(var key in parameters) {
		var value = parameters[key];
		qs += encodeURIComponent(key) + "=" + encodeURIComponent(value) + "&";
	}
	if (qs.length > 0){
	    qs = qs.substring(0, qs.length-1); //chop off last "&"
	    url = url + "?" + qs;
	}
	return url;
}


define(function(require, exports, module) {

	var 
		JSO = require('bower/jso/src/jso');

	JSO.enablejQuery($);


	var App = function() {

		this.jso = new JSO({
			providerId: "feideconnect",
			client_id: "db26f286-afc8-49d6-8128-b774eac6432f",
			redirect_uri: "suhs://",
			authorization: "https://auth.uwap.uninettlabs.no/oauth/authorization"
		});

	    // When JSO want to redirect, we'll make use of phonegap inappbrowser plugin.
	    this.jso.on('redirect', this.jso.inappbrowser({"target": "_blank"}) );

		this.jso.callback();

	};


	function strStartsWith(str, prefix) {
	    return str.indexOf(prefix) === 0;
	}

	var as = function(str) {
		var pattern = 'antall';
		if (strStartsWith(str, pattern)) {
			return str.substring(pattern.length);
		}
		return str;
	};


	App.prototype.getChart = function(ctx, res) {

		// var data = [
		//     {
		//         value: 300,
		//         color:"#F7464A",
		//         highlight: "#FF5A5E",
		//         label: "Red",labelColor : 'white',
  //               labelFontSize : '16'
		//     },
		//     {
		//         value: 50,
		//         color: "#46BFBD",
		//         highlight: "#5AD3D1",
		//         label: "Green"
		//     },
		//     {
		//         value: 100,
		//         color: "#FDB45C",
		//         highlight: "#FFC870",
		//         label: "Yellow"
		//     }
		// ];
		var de;
		var data = [];

		for(var key in res.karakterfordeling) {

			de = {
				"value": res.karakterfordeling[key],
				"label": as(key),
				"highlight": "#5AD3D1",
				"color": "#FDB45C"
			};
			if (res.karakter == as(key)) {
				de.color = "#F7464A";
				de.highlight = '#FF5A5E';
			}

			data.push(de);

		}

		var options = {
			showTooltips: true,
			scaleShowLabels: true
		};
		var myDoughnutChart = new Chart(ctx).Doughnut(data, options);


	};

	App.prototype.show = function(res) {

		var c = $('#resTableBody').empty();
		var x = null;
		for(var i = 0; i < res.resultater.length; i++) {
			x = res.resultater[i];

			var row = $('<tr>' + 
				'<td>' + x.emnekode + ' (' + x.terminkode + ' ' + x.arstall + ')</td>' +
				'<td class="karakter">' + x.karakter + '</td>' +
				'<td style="width: 130px"><canvas id="myChart" width="130" height="100"></canvas></td>' +
				'</tr>');
			c.append(row);

			var ctx = row.find('canvas').get(0).getContext("2d");
			var chart = this.getChart(ctx, x);

		}


	};

	App.prototype.run = function() {
		var that = this;

		console.log("Run()");

		var d = this.jso.dump();
		console.log(d);


		this.jso.getToken(function(token) {
			$('#tokenOut').append(
				'<p>You may perform API requests towards: </p>' + 
				'<pre>https://eksamen.gk.uwap.uninettlabs.no/&lt;whatever&gt;</pre>' + 
				'<p>With the OAuth Access token in the Authorization HTTP header in the requests</p>' + 
				'<pre>Authorization: Bearer ' + token.access_token + '</pre>' + 
				'<p>In example you can try this with the curl command:</p>' + 
				'<pre>curl -i -H \'Authorization: Bearer ' + token.access_token + '\' https://eksamen.gk.uwap.uninettlabs.no/eksamen/hentResultater</pre>' + 
				'<p>Some more details about the token:</p>' + 
				'<pre>' + JSON.stringify(token, undefined, 2) + '</pre>');
		});



		$('#out').empty().append('<pre>' + d + '</pre>'); // return;

		this.jso.ajax({
			url: "https://api.uwap.uninettlabs.no/userinfo",
			oauth: {
				scopes: {
					// request: ["userinfo", "longterm"],
					// require: ["userinfo", "rest_simonapi"]
				}
			},
			dataType: 'json',
			success: function(data) {
				console.log("Response (google):");
				console.log(data);
				$(".loader-hideOnLoad").hide();
				$('#out').empty().append('<pre>' + JSON.stringify(data, undefined, 4) + '</pre>');

				that.basicData('https://eksamen.gk.uwap.uninettlabs.no/eksamen/hentResultater');
			}
		});

	};


	App.prototype.basicData = function(api) {

		var that = this;

		var opts = {};
		var url = buildUrl(api, opts);

		this.jso.ajax({
			url: url,
			oauth: {
				scopes: {
					// request: ["userinfo", "longterm", "rest_simon"]
					// require: ["rest_simon"]
				}
			},
			dataType: 'json',
			success: function(data) {
				console.log("Response (basic data):");
				console.log(data);

				$('#out2').empty().append('<h3>Media output</h3><pre>' + JSON.stringify(data, undefined, 4) + '</pre>');
				that.show(data);

			}
		});
	};



	// App.prototype._relay = function(opts, callback) {

	// 	var that = this;
	// 	opts.affiliation = 'employee';

	// 	var api = 'https://simon.gk.uwap.uninettlabs.no/';
	// 	var url = buildUrl(api, opts);

	// 	this.jso.ajax({
	// 		url: url,
	// 		oauth: {
	// 			scopes: {
	// 				request: ["userinfo", "longterm", "rest_simon"]
	// 				// require: ["rest_simon"]
	// 			}
	// 		},
	// 		dataType: 'json',
	// 		success: function(data) {
	// 			console.log("Response (google):");
	// 			console.log(data);

	// 			callback(data);

	// 		}
	// 	});

	// };


	// App.prototype.data = function() {
	// 	var that = this;

		

	// 	this._relay({
	// 		"method": "isRelayUser"
	// 	}, function(res) {

	// 		if (res.status !== true) return alert('Du er ikke relay bruker');

	// 		that._relay({
	// 			"method": "getRelayUserMedia"
	// 		}, function(media) {

	// 			$('#out2').empty().append('<h3>Media output</h3><pre>' + JSON.stringify(media, undefined, 4) + '</pre>');

	// 		});

	// 	});


	// };


    exports.App = App;

});
