import { SearchOption } from './options';
import { FindingNode } from './searchTree';
import { getDocument } from '../../utils';
import * as vscode from 'vscode';
import * as fs from 'fs';
import { ReadonlyDocument } from '../readOnlyDocument';
import * as nls from 'vscode-nls';
const localize = nls.config({ messageFormat: nls.MessageFormat.file })();

export async function openSearchResult(clickedTreeItem: FindingNode, searchOpt: SearchOption) {

	try {
		const isSingleResult = clickedTreeItem instanceof FindingNode;
		if (!isSingleResult)
			return;

		const finding = clickedTreeItem as FindingNode;
		const exists = fs.existsSync(finding.filePath);

		if (exists == false) {
			const msg = localize("autolispext.project.findreplace.opensearchresult.filenotexist", "File doesn't exist: ");
			return Promise.reject(msg + finding.filePath);
		}

		const line = finding.line - 1; //rp line starts with 1 but vscode starts with 0
		const col = finding.column - 1;

		let textLen = 0;
		if (searchOpt.isReplace == false) {
			textLen = searchOpt.keyword.length;
			if (searchOpt.useRegularExpr) {
				//it's a finding with regular expression; need to get the matched text to work out the length
				let reg: RegExp;
				if (searchOpt.matchCase) {
					reg = new RegExp(searchOpt.keyword);
				} else {
					reg = new RegExp(searchOpt.keyword, 'i');
				}
				const matches = reg.exec(finding.text);
				if (matches.length <= 0) {
					console.log("Can't determine keyword length with regular expression enabled.");
				} else {
					textLen = matches[0].length;
				}
			}
		}
		else {
			textLen = searchOpt.replacement.length;
		}

		// get document of the file or open the file if it's not opened
		let doc = getDocument(finding.filePath);
		if (!doc) {
			doc = ReadonlyDocument.open(finding.filePath);
			if (!doc) {
				const msg = localize("autolispext.project.findreplace.opensearchresult.openfailed", "File couldn't be opened: ");
				return Promise.reject(msg + finding.filePath);
			}
		}

		// get text inside the searched range of the document and don't select the range if the text is changed since last search
		const start = new vscode.Position(line, col);
		const end = new vscode.Position(line, col + textLen);
		let range = new vscode.Range(start, end);
		const text = doc.getText(range);
		const textFound = finding.text.substring(col, textLen)
		if (text != textFound) {
			range = range.with(start, start);
		}

		const opt = { "selection": range, "preserveFocus": true };
		return vscode.commands.executeCommand("vscode.open",
			vscode.Uri.file(finding.filePath),
			opt);
	}
	catch (e) {
		return Promise.reject(e);
	}
}
