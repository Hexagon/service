/**
 * Exports helper functions to parse and check arguments of Service Cli program
 *
 * @file      lib/cli/args.ts
 * @license   MIT
 */

import { Args, parse } from "../../deps.ts"

/**
 * Parses command line arguments and returns a parsed object.
 *
 * @param args - An array of command line arguments.
 * @returns - A parsed object containing the command line arguments.
 */
function parseArguments(args: string[]): Args {
  // All boolean arguments
  const booleanArgs = [
    "help",
  ]

  // All string arguments
  const stringArgs = [
    "system",
    "name",
    "cwd",
    "cmd",
    "user",
    "home",
    "force",
  ]

  // And a list of aliases
  const alias = {
    "help": "h",
    "system": "s",
    "name": "n",
    "cwd": "w",
    "cmd": "c",
    "user": "u",
    "home": "H",
    "force": "f",
  }

  return parse(args, { alias, boolean: booleanArgs, string: stringArgs, stopEarly: false, "--": true })
}

/**
 * Checks the parsed arguments and throws an error if any of the arguments are invalid.
 * @param args - The parsed arguments.
 * @returns - The parsed and checked arguments.
 * @throws - An error if any of the arguments are invalid.
 */
function checkArguments(args: Args): Args {
  // Check if the base argument is undefined or valid
  const baseArgument = args._.length > 0 ? args._[0] : undefined
  const validBaseArguments = ["install", "uninstall", "generate"]
  if (baseArgument !== undefined && (typeof baseArgument !== "string" || !validBaseArguments.includes(baseArgument))) {
    throw new Error(`Invalid base argument: ${baseArgument}`)
  }
  if (baseArgument !== "uninstall" && !args.cmd && !(args["--"] && args["--"].length > 0)) {
    throw new Error(`Specify a command using '--cmd'`)
  }

  return args
}

export { checkArguments, parseArguments }
