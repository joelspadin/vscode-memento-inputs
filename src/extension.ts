import * as vscode from 'vscode';

interface CommonArgs {
	id: string;
	description: string;
	default: string;
}

interface PickStringArgs extends CommonArgs {
	options: string[];
}

interface PromptStringArgs extends CommonArgs {
	placeholder?: string;
}

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.Disposable.from(
		vscode.commands.registerCommand('memento.pickString', pickString),
		vscode.commands.registerCommand('memento.promptString', promptString),
		vscode.commands.registerCommand('memento.rememberString', rememberString)
	);

	context.subscriptions.push(disposable);

	function getDefault(args: CommonArgs) {
		return context.workspaceState.get<string>(args.id, args.default);
	}

	async function setDefault(args: CommonArgs, value: string) {
		await context.workspaceState.update(args.id, value);
	}

	async function pickString(args: PickStringArgs) {
		const result = await showQuickPickDefault({
			title: args.description,
			items: args.options,
			value: getDefault(args),
		});

		if (result !== undefined) {
			await setDefault(args, result);
		}

		return result;
	}

	async function promptString(args: PromptStringArgs) {
		const result = await vscode.window.showInputBox({
			placeHolder: args.placeholder,
			prompt: args.description,
			value: getDefault(args),
		});

		if (result !== undefined) {
			await setDefault(args, result);
		}

		return result;
	}

	async function rememberString(args: CommonArgs) {
		return getDefault(args);
	}
}

export function deactivate() {
	// Nothing to do.
}

interface QuickPickOptions {
	title: string;
	items: string[];
	value: string;
}

function showQuickPickDefault(options: QuickPickOptions) {
	return new Promise<string>((resolve) => {
		const picker = vscode.window.createQuickPick();
		const disposable = vscode.Disposable.from(
			picker,
			picker.onDidAccept(() => {
				resolve(picker.selectedItems[0].label);
				disposable.dispose();
			}),

			picker.onDidHide(() => {
				resolve("");
				disposable.dispose();
			}),
		);

		picker.title = options.title;

		// TODO: support localization for "Default".
		picker.items = options.items.map(
			(item) =>
				({
					label: item,
					description: item === options.value ? 'Default' : undefined,
				} as vscode.QuickPickItem),
		);

		for (const item of picker.items) {
			if (item.label === options.value) {
				picker.activeItems = [item];
				break;
			}
		}

		picker.show();
	});
}
