import * as path from 'path';
import { TextDocument } from 'vscode';
import { ReadonlyDocument } from '../../project/readOnlyDocument';
import { assert } from 'chai';
const prefixpath = __filename + "/../../../../extension/src/test/SourceFile/test_case/";
const lispFileTest = path.join(prefixpath + "pdfMarkups.lsp");


suite("ReadonlyDocument Tests", function () {
	let doc: ReadonlyDocument;
	test("Creating with: open()", function () {
		try {
			doc = ReadonlyDocument.open(lispFileTest);
			assert.equal(doc.languageId, 'autolisp');
		}
		catch (err) {
			assert.fail(`Could not create document ${err}`);
		}
	});


	test("Creating with: getMemoryDocument()", function () {
		try {
			doc = ReadonlyDocument.getMemoryDocument(doc as TextDocument);
			assert.equal(doc.languageId, 'autolisp');
		}
		catch (err) {
			assert.fail(`Could not create document ${err}`);
		}
	});


	test("Creating with: createMemoryDocument()", function () {
		try {
			doc = ReadonlyDocument.createMemoryDocument(doc.getText(), 'autolisp');
			assert.notEqual(doc.lines.length, 0);
			doc.fileName = lispFileTest;
		}
		catch (err) {
			assert.fail(`Could not create document ${err}`);
		}
	});


	test("Generating: atomsForest", function () {
		try {
			assert.notEqual(doc.documentContainer.atoms.length, 0);
		}
		catch (err) {
			assert.fail(`Could not get atomsForest value ${err}`);
		}
	});
});


