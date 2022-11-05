# Memento Inputs

This extension lets you create [task input variables](https://code.visualstudio.com/docs/editor/variables-reference#_input-variables)
which act like `pickString` and `promptString` but remember the value you
previously entered and default to it the next time they are used. In addition the remembered string can be used as input without prompt or picking using `rememberString`.

The extension name comes from the [API used to store the last-used values](https://code.visualstudio.com/api/references/vscode-api#Memento).

## Usage

In your `tasks.json`, create an input variable with type `command` and set the
`command` and `args` as follows:

`promptString`:

* **command**: `memento.promptString`
* **args**:
  * **id**: Name to use for storing the last-used value.
  * **description**: Shown in the quick input to provide context for the input.
  * **default**: Default value that will be used if no last-used value has been set.
  * **placeholder**: Optional text to display if the input box is empty.

`pickString`:

* **command**: `memento.pickString`
* **args**:
  * **id**: Name to use for storing the last-used value.
  * **description**: Shown in the quick input to provide context for the input.
  * **options**: An array of options for the user to pick from.
  * **default**: Default value that will be used if no last-used value has been set.

`rememberString`:

* **command**: `memento.rememberString`
* **args**:
  * **id**: Name to use for storing the last-used value.
  * **default**: Default value that will be used if no last-used value has been set.


Below is an example of a `tasks.json` that defines tasks to build an application
and deploy it to some other device.

When starting a build, it will prompt for the build mode. Where the regular
`pickString` would always default to `production`, this will default to
whichever mode you last picked.

The `Deploy` task depends on `MySSHTask`. Both requires the IP address of the target
device. To supress the input prompt to be shown twice the `MySSHTask` uses `memento.promptString`
and `Deploy` uses `memento.rememberString` which takes the string entered by user in `MySSHTask`.
Where the regular `promptString` would always default to `192.168.1.42`,
the `memento.promptString` will default to whatever text you last entered.

```JSON
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "Build",
            "group": { "kind": "build", "isDefault": true },
            "type": "shell",
            "command": "npm",
            "args": ["run", "build", "--mode", "${input:buildMode}"]
        },
        {
            "label": "Deploy",
            "type": "shell",
            "command": "npm",
            "args": ["run", "deploy", "--address", "${input:storedAddress}"],
			"depependsOn" : ["MySSHTask"]
        },
		{
			"label": "MySSHTask",
			"type": "shell",
			"command": "ssh",
			"args": [
				"root@${input:address}",
				"<ie. some shell commands before Deploy is executed...>"
			]
		}
    ],
    "inputs": [
        {
            "id": "buildMode",
            "type": "command",
            "command": "memento.pickString",
            "args": {
                "id": "buildMode",
                "description": "Build mode",
                "options": ["production", "dev"],
                "default": "production"
            }
        },
        {
            "id": "address",
            "type": "command",
            "command": "memento.promptString",
            "args": {
                "id": "address",
                "description": "Target IP address",
                "default": "192.168.1.42",
                "placeholder": "IP address"
            }
        },
		{
            "id": "storedAddress",
            "type": "command",
            "command": "memento.rememberString",
            "args": {
                "id": "address",
                "default": "192.168.1.42"
            }
        }

    ]
}
```