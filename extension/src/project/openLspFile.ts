import * as vscode from 'vscode'
import { DisplayNode, LspFileNode, ProjectTreeProvider } from './projectTree'
import * as fs from 'fs'
import * as nls from 'vscode-nls';

const localize = nls.config({ messageFormat: nls.MessageFormat.file })();

export async function openLspFile(clickedTreeItem: DisplayNode) {

	try {
		const isLspFile = clickedTreeItem instanceof LspFileNode;
		if (!isLspFile)
			return;

		const lspNode = clickedTreeItem as LspFileNode;
		const exists = fs.existsSync(lspNode.filePath);
		if (exists != lspNode.fileExists) {
			ProjectTreeProvider.instance().refreshData(clickedTreeItem);
		}

		if (exists == false) {
			const msg = localize("autolispext.project.openlspfile.filenotexist", "File doesn't exist: ");
			return Promise.reject(msg + lspNode.filePath);
		}

		const options = { "preview": false, "preserveFocus": true };

		return vscode.commands.executeCommand("vscode.open", vscode.Uri.file(lspNode.filePath), options);
	}
	catch (e) {
		return Promise.reject(e);
	}
}
