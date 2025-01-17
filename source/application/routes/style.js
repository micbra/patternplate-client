import {resolve} from 'path';

import less from 'less';
import Autoprefix from 'less-plugin-autoprefix';
import Cleancss from 'less-plugin-clean-css';
import NpmImport from 'less-plugin-npm-import';

import qio from 'q-io/fs';

function styleRouteFactory (application) {

	return async function scriptRoute () {
		let name = (this.params.path || '').replace('.css', '.less');
		let path = resolve(application.runtime.cwd, 'assets', 'style', name);

		if (!await qio.exists(path)) {
			return;
		}

		let autoprefix = new Autoprefix({'browser': ['IE 8', 'last 2 versions']});
		let cleancss = new Cleancss({'advanced': true});
		let npmimport = new NpmImport();

		try {
			let source = await qio.read(path);
			let results = await less.render(source, {
				'paths': [qio.directory(path)],
				'plugins': [npmimport, autoprefix, cleancss]
			});

			this.type = 'css';
			this.body = results.css;
		} catch(err) {
			application.log.error(err);
			this.throw(err, 500);
		}
	};
}

export default styleRouteFactory;
