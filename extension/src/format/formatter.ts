import * as vscode from 'vscode';

import { Sexpression } from '../astObjects/sexpression';
import { LispParser } from "../parsing/lispParser";
import * as nls from 'vscode-nls';
const localize = nls.config({ messageFormat: nls.MessageFormat.file })();

export class LispFormatter {

	public static format(document: vscode.TextDocument, selectedRange: vscode.Selection): string {
		let textString: string = "";
		let selectionStartOffset = 0;//the position in the whole doc of the first char of the text selected to format

		let fileParser: LispParser = undefined;

		if (selectedRange != null) {
			textString = document.getText(selectedRange);
			selectionStartOffset = document.offsetAt(selectedRange.start);

			fileParser = new LispParser(document);
		}
		else {
			textString = document.getText();
		}
		if (textString.length == 0)
			return "";

		try {
			const parser = new LispParser(document);
			parser.tokenizeString(textString, selectionStartOffset);
			if (fileParser)
				fileParser.tokenizeString(document.getText(), 0);

			return this.formatGut(document, parser, textString, fileParser);
		} catch (e) {
			vscode.window.showErrorMessage(e.message);
			return textString;
		}
	}

	private static formatGut(document: vscode.TextDocument, parser: LispParser, origCopy: string, fileParser?: LispParser): string {
		const atoms = parser.atomsForest;
		if (atoms.length == 0)
			return origCopy;

		let formattedstring = "";
		const linefeed = LispParser.getEOL(document);
		for (let i = 0; i < atoms.length; i++) {
			if (atoms[i] instanceof Sexpression) {
				const lispLists = atoms[i] as Sexpression;

				const firstAtom = lispLists.atoms[0];
				let isTopLevelAtom = true;
				if (fileParser)
					isTopLevelAtom = fileParser.isTopLevelAtom(firstAtom.line, firstAtom.column);

				let startColumn = firstAtom.column;
				if (isTopLevelAtom)
					startColumn = 0;

				const formatstr = lispLists.formatting(startColumn, linefeed);
				if (formatstr.length == 0) {
					const msg = localize("autolispext.formatter.errors", "It meets some errors when formatting");
					throw new Error(msg);
				}

				if (isTopLevelAtom && formattedstring.length > 0) {
					const lastCh = formattedstring.substring(-1);
					if (lastCh != "\n") {
						formattedstring = formattedstring.trimEnd();
						if (formattedstring != linefeed && formattedstring.length > 0)
							formattedstring += linefeed;
					}
				}

				formattedstring += formatstr;
			} else {
				// This branch maybe comment, spaces, line breaks or alone atoms
				formattedstring += atoms[i].toString();
			}
		}
		return formattedstring;
	}
}
