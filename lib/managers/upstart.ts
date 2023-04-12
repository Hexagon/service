import { existsSync } from "../../deps.ts"
import { InstallServiceOptions, UninstallServiceOptions } from "../service.ts"

const upstartFileTemplate = `# {{name}} (Deno Service)

description "{{name}} Deno Service"
author "Service user"

start on (filesystem and net-device-up IFACE!=lo)
stop on runlevel [!2345]

respawn
respawn limit 10 5

env PATH={{path}}

# Change the next line to match your service installation
env SERVICE_COMMAND="{{command}}"

exec $SERVICE_COMMAND
`

async function installServiceUpstart(config: InstallServiceOptions, onlyGenerate: boolean) {
  const upstartFilePath = `/etc/init/${config.name}.conf`

  if (existsSync(upstartFilePath)) {
    console.error(`Service '${config.name}' already exists in '${upstartFilePath}'. Exiting.`)
    Deno.exit(1)
  }

  const denoPath = Deno.execPath()
  const envPath = `PATH=$PATH:${denoPath}:${Deno.env.get("HOME")}/.deno/bin`

  let upstartFileContent = upstartFileTemplate.replace(/{{name}}/g, config.name)
  upstartFileContent = upstartFileContent.replace("{{command}}", config.cmd)
  upstartFileContent = upstartFileContent.replace("{{path}}", envPath)

  if (onlyGenerate) {
    console.log("\nThis is a dry-run, nothing will be written to disk or installed.")
    console.log("\nPath: ", upstartFilePath)
    console.log("\nConfiguration:\n")
    console.log(upstartFileContent)
  } else {
    // Store temporary file
    const tempFilePath = await Deno.makeTempFile()
    await Deno.writeTextFile(tempFilePath, upstartFileContent)

    console.log("\Service installer do not have (and should not have) root permissions, so the next steps have to be carried out manually.")
    console.log(`\nStep 1: The upstart configuration has been saved to a temporary file, copy this file to the correct location using the following command:`)
    console.log(`\n  sudo cp ${tempFilePath} ${upstartFilePath}`)
    console.log(`\nStep 2: Start the service now`)
    console.log(`\n  sudo start ${config.name}\n`)
  }
}

/**
 * Uninstalls an Upstart service by removing the service configuration file.
 * Checks if the service exists and removes it if found.
 *
 * @async
 * @function uninstallServiceUpstart
 * @param {UninstallServiceOptions} config - Options for the uninstallService function.
 * @throws Will throw an error if unable to remove the service configuration file.
 */
async function uninstallServiceUpstart(config: UninstallServiceOptions) {
  const upstartFilePath = `/etc/init/${config.name}.conf`

  // Check if the service exists
  if (!existsSync(upstartFilePath)) {
    console.error(`Service '${config.name}' does not exist. Exiting.`)
    Deno.exit(1)
  }

  try {
    await Deno.remove(upstartFilePath)
    console.log(`Service '${config.name}' uninstalled successfully.`)

    console.log("Please run the following command as root to stop the service (if it's running):")
    console.log(`sudo stop ${config.name}`)
  } catch (error) {
    console.error(`Failed to uninstall service: Could not remove '${upstartFilePath}'. Error:`, error.message)
  }
}

export { installServiceUpstart, uninstallServiceUpstart }
