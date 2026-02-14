import * as vscode from 'vscode';
import * as os from 'os';
import { isCursorInDoubleQuoteExpr } from "../format/autoIndent";
import { AutoLispExt } from "../context";


export function isInternalAutoLispOp(item: string): boolean {
	if (!item)
		return false;

	for (let i = 0; i < AutoLispExt.Resources.internalLispFuncs.length; i++) {
		if (AutoLispExt.Resources.internalLispFuncs[i] === item)
			return true;
	}
	return false;
}


export function getCmdAndVarsCompletionCandidates(allCandiates: string[], word: string, userInputIsUpper: boolean): Array<vscode.CompletionItem> {
	let hasUnderline = false;
	if (word[0] == "_") {
		hasUnderline = true;
		word = word.substring(1);
	}

	let hasDash = false;
	if (word[0] == "-") {
		hasDash = true;
	}

	const suggestions: Array<vscode.CompletionItem> = [];
	allCandiates.forEach((item) => {
		let candidate = item;
		if (userInputIsUpper)
			candidate = item.toUpperCase();
		else
			candidate = item.toLowerCase();

		if (candidate.startsWith(word)) {
			let label = candidate;

			// The _ symbol has special mean in AutoCAD commands, so we add the prefix if it matches the command name
			if (hasUnderline)
				label = "_" + label;

			const completion = new vscode.CompletionItem(label);

			// to work around the middle dash case issue in vscode, when insert it ignores the dash
			if (hasDash)
				completion.insertText = label.substring(1);

			suggestions.push(completion);
		}
	});

	return suggestions;
}

function getCompletionCandidates(allCandiates: string[], word: string, userInputIsUpper: boolean): Array<vscode.CompletionItem> {
	const suggestions: Array<vscode.CompletionItem> = [];
	allCandiates.forEach((item) => {
		let candidate = item;
		if (userInputIsUpper)
			candidate = item.toUpperCase();
		else
			candidate = item.toLowerCase();

		if (candidate.startsWith(word)) {
			const label = candidate;
			const completion = new vscode.CompletionItem(label);
			suggestions.push(completion);
		}
	});

	return suggestions;
}

export function getMatchingWord(document: vscode.TextDocument, position: vscode.Position): [string, boolean] {
	const linetext = document.lineAt(position).text;

	let word = document.getText(document.getWordRangeAtPosition(position));
	const wordSep = " &#^()[]|;'\".";

	// Autolisp has special word range rules and now VScode has some issues to check the "word" range, 
	// so it needs this logic to check the REAL word range
	let pos = position.character;
	pos -= 2;
	let length = 1;
	let hasSetLen = false;
	for (; pos >= 0; pos--) {
		const ch = linetext.charAt(pos);
		if (wordSep.includes(ch)) {
			if (!hasSetLen)
				length = word.length;
			word = linetext.substring(pos + 1, length);
			break;
		}
		length++;
		hasSetLen = true;
	}

	const isupper = () => {
		const lastCh = word.slice(-1);
		const upper = lastCh.toUpperCase();
		if (upper != lastCh.toLowerCase() && upper == lastCh)
			return true;
		return false;
	}
	const inputIsUpper = isupper();
	if (inputIsUpper)
		word = word.toUpperCase();
	else word = word.toLowerCase();

	return [word, inputIsUpper];
}

export function getLispAndDclCompletions(document: vscode.TextDocument, word: string, isupper: boolean): vscode.CompletionItem[] {
	const currentLSPDoc = document.fileName;
	const ext = currentLSPDoc.substring(currentLSPDoc.length - 4, currentLSPDoc.length).toUpperCase();
	let candidatesItems = AutoLispExt.Resources.internalLispFuncs;
	if (ext === ".DCL") {
		candidatesItems = AutoLispExt.Resources.internalDclKeys;
	}
	let allSuggestions: Array<vscode.CompletionItem> = [];
	allSuggestions = getCompletionCandidates(candidatesItems, word, isupper);

	if (os.platform() === "win32") {
		return allSuggestions;
	}
	else {
		return allSuggestions.filter(function (suggestion) {
			for (const prefix of AutoLispExt.Resources.winOnlyListFuncPrefix) {
				if (suggestion.label.toString().startsWith(prefix)) {
					return false;
				}
			}
			return true;
		});
	}
}

export function registerAutoCompletionProviders() {
	vscode.languages.registerCompletionItemProvider(['autolisp', 'lsp', 'autolispdcl'], {
		//eslint-disable-next-line @typescript-eslint/no-unused-vars
		provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {

			try {
				const linetext = document.lineAt(position).text;
				if ((linetext.startsWith(";") || linetext.startsWith(";;")
					|| linetext.startsWith("#|")) && !token.isCancellationRequested) {
					return [];
				}

				const [inputword, userInputIsUpper] = getMatchingWord(document, position);
				if (inputword.length == 0 && !token.isCancellationRequested)
					return [];

				const isInDoubleQuote = isCursorInDoubleQuoteExpr(document, position);
				if (isInDoubleQuote && !token.isCancellationRequested) {
					const cmds = getCmdAndVarsCompletionCandidates(AutoLispExt.Resources.allCmdsAndSysvars, inputword, userInputIsUpper);
					return cmds;
				}

				return getLispAndDclCompletions(document, inputword, userInputIsUpper);
			}
			catch (err) {
				console.error(err)
				return [];
			}
		}
	});
}