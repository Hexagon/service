import { existsSync } from "../../deps.ts"
import { InstallServiceOptions, UninstallServiceOptions } from "../service.ts"

const plistTemplate = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>{{name}}</string>
  <key>ProgramArguments</key>
  <array>
    <string>{{command}}</string>
  </array>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key>
    <string>{{path}}</string>
  </dict>
  <key>WorkingDirectory</key>
  <string>{{workingDirectory}}</string>
  <key>KeepAlive</key>
  <true/>
</dict>
</plist>
`
async function installServiceLaunchd(config: InstallServiceOptions, onlyGenerate: boolean) {
  const plistFileName = `${config.name}.plist`

  // Different paths for user and system mode
  const plistPathUser = `${config.home}/Library/LaunchAgents/${plistFileName}`
  const plistPathSystem = `/Library/LaunchDaemons/${plistFileName}`
  const plistPath = config.system ? plistPathSystem : plistPathUser

  // Do not allow to overwrite existing services, regardless of mode
  if (existsSync(plistPathUser) || existsSync(plistPathSystem)) {
    console.error(`Service '${config.name}' already exists. Exiting.`)
    Deno.exit(1)
  }

  const denoPath = Deno.execPath()
  const command = config.cmd
  const servicePath = `PATH=$PATH:${denoPath}:${config.home}/.deno/bin`
  const workingDirectory = config.cwd ? config.cwd : Deno.cwd()

  let plistContent = plistTemplate.replace(/{{name}}/g, config.name)
  plistContent = plistContent.replace(/{{command}}/g, command)
  plistContent = plistContent.replace(/{{denoPath}}/g, denoPath)
  plistContent = plistContent.replace(/{{path}}/g, servicePath)
  plistContent = plistContent.replace(/{{workingDirectory}}/g, workingDirectory)

  if (onlyGenerate) {
    console.log("\nThis is a dry-run, nothing will be written to disk or installed.")
    console.log("\nPath: ", plistPath)
    console.log("\nConfiguration:\n")
    console.log(plistContent)
  } else {
    // ToDo: Remember to rollback on failure
    await Deno.writeTextFile(plistPath, plistContent)

    console.log(`Service '${config.name}' installed at '${plistPath}'.`)

    // ToDo: Actually run the service and verify that it works, if not - use the rollback function
    if (config.system) {
      console.log("Please run the following command as root to load the service:")
      console.log(`sudo launchctl load ${plistPath}`)
    } else {
      console.log("Please run the following command to load the service:")
      console.log(`launchctl load ${plistPath}`)
    }
  }
}

/**

Rolls back any changes made during the launchd service installation process
by removing the plist file.
@function rollbackLaunchd
@param {string} plistPath - The path of the plist file to be removed.
@param {boolean} system - Whether the service is installed in system mode.
*/
// deno-lint-ignore no-unused-vars
async function rollbackLaunchd(plistPath: string, system: boolean) {
  try {
    await Deno.remove(plistPath)
    console.log(`Changes rolled back: Removed '${plistPath}'.`)
  } catch (error) {
    console.error(`Failed to rollback changes: Could not remove '${plistPath}'. Error:`, error.message)
  }
}

/**
 * Uninstalls a Launchd service by removing the service configuration file (plist).
 * Checks if the service exists and removes it if found.
 *
 * @async
 * @function uninstallServiceLaunchd
 * @param {UninstallServiceOptions} config - Options for the uninstallService function.
 * @throws Will throw an error if unable to remove the service configuration file.
 */
async function uninstallServiceLaunchd(config: UninstallServiceOptions) {
  const plistFileName = `${config.name}.plist`

  // Different paths for user and system mode
  const plistPathUser = `${config.home}/Library/LaunchAgents/${plistFileName}`
  const plistPathSystem = `/Library/LaunchDaemons/${plistFileName}`
  const plistPath = config.system ? plistPathSystem : plistPathUser

  // Check if the service exists
  if (!existsSync(plistPath)) {
    console.error(`Service '${config.name}' does not exist. Exiting.`)
    Deno.exit(1)
  }

  try {
    await Deno.remove(plistPath)
    console.log(`Service '${config.name}' uninstalled successfully.`)

    // Unload the service
    if (config.system) {
      console.log("Please run the following command as root to unload the service (if it's running):")
      console.log(`sudo launchctl unload ${plistPath}`)
    } else {
      console.log("Please run the following command to unload the service (if it's running):")
      console.log(`launchctl unload ${plistPath}`)
    }
  } catch (error) {
    console.error(`Failed to uninstall service: Could not remove '${plistPath}'. Error:`, error.message)
  }
}

export { installServiceLaunchd, uninstallServiceLaunchd }
