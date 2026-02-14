//
// acadPicker.ts
//
// CREATED BY:  yunjian.zhang               DECEMBER. 2018
//
// DESCRIPTION: Lisp vscode extension core code.
//
'use strict';

import * as vscode from 'vscode';
import * as os from 'os';
import { basename } from 'path';
import { getProcesses } from './processTree';
import { ProcessPathCache } from "./processCache";
import { calculateACADProcessName } from '../platform';
import { acitiveDocHasValidLanguageId } from '../utils';


import * as nls from 'vscode-nls';
const localize = nls.config({ messageFormat: nls.MessageFormat.file })();
interface ProcessItem extends vscode.QuickPickItem {
	pidOrPort: string;
	sortKey: number;
}

function getProcesspickerPlaceHolderStr() {
	const platform = os.type();
	if (platform === 'Windows_NT') {
		return localize('autolispext.pickprocess.acad.win', "Pick the process to attach. Make sure AutoCAD, or one of the specialized toolsets, is running. Type acad and select it from the list.");
	} else if (platform === 'Darwin') {
		return localize('autolispext.pickprocess.acad.osx', "Pick the process to attach. Make sure AutoCAD is running. Type AutoCAD and select it from the list.");
	} else {
		return localize('autolispext.pickprocess.acad.other', "Pick the process to attach");
	}
}

/**
 * Process picker command (for launch config variable)
 */
export function pickProcess(defaultPid: number): Promise<string | null> {

	return listProcesses().then(items => {
		const options: vscode.QuickPickOptions = {
			placeHolder: getProcesspickerPlaceHolderStr(),
			matchOnDescription: true,
			matchOnDetail: true
		};
		if (defaultPid > 0) {
			const foundItem = items.find(x => {
				return x.pidOrPort === defaultPid.toString();
			});
			if (foundItem)
				return foundItem.pidOrPort;
		}

		const choosedItem = vscode.window.showQuickPick(items, options).then(item => item ? item.pidOrPort : null);
		return choosedItem;
	}).catch(err => {
		const chooseItem = vscode.window.showErrorMessage(localize('autolispext.pickprocess.pickfailed', "Process picker failed ({0})", err.message), { modal: true }).then();
		return chooseItem;
	});
}

//---- private
function listProcesses(): Promise<ProcessItem[]> {

	const items: ProcessItem[] = [];

	let seq = 0;	// default sort key

	return getProcesses((pid: number, ppid: number, command: string, args: string, executablePath: string,
		date?: number, title?: string) => {
		let processName = "";	// debugger's process name

		if (ProcessPathCache.globalAcadNameInUserAttachConfig) {
			processName = ProcessPathCache.globalAcadNameInUserAttachConfig;
		}
		else if (vscode.window.activeTextEditor && acitiveDocHasValidLanguageId()) {
			//read attach configuration from launch.json
			const configurations: [] = vscode.workspace.getConfiguration("launch", vscode.window.activeTextEditor.document.uri).get("configurations");
			let attachLispConfig;
			configurations.forEach(function (item) {
				if (item["type"] === "attachlisp") {
					attachLispConfig = item;
				}
			});
			if (attachLispConfig && attachLispConfig["attributes"]) {
				processName = attachLispConfig["attributes"]["process"] ? attachLispConfig["attributes"]["process"] : "";
			}
		}

		const ProcessFilter = new RegExp('^(?:' + calculateACADProcessName(processName) + '|iojs)$', 'i');;

		if (process.platform === 'win32' && executablePath.indexOf('\\??\\') === 0) {
			// remove leading device specifier
			executablePath = executablePath.replace('\\??\\', '');
		}

		const executable_name = basename(executablePath, '.exe');

		const port = -1;
		const protocol: string | undefined = '';
		const usePort = false;

		let description = '';
		let pidOrPort = '';

		let titleField = '';

		if (title)
			titleField = title;
		else
			titleField = basename(executablePath, '.exe');

		if (usePort) {
			if (protocol === 'inspector') {
				description = localize('autolispext.pickprocess.process.id.port', "process id: {0}, debug port: {1}", pid, port);
			} else {
				description = localize('autolispext.pickprocess.process.id.legacy', "process id: {0}, debug port: {1} (legacy protocol)", pid, port);
			}
			pidOrPort = `${protocol}${port}`;
		} else {
			if (protocol && port > 0) {
				description = localize('autolispext.pickprocess.process.port.singal', "process id: {0}, debug port: {1} ({2})", pid, port, 'SIGUSR1');
				pidOrPort = `${pid}${protocol}${port}`;
			} else {
				// no port given
				let addintolist = false;

				if (ProcessFilter) {
					if (ProcessFilter.test(executable_name)) {
						addintolist = true;
					}
				} else {
					addintolist = true;
				}

				if (addintolist) {
					ProcessPathCache.addGlobalProductProcessPathArr(executablePath, pid);
					description = localize('autolispext.pickprocess.process.id.singal', "process id: {0} ({1})", pid, 'SIGUSR1');
					pidOrPort = pid.toString();
				}
			}
		}

		if (description && pidOrPort) {
			items.push({
				// render data
				label: titleField,
				description: args,
				detail: description,

				// picker result
				pidOrPort: pidOrPort,
				// sort key
				sortKey: date ? date : seq++
			});
		}

	}).then(() => items.sort((a, b) => b.sortKey - a.sortKey));		// sort items by process id, newest first
}

