/// <reference path="node.d.ts" />

import fs = require('fs');
import path = require('path');
import ps = require('child_process');


const buildPluginName = process.argv.length > 2 ? process.argv[2] : null;

var dir = fs.realpathSync(__dirname);

function compile(pluginName, pluginDir) {
	console.log("Compile: %s ...", pluginName);
	var options: ps.ExecOptions = {
		cwd: pluginDir
	};
	return new Promise<any>((resovle, reject) => {
		ps.exec("tsc *.ts --out ../../dist/plugins/" + pluginName + "/" + pluginName + ".js", options, (error: Error, stdout: string, stderr: string) => {
			if (error) {
				reject([error, stdout]);
			} else {
				resovle();
			}
		});
	});
}

function compress(pluginName) {
	console.log("Compress: %s ...", pluginName);
	var options: ps.ExecOptions = {
		cwd: path.join(dir, "../dist/plugins/", pluginName)
	};
	return new Promise<any>((resovle, reject) => {
		ps.exec("uglifyjs " + pluginName + ".js > " + pluginName + 
			".min.js --compress --support-ie8 --source-map " + pluginName + ".min.js.map", 
			options, (error: Error, stdout: string, stderr: string) => {
			if (error) {
				reject([error, stdout]);
			} else {
				resovle();
			}
		});
	});
}

function copyCSS(pluginName, pluginDir) {
	console.log("Copy CSS: %s ...", pluginName);
	var options: ps.ExecOptions = {
		cwd: pluginDir
	};
	return new Promise<any>((resovle, reject) => {
		ps.exec("fsys --task=copy --filesFolders=less --destination=../../dist/plugins/" + pluginName + " --clobber='true' --preserveTimestamps='false'", 
			options, (error: Error, stdout: string, stderr: string) => {
			if (error) {
				reject([error, stdout]);
			} else {
				resovle();
			}
		});
	});
}

function compileCSS(pluginName) {
	console.log("Compile CSS: %s ...", pluginName);
	var options: ps.ExecOptions = {
		cwd: path.join(dir, "../dist/plugins/", pluginName)
	};
	return new Promise<any>((resovle, reject) => {
		ps.exec("lessc less/" + pluginName + ".less " + pluginName + ".css --clean-css=\"--s1 --advanced --compatibility=ie8\" --source-map", 
			options, (error: Error, stdout: string, stderr: string) => {
			if (error) {
				reject([error, stdout]);
			} else {
				resovle();
			}
		});
	});
}

async function build(plugins, item) {
	if (item >= plugins.length) {
		return;
	}
	var f = plugins[item];
	let file = path.join(dir, f);
	try {
		await compile(f, file);
		await compress(f);
		await copyCSS(f, file);
		await compileCSS(f);
		console.log("Success!!\n");
		build(plugins, item + 1);
	} catch (e) {
		console.error("build failed: %s : %s\n", e[0], e[1]);
	}
}

console.log("Build plugins ...\n");

fs.readdir(dir, (err, files) => {
	if (err) 
		return;
	var plugins: string[] = [];
	files.forEach((f) => {
		let file = path.join(dir, f);
		if (fs.statSync(file).isDirectory() && 
			(buildPluginName == null || f === buildPluginName)) {
			plugins.push(f);
		}
	});
	build(plugins, 0);
});

