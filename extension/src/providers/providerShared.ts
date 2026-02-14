import { ReadonlyDocument } from '../project/readOnlyDocument';
import * as vscode from 'vscode';
import { ILispFragment } from '../astObjects/ILispFragment';

export const SearchPatterns = {
	LOCALIZES: /^DEFUN$|^DEFUN-Q$|^LAMBDA$/i,
	ITERATES: /^FOREACH$|^VLAX-FOR$/i,
	ASSIGNS: /^SETQ$/i,
	DEFINES: /^DEFUN$|^DEFUN-Q$/i,
	ALL: /^DEFUN$|^DEFUN-Q$|^LAMBDA$|^FOREACH$|^VLAX-FOR$|^SETQ$/i,
}


export const SharedAtomic = {
	getNonPrimitiveAtomFromPosition(roDoc: ReadonlyDocument, pos: vscode.Position): ILispFragment {
		const atom = roDoc.documentContainer?.getAtomFromPos(pos);
		if (!atom || atom.isPrimitive()) {
			return null;
		}
		return atom;
	}
}