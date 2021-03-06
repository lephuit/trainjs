#!/usr/bin/env node

/*

	This file is a part of node-on-train project.

	Copyright (C) 2013-2014 Thanh D. Dang <thanhdd.it@gmail.com>

	node-on-train is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	node-on-train is distributed in the hope that it will be useful, but
	WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
	General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program.  If not, see <http://www.gnu.org/licenses/>.

*/


var path = require('path');
var fs = require('fs');
var child_process = require('child_process');
var Fiber = require('fibers');

TRAINJS_LIB_PATH = path.join(path.dirname(fs.realpathSync(__filename)), '../');
var info_param = {};

// Check trainjs, nodejs, livescript version
function checkinfo () {
	info_param.trainjs_version = require(TRAINJS_LIB_PATH + 'package.json').version;
	info_param.node_version = process.version.substr(1);

	var fiber = Fiber.current;
	child_process.exec('lsc -v', function (error, stdout, stderr) {
		fiber.run(stdout);
		console.log(stderr);
		if (error !== null) {
			console.log(error);
		}
	});
	var str_lsc_ver = Fiber.yield();
    if (!str_lsc_ver) {
        console.log('LiveScript is not installed');
        return;
    }
	var num_ver_str = str_lsc_ver.split(" ")[1].split("\n");
	info_param.livescript_version = num_ver_str[0];
}

function isNormalInteger(str) {
    var n = ~~Number(str);
    return String(n) === str && n >= 0;
}

Fiber(function() {
	checkinfo();
	if (process.argv[2] == "server" || process.argv[2] == "s") {
		if (process.argv[3] && process.argv[3] == "-p" && process.argv[4]) {
			if (isNormalInteger(process.argv[4]))
				var port = process.argv[4];
			else
				var port = '1337';
		} else {
			var port = '1337';
		}
		require('./train_server.js')(port);
	} else if (process.argv[2] == "new") {
		require('./train_new.js')(info_param);
	} else if (process.argv[2] == "lake") {
		require('./train_lake.js')();
	} else if (process.argv[2] == "generate" || process.argv[2] == "g") {
		if (process.argv[3] == "scaffold")
			require('./train_scaffold.js')();
	} else if (process.argv[2] == "routes") {
		child_process.exec('lsc '+ TRAINJS_LIB_PATH +'/bin/train_routes.ls', function (error, stdout, stderr) {
			console.log(stdout);
			console.log(stderr);
			if (error !== null) {
				console.log(error);
			}
			process.kill('SIGTERM');
		});
	} else if (process.argv[2] == "-h" || process.argv[2] == "--help") {
		fs.readFile(path.dirname(fs.realpathSync(__filename)) + '/train_help', function (err, data) {
			if (err) throw err;
			console.log(data.toString());
		});
	} else if (process.argv[2] == "-v" || process.argv[2] == "--version") {
		console.log("trainjs " + info_param.trainjs_version);
	}
}).run();
