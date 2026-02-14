import * as vscode from 'vscode';
import { LispFormatter } from './formatter'
import * as utils from "../utils"
import * as nls from 'vscode-nls';
const localize = nls.config({ messageFormat: nls.MessageFormat.file })();

export function registerDocumentFormatter() {
	vscode.languages.registerDocumentFormattingEditProvider(['autolisp', 'lisp'], {
		//eslint-disable-next-line
		provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
			const activeTextEditor = vscode.window.activeTextEditor;
			if (activeTextEditor == undefined)
				return [];
			const currentLSPDoc = activeTextEditor.document.fileName;
			const ext = currentLSPDoc.substring(currentLSPDoc.length - 4, currentLSPDoc.length).toUpperCase();
			if (ext === ".DCL") {
				const msg = localize("autolispext.format.notsupport.dcl", "Command doesn't support DCL files.");
				vscode.window.showInformationMessage(msg);
				return [];
			}

			const fmt = LispFormatter.format(activeTextEditor.document, null);
			return [vscode.TextEdit.replace(utils.getFullDocRange(activeTextEditor), fmt)];
		}
	});
}

export function registeSelectionFormatter() {
	vscode.languages.registerDocumentRangeFormattingEditProvider(['autolisp', 'lisp'], {
		//eslint-disable-next-line
		provideDocumentRangeFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
			const activeTextEditor = vscode.window.activeTextEditor;
			if (activeTextEditor == undefined)
				return [];
			const currentLSPDoc = activeTextEditor.document.fileName;
			const ext = currentLSPDoc.substring(currentLSPDoc.length - 4, currentLSPDoc.length).toUpperCase();
			if (ext === ".DCL") {
				const msg = localize("autolispext.format.notsupport.dcl", "Command doesn't support DCL files.");
				vscode.window.showInformationMessage(msg);
				return [];
			}
			if (activeTextEditor.selection.isEmpty) {
				const msg = localize("autolispext.format.selectionlines", "First, select the lines of code to format.");
				vscode.window.showInformationMessage(msg);
			}

			const fmt = LispFormatter.format(activeTextEditor.document, activeTextEditor.selection);
			return [vscode.TextEdit.replace(utils.getSelectedDocRange(activeTextEditor), fmt)];
		}
	});
}