import {spawn} from 'child_process';
import {resolve, dirname} from 'path';
import {createWriteStream} from 'fs';
import {btoa} from 'abab';
import md5 from 'md5';
import rc from 'rc';
import watchify from 'watchify';
import browserify from 'browserify';
import cssmodulesify from 'css-modulesify';
import mkdirp from 'mkdirp';
import denodeify from 'denodeify';
import autoprefixer from 'autoprefixer';

const mkdir = denodeify(mkdirp);

import pkg from './package.json';

const paths = {
	'root': '.',
	'assets': ['source/static/**/*.!(js|less)'],
	'script': ['source/static/**/*.js'],
	'style': ['source/static/**/*.less'],
	'source': [
		'source/!(library)/**/*.@(js|jsx)',
		'source/**/!(static|universal)/**/*.@(js|jsx)'
	],
	'documentation': 'source/**/*.mjs',
	'json': 'source/**/*.json',
	'distribution': 'distribution',
	'public': 'distribution/library/static',
	'docs': ['./*.md', 'documentation/**/*.md']
};

export async function test() {
	/** @desc Executes npm test */
	return new Promise((resolve, reject) => {
		const test = spawn('npm', ['test'], {stdio: 'inherit'});
		test.on('error', reject);
		test.on('exit', code => {
			if (code !== 0) {
				reject(`Process exited with code ${code}`);
			}
			resolve();
		});
	});
}

export async function documentation() {
	/** @desc Builds documentation from 'source/*.mjs' to './*.md' */
	const source = await this.source(paths.documentation);

	if (!source.documentation) {
		source.filter('documentation', async function(buffer, options) {
			const code = buffer.toString('utf-8').replace(/`/g, '\\`');
			const body = ['return `', code, '`\n'].join('');

			try {
				const data = new Function('props', body)(options);
				return {data, ext: '.md'};
			} catch (err) {
				err.message = `Error while executing documentation inline js: ${err.message}`;
				throw err;
			}
		});
	}

	const helpers = {btoa, md5};

	return await source
		.documentation({pkg, helpers})
		.target(paths.root);
}

async function bundle(options, watch = false) {
	const configuration = rc(options.rc);
	delete configuration._;
	delete configuration.configs;
	delete configuration.config;

	const bundler = browserify({
		entries: options.entry ? [options.entry] : [],
		debug: true,
		noParse: options.server ? ['react', 'react-dom'] : [],
		extensions: ['.js', '.jsx'],
		transform: [
			require('babelify').configure(configuration)
		],
		cache: {},
		packageCache: {},
		standalone: options.add && !options.entry ? 'standalone' : false
	});

	if (options.add) {
		bundler.add(options.add);
	}

	/* if (watch && options.livereactload) {
		bundler.plugin(livereactload);
	} */

	const isProduction = process.env.NODE_ENV !== 'development';
	const generateScopedName = isProduction ?
		function (name, filename, css) {
			return `a${md5(css).toString(36).substr(0, 5)}`;
		} :
		cssmodulesify.generateLongName;

	await mkdir(dirname(options.cssout));
	bundler.plugin(cssmodulesify, {
		output: options.cssout,
		generateScopedName,
		postcssAfter: [
			autoprefixer({
				browsers: '> 5%'
			})
		]
	});

	const targetPath = resolve(process.cwd(), options.jsout);

	if (!watch) {
		await mkdir(dirname(targetPath));
		await mkdir(dirname(options.cssout));

		return new Promise((resolve, reject) => {
			const target = createWriteStream(targetPath);
			const bundling = bundler.bundle();
			bundling.on('error', reject);
			target.on('error', reject);
			target.on('close', resolve);
			bundling.pipe(target);
		});
	}

	if (watch) {
		const watcher = watchify(bundler);

		const wbundle = async (cb = () => {}) => {
			await mkdir(dirname(targetPath));
			await mkdir(dirname(options.cssout));

			this.log(`Bundling update for ${targetPath}...`);
			const target = createWriteStream(targetPath);
			const bundling = watcher.bundle();

			bundling.on('error', cb);
			target.on('error', cb);
			bundling.pipe(target);

			target.on('close', () => {
				this.log(`Updated ${targetPath}...`);
				cb();
			});
		};

		watcher.on('update', () => {
			wbundle();
		});

		return new Promise((resolve, reject) => {
			wbundle(err => {
				if (err) {
					reject(err);
				} else {
					resolve(this);
				}
			});
		});
	}
}

export async function script(watch = false) {
	const source = await this.source(paths.script);
	await source.eslint();
	await source.target(paths.public);

	try {
		return await bundle.bind(this)({
			rc: 'babel-script',
			livereactload: true,
			entry: './source/library/static/script/index.js',
			cssout: './distribution/library/static/style/light.css',
			jsout: './distribution/library/static/script/index.js'
		}, watch);
	} catch (err) {
		this.error(err.message);
	}
}

export async function copy() {
	/** @desc Copies all static files from source to distribution */
	await this.source(paths.assets).target(paths.public);
	return await this.source(paths.json).target(paths.distribution);
}

export async function clear() {
	/** @desc Removes all build output from the project */
	return await this.clear(paths.distribution);
}

export async function build(withScripts = true) {
	/** @desc Transpiles sources and lints them. Executes the tasks clear, copy and test */
	const source = await this.source(paths.source);

	await source.eslint();
	const results = await source.babel();

	// await clear.bind(this)();
	await results.target(paths.distribution);
	await copy.bind(this)();

	try {
		await bundle.bind(this)({
			rc: 'babel',
			server: true,
			livereactload: false,
			add: './source/library/universal/server.js',
			cssout: './distribution/library/static/style/_light.css',
			jsout: './distribution/library/universal/server.js'
		});
	} catch (err) {
		this.error(err.message);
	}

	if (withScripts) {
		await script.bind(this)();
	}

	return test.bind(this)();
}

export async function watchbuild() {
	try {
		await build.bind(this)(false);
		return await documentation.bind(this)();
	} catch (err) {
		throw err;
	}
}

export async function watch() {
	/** @desc Watches files found in ./source and starts build and/or documentation tasks on file changes */
	await this.watch(paths.source, ['watchbuild']);
	await script.bind(this)(true);
}

export default async function () {
	/** @desc Starts the watch task and a server instance */
	await this.start('watch');
}
