//
'use strict';
import * as vscode from 'vscode';
import { acitiveDocHasValidLanguageId } from './utils'
import { setDefaultAcadPid } from "./debug"
import * as nls from 'vscode-nls';
const localize = nls.config({ messageFormat: nls.MessageFormat.file })();

function getUrlParams(queryString) {
	const hashes = queryString.split('&')
	return hashes.reduce((params, hash) => {
		const [key, val] = hash.split('=')
		return Object.assign(params, { [key]: decodeURIComponent(val) })
	}, {})
}

const modalMsgOption = { modal: true };
export function onUriRequested(uri: vscode.Uri) {
	const qs = getUrlParams(uri.query);

	const pidStr = qs["pid"];
	if (pidStr === undefined) {
		const msg = localize("autolispext.urihandler.invaid", "Invalid call to AutoCAD AutoLISP Extension.");
		vscode.window.showInformationMessage(msg);
		return;
	}

	setDefaultAcadPid(parseInt(pidStr));

	if (vscode.debug.activeDebugSession) {
		const msg = localize("autolispext.urihandler.activeddebugcfg", "Current debug configuration: ");
		vscode.window.showInformationMessage(msg + vscode.debug.activeDebugSession.name,
			modalMsgOption);
		return;
	}

	if (vscode.window.activeTextEditor) {
		if (acitiveDocHasValidLanguageId()) {
			const msg = localize("autolispext.urihandler.debug.start",
				"From the menu bar, click Run > Start Debugging to debug the current AutoLISP source file.");
			vscode.window.showInformationMessage(msg, modalMsgOption);
		}
		else {
			const msg = localize("autolispext.urihandler.debug.openfile",
				"Open an AutoLISP source file and click Run > Start Debugging from the menu bar to debug the file.");
			vscode.window.showInformationMessage(msg, modalMsgOption);
		}

		return;
	}

	const msg = localize("autolispext.urihandler.debug.openfile",
		"Open an AutoLISP source file and click Run > Start Debugging from the menu bar to debug the file.");
	vscode.window.showInformationMessage(msg, modalMsgOption);

	return;

}
