import { src, dest, series, task } from 'gulp';
import { createProject } from 'gulp-typescript';
import typescript from 'typescript';
import { init, write } from 'gulp-sourcemaps';
import del from 'del';
import { through } from 'event-stream';
import { publish, createVSIX } from 'vsce';
import { createAdditionalLanguageFiles, rewriteLocalizeCalls } from 'vscode-nls-dev';

const tsProject = createProject('./tsconfig.json', { typescript });

const inlineMap = true;
const inlineSource = false;
const outDest = 'out';

// If all VS Code langaues are support you can use nls.coreLanguages
const languages = [
	{ id: "zh-tw", folderName: "cht", transifexId: "zh-hant" },
	{ id: "zh-cn", folderName: "chs", transifexId: "zh-hans" },
	{ id: "fr", folderName: "fra" },
	{ id: "de", folderName: "deu" },
	{ id: "it", folderName: "ita" },
	{ id: "es", folderName: "esp" },
	{ id: "ja", folderName: "jpn" },
	{ id: "ko", folderName: "kor" },
	{ id: "ru", folderName: "rus" },
	//{ id: "bg", folderName: "bul" }, // VS Code supports Bulgarian, but VS is not currently localized for it
	{ id: "hu", folderName: "hun" }, // VS Code supports Hungarian, but VS is not currently localized for it
	{ id: "pt-br", folderName: "ptb", transifexId: "pt-BR" }
	//{ id: "tr", folderName: "trk" },
	//{ id: "cs", folderName: "csy" },
	//{ id: "pl", folderName: "plk" }
];

const cleanTask = function () {
	return del(['out/**', 'package.nls.*.json', ' Autodesk.autolispext*.vsix']);
}

const internalCompileTask = function () {
	return doCompile(false);
};

const internalNlsCompileTask = function () {
	return doCompile(true);
};

const addI18nTask = function () {
	return src(['package.nls.json'])
		.pipe(createAdditionalLanguageFiles(languages, 'i18n'))
		.pipe(dest('.'));
};

const buildTask = series(cleanTask, internalNlsCompileTask, addI18nTask);

const doCompile = function (buildNls) {
	var r = tsProject.src()
		.pipe(init())
		.pipe(tsProject()).js
		.pipe(buildNls ? rewriteLocalizeCalls() : through())
		.pipe(buildNls ? createAdditionalLanguageFiles(languages, 'i18n', 'out') : through());

	if (inlineMap && inlineSource) {
		r = r.pipe(write());
	} else {
		r = r.pipe(write("../out", {
			// no inlined source
			includeContent: inlineSource,
			// Return relative source map root directories per file.
			sourceRoot: "../src"
		}));
	}

	return r.pipe(dest(outDest));
}

const vscePublishTask = function () {
	return publish();
};

const vscePackageTask = function () {
	return createVSIX();
};

task('default', buildTask);

task('clean', cleanTask);

task('compile', series(cleanTask, internalCompileTask));

task('build', buildTask);

task('publish', series(vscePublishTask));

task('package', series(vscePackageTask));