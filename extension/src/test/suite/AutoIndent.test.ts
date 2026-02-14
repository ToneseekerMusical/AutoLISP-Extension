import * as chai from "chai";
import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { findContainers, getIndentation, isCursorInDoubleQuoteExpr } from "../../format/autoIndent";
import { ReadonlyDocument } from "../../project/readOnlyDocument";
const assert: Chai.Assert = chai.assert;
const testDir = path.join(__dirname + "/../../../extension/src/test");
const outputDir = path.join(testDir + "/OutputFile");
const indentTestFile = path.join(testDir + "/SourceFile/autoIndentTestFile.lsp");
const newIndentTestFile = path.join(outputDir + "/newAutoIndentTestFile.lsp");
let indentTestDoc: vscode.TextDocument;
fs.mkdir(outputDir, { recursive: true }, (err) => {
	if (err) {
		return console.error(err);
	}
});

suite("Autoindent Tests", function () {
	// Autoindent is used for input in the vscode editor
	// Doesn't include the case that press enter insider brackets since
	// the limitation of the unit test
	// In the client the OnTypeFormattingEdit is trigged after enter so the cursor position is from new line.
	test("Autoindent for defun enter should have 2 indentation", function () {
		const fn = "defun enter";
		try {
			const cursorPos2d = new vscode.Position(0, 28);
			replaceDocWithEnter(indentTestFile, cursorPos2d);
			const lineIndentSpace = getIndent(indentTestDoc, cursorPos2d);
			console.log("lineIndentSpace: ", lineIndentSpace)
			assert.isTrue(lineIndentSpace == 2);
		} catch (err) {
			assert.fail(`Autoindent test for ${fn} failed\n${err}`);
		}
	});

	test("Autoindent for setq enter should have 2 indentation", function () {
		const fn = "setq enter";
		try {
			const cursorPos2d = new vscode.Position(1, 13);
			replaceDocWithEnter(indentTestFile, cursorPos2d);
			const lineIndentSpace = getIndent(indentTestDoc, cursorPos2d);
			console.log("lineIndentSpace: ", lineIndentSpace)
			// let containerParens: ElementRange = containerElement.containerParens[0];
			assert.isTrue(lineIndentSpace == 2);
		} catch (err) {
			assert.fail(`Autoindent test for ${fn} failed\n${err}`);
		}
	});

	test("Autoindent for cons enter should have 14 indentation", function () {
		const fn = "cons enter";
		try {
			const cursorPos2d = new vscode.Position(12, 36);
			replaceDocWithEnter(indentTestFile, cursorPos2d);
			const lineIndentSpace = getIndent(indentTestDoc, cursorPos2d);
			console.log("lineIndentSpace: ", lineIndentSpace)
			assert.isTrue(lineIndentSpace == 14);
		} catch (err) {
			assert.fail(`Autoindent test for ${fn} failed\n${err}`);
		}
	});

	test("Autoindent for mapcar enter should have 14 indentation", function () {
		const fn = "mapcar enter";
		try {
			const cursorPos2d = new vscode.Position(7, 20);
			replaceDocWithEnter(indentTestFile, cursorPos2d);
			const lineIndentSpace = getIndent(indentTestDoc, cursorPos2d);
			console.log("lineIndentSpace: ", lineIndentSpace)
			assert.isTrue(lineIndentSpace == 14);
		} catch (err) {
			assert.fail(`Autoindent test for ${fn} failed\n${err}`);
		}
	});

	test("Autoindent for reverse enter should have 18 indentation", function () {
		const fn = "reverse enter";
		try {
			const cursorPos2d = new vscode.Position(6, 25);
			replaceDocWithEnter(indentTestFile, cursorPos2d);
			const lineIndentSpace = getIndent(indentTestDoc, cursorPos2d);
			console.log("lineIndentSpace: ", lineIndentSpace)
			assert.isTrue(lineIndentSpace == 18);
		} catch (err) {
			assert.fail(`Autoindent test for ${fn} failed\n${err}`);
		}
	});

	test("Autoindent for lambda enter should have 17 indentation", function () {
		const fn = "lambda enter";
		try {
			const cursorPos2d = new vscode.Position(8, 30);
			replaceDocWithEnter(indentTestFile, cursorPos2d);
			const lineIndentSpace = getIndent(indentTestDoc, cursorPos2d);
			console.log("lineIndentSpace: ", lineIndentSpace)
			assert.isTrue(lineIndentSpace == 17);
		} catch (err) {
			assert.fail(`Autoindent test for ${fn} failed\n${err}`);
		}
	});

	test("Autoindent for while enter should have 2 indentation", function () {
		const fn = "while enter";
		try {
			const cursorPos2d = new vscode.Position(16, 25);
			replaceDocWithEnter(indentTestFile, cursorPos2d);
			const lineIndentSpace = getIndent(indentTestDoc, cursorPos2d);
			console.log("lineIndentSpace: ", lineIndentSpace)
			assert.isTrue(lineIndentSpace == 2);
		} catch (err) {
			assert.fail(`Autoindent test for ${fn} failed\n${err}`);
		}
	});

	test("Autoindent for repeat enter should have 6 indentation", function () {
		const fn = "repeat enter";
		try {
			const cursorPos2d = new vscode.Position(17, 14);
			replaceDocWithEnter(indentTestFile, cursorPos2d);
			const lineIndentSpace = getIndent(indentTestDoc, cursorPos2d);
			console.log("lineIndentSpace: ", lineIndentSpace)
			assert.isTrue(lineIndentSpace == 6);
		} catch (err) {
			assert.fail(`Autoindent test for ${fn} failed\n${err}`);
		}
	});

	test("Autoindent for foreach enter should have 6 indentation", function () {
		const fn = "foreach enter";
		try {
			const cursorPos2d = new vscode.Position(21, 19);
			replaceDocWithEnter(indentTestFile, cursorPos2d);
			const lineIndentSpace = getIndent(indentTestDoc, cursorPos2d);
			console.log("lineIndentSpace: ", lineIndentSpace)
			assert.isTrue(lineIndentSpace == 6);
		} catch (err) {
			assert.fail(`Autoindent test for ${fn} failed\n${err}`);
		}
	});

	test("Autoindent for if enter should have 6 indentation", function () {
		const fn = "if enter";
		try {
			const cursorPos2d = new vscode.Position(22, 18);
			replaceDocWithEnter(indentTestFile, cursorPos2d);
			const lineIndentSpace = getIndent(indentTestDoc, cursorPos2d);
			console.log("lineIndentSpace: ", lineIndentSpace)
			assert.isTrue(lineIndentSpace == 6);
		} catch (err) {
			assert.fail(`Autoindent test for ${fn} failed\n${err}`);
		}
	});

	test("Autoindent for progn enter should have 12 indentation", function () {
		const fn = "progn enter";
		try {
			const cursorPos2d = new vscode.Position(25, 17);
			replaceDocWithEnter(indentTestFile, cursorPos2d);
			const lineIndentSpace = getIndent(indentTestDoc, cursorPos2d);
			console.log("lineIndentSpace: ", lineIndentSpace)
			assert.isTrue(lineIndentSpace == 12);
		} catch (err) {
			assert.fail(`Autoindent test for ${fn} failed\n${err}`);
		}
	});

	test("Autoindent for cond enter should have 4 indentation", function () {
		const fn = "cond enter";
		try {
			const cursorPos2d = new vscode.Position(33, 8);
			replaceDocWithEnter(indentTestFile, cursorPos2d);
			const lineIndentSpace = getIndent(indentTestDoc, cursorPos2d);
			console.log("lineIndentSpace: ", lineIndentSpace)
			assert.isTrue(lineIndentSpace == 4);
		} catch (err) {
			assert.fail(`Autoindent test for ${fn} failed\n${err}`);
		}
	});

	test("Autoindent for cursor insider quotes enter return true", function () {
		const fn = "cursor insider quotes";
		try {
			const cursorPos2d = new vscode.Position(34, 50);
			replaceDocWithEnter(indentTestFile, cursorPos2d);
			const isInDoubleQuote = isCursorInDoubleQuoteExpr(indentTestDoc, cursorPos2d);
			assert.isTrue(isInDoubleQuote == true);
		} catch (err) {
			assert.fail(`Autoindent test for ${fn} failed\n${err}`);
		}
	});

	test("Autoindent for block comment enter should have 5 indentation", function () {
		const fn = "block comment enter";
		try {
			const cursorPos2d = new vscode.Position(39, 35);
			replaceDocWithEnter(indentTestFile, cursorPos2d);
			const lineIndentSpace = getIndent(indentTestDoc, cursorPos2d);
			assert.isTrue(lineIndentSpace == 5);
		} catch (err) {
			assert.fail(`Autoindent test for ${fn} failed\n${err}`);
		}
	});

	test("Autoindent for emtpy line enter should have 2 indentation", function () {
		const fn = "emtpy line enter";
		try {
			const cursorPos2d = new vscode.Position(20, 2);
			replaceDocWithEnter(indentTestFile, cursorPos2d);
			const lineIndentSpace = getIndent(indentTestDoc, cursorPos2d);
			console.log("lineIndentSpace: ", lineIndentSpace)
			assert.isTrue(lineIndentSpace == 2);
		} catch (err) {
			assert.fail(`Autoindent test for ${fn} failed\n${err}`);
		}
	});

	test("Autoindent for NO operator enter should have 1 indentation", function () {
		const fn = "NO operator enter";
		try {
			const cursorPos2d = new vscode.Position(43, 1);
			replaceDocWithEnter(indentTestFile, cursorPos2d);
			const lineIndentSpace = getIndent(indentTestDoc, cursorPos2d);
			assert.isTrue(lineIndentSpace == 1);
		} catch (err) {
			assert.fail(`Autoindent test for ${fn} failed\n${err}`);
		}
	});

	test("Autoindent for list quote enter should have 10 indentation", function () {
		const fn = "list quote enter";
		try {
			const cursorPos2d = new vscode.Position(47, 11);
			replaceDocWithEnter(indentTestFile, cursorPos2d);
			const lineIndentSpace = getIndent(indentTestDoc, cursorPos2d);
			assert.isTrue(lineIndentSpace == 10);
		} catch (err) {
			assert.fail(`Autoindent test for ${fn} failed\n${err}`);
		}
	});

	test("Autoindent for multiple setq enter should have 6 indentation", function () {
		const fn = "multiple setq enter";
		try {
			const cursorPos2d = new vscode.Position(49, 9);
			replaceDocWithEnter(indentTestFile, cursorPos2d);
			const lineIndentSpace = getIndent(indentTestDoc, cursorPos2d);
			assert.isTrue(lineIndentSpace == 6);
		} catch (err) {
			assert.fail(`Autoindent test for ${fn} failed\n${err}`);
		}
	});

	test("Autoindent for text with tab enter should have 10 indentation", function () {
		const fn = "text with tab enter";
		try {
			const cursorPos2d = new vscode.Position(52, 34);
			replaceDocWithEnter(indentTestFile, cursorPos2d);
			const lineIndentSpace = getIndent(indentTestDoc, cursorPos2d);
			assert.isTrue(lineIndentSpace == 10);
		} catch (err) {
			assert.fail(`Autoindent test for ${fn} failed\n${err}`);
		}
	});

	test("Autoindent for after defun before fun name enter should have 7 indentation", function () {
		const fn = "after defun before fun name enter";
		try {
			const cursorPos2d = new vscode.Position(54, 7);
			replaceDocWithEnter(indentTestFile, cursorPos2d);
			const lineIndentSpace = getIndent(indentTestDoc, cursorPos2d);
			assert.isTrue(lineIndentSpace == 7);
		} catch (err) {
			assert.fail(`Autoindent test for ${fn} failed\n${err}`);
		}
	});

	test("Autoindent for after fun name before argment enter should have 7 indentation", function () {
		const fn = "after fun name before argment enter";
		try {
			const cursorPos2d = new vscode.Position(55, 11);
			replaceDocWithEnter(indentTestFile, cursorPos2d);
			const lineIndentSpace = getIndent(indentTestDoc, cursorPos2d);
			assert.isTrue(lineIndentSpace == 7);
		} catch (err) {
			assert.fail(`Autoindent test for ${fn} failed\n${err}`);
		}
	});

	test("Autoindent for after fun name missing argument enter should have 7 indentation", function () {
		const fn = "after fun name missing argument enter";
		try {
			const cursorPos2d = new vscode.Position(56, 11);
			replaceDocWithEnter(indentTestFile, cursorPos2d);
			const lineIndentSpace = getIndent(indentTestDoc, cursorPos2d);
			assert.isTrue(lineIndentSpace == 7);
		} catch (err) {
			assert.fail(`Autoindent test for ${fn} failed\n${err}`);
		}
	});

	test("Autoindent for inside cons enter should have 23 indentation", function () {
		const fn = "inside cons enter";
		try {
			const cursorPos2d = new vscode.Position(9, 31);
			replaceDocWithEnter(indentTestFile, cursorPos2d);
			const lineIndentSpace = getIndent(indentTestDoc, cursorPos2d);
			assert.isTrue(lineIndentSpace == 23);
		} catch (err) {
			assert.fail(`Autoindent test for ${fn} failed\n${err}`);
		}
	});

	function replaceDocWithEnter(filepath: string, cursorPos2d: vscode.Position) {
		const doc = ReadonlyDocument.open(filepath);
		const startPt = new vscode.Position(0, 0);
		const selRange = new vscode.Selection(startPt, cursorPos2d);
		//insert \n to cursor position
		const newText = doc.getText().replace(doc.getText(selRange), doc.getText(selRange) + "\n");
		try {
			fs.writeFileSync(newIndentTestFile, newText);
			indentTestDoc = ReadonlyDocument.open(newIndentTestFile);
		} catch (error) {
			console.log(error);
		}
	}
	function getIndent(doc: vscode.TextDocument, cursorPos2d: vscode.Position) {
		try {
			const containerElement = findContainers(doc, cursorPos2d);
			const lineIndentSpace = getIndentation(doc, containerElement, cursorPos2d);
			return lineIndentSpace.length;
		} catch (error) {
			console.log(error);
		}
	}
});
