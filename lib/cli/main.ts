/**
 * Exports main function of Service cli entrypoint
 *
 * @file      lib/cli/main.ts
 * @license   MIT
 */

// Import CLI utilities
import { printFlags, printUsage } from "./output.ts"
import { checkArguments, parseArguments } from "./args.ts"
import { installService, uninstallService } from "../service.ts"

/**
 * Define the main entry point of the CLI application
 *
 * @private
 * @async
 */
async function main(inputArgs: string[]) {
  // Parse and check arguments
  let args
  try {
    args = checkArguments(parseArguments(inputArgs))
  } catch (e) {
    console.error(e.message)
    Deno.exit(1)
  }

  // Extract base argument
  const baseArgument = args._.length > 0 ? args._[0] : undefined

  if (args.help || !baseArgument) {
    printUsage()
    console.log("")
    printFlags()
    Deno.exit(0)
  }

  // Handle arguments
  const system = args.system !== undefined
  const name = args.name
  const cmd = args.cmd || args["--"].join(" ")
  const cwd = args.cwd
  const user = args.user
  const home = args.home
  const force = args.force
  const path = args.path ? args.path.split(":") : undefined

  /**
   * Handle the install argument
   */
  if (baseArgument === "install" || baseArgument === "generate") {
    try {
      await installService({ system, name, cmd, cwd, user, home, path }, baseArgument === "generate", force)
      Deno.exit(0)
    } catch (e) {
      console.error(`Could not install service, error: ${e.message}`)
      Deno.exit(1)
    }
    /**
     * Handle the uninstall argument
     */
  } else if (baseArgument === "uninstall") {
    try {
      await uninstallService({ system, name, home })
      Deno.exit(0)
    } catch (e) {
      console.error(`Could not install service, error: ${e.message}`)
      Deno.exit(1)
    }
  } else {
    console.error(`Unknown  command '${baseArgument}', exiting.`)
    Deno.exit(1)
  }
}

export { main }
