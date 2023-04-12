/**
 * Exports helper functions to install any command as a system service
 * Throws an error on Windows.
 *
 * @file      lib/service.ts
 * @license   MIT
 */

/**
 * Options for the installService function.
 *
 * @interface InstallServiceOptions
 * @property {boolean} [system] - Indicates whether to use system mode (default is to use user mode).
 * @property {string} [name='deno-service'] - Name of the service (default: 'deno-service').
 * @property {string} [cmd] - Full command for the service to run
 * @property {string} [user] - The username to run the service as (default: current user).
 * @property {string} [home] - The user's home directory path (default: current user's home).
 * @property {string} [cwd] - The working directory for the service (default: current working directory).
 */
interface InstallServiceOptions {
  system: boolean
  name: string
  cmd: string
  user?: string
  home?: string
  cwd?: string
}

/**
 * Options for the uninstallService function.
 *
 * @interface UninstallServiceOptions
 * @property {boolean} [system] - Indicates whether to use system mode (default is to use user mode).
 * @property {string} [name='deno-service'] - Name of the service (default: 'deno-service').
 * @property {string} [user] - The username to run the service as (default: current user).
 * @property {string} [home] - The user's home directory path (default: current user's home).
 * @property {string} [cwd] - The working directory for the service (default: current working directory).
 */
interface UninstallServiceOptions {
  system: boolean
  name: string
  user?: string
  home?: string
  cwd?: string
}

/**
 * Prepares the configuration object with defaults for the installService and uninstallService functions.
 *
 * @function prepareServiceConfig
 * @param {T} options - Options for the installService and uninstallService functions.
 * @returns {T} - The configuration object with default values set.
 */
function prepareConfig<T extends InstallServiceOptions | UninstallServiceOptions>(options: T): T {
  return {
    system: options.system || false,
    name: options.name || "deno-service",
    cmd: "cmd" in options ? options.cmd : undefined,
    user: options.user || Deno.env.get("USER"),
    home: options.home || Deno.env.get("HOME"),
    cwd: options.cwd || Deno.cwd(),
  } as T
}

/**
 * Installs a command as a systemd service using the currently installed service manager.
 * Throws an error on failure, or unsupported system.
 *
 * @async
 * @function installService
 * @param {InstallServiceOptions} options - Options for the installService function.
 */
async function installService(options: InstallServiceOptions, onlyGenerate: boolean, forceInitSystem?: string) {
  if (forceInitSystem && !onlyGenerate) {
    throw new Error("Manually selecting an init system is not possible while installing.")
  }

  // Prepare configuration with defaults
  const config = prepareConfig(options)

  // Determine init system
  const initSystem = forceInitSystem || await detectInitSystem()

  if (initSystem === "systemd") {
    const { installServiceSystemd } = await import("./managers/systemd.ts")
    await installServiceSystemd(config, onlyGenerate)
  } else if (initSystem === "sysvinit" || initSystem === "docker-init") {
    const { installServiceInit } = await import("./managers/init.ts")
    await installServiceInit(config, onlyGenerate)
  } else if (initSystem === "upstart") {
    const { installServiceUpstart } = await import("./managers/upstart.ts")
    await installServiceUpstart(config, onlyGenerate)
  } else if (initSystem === "launchd") {
    const { installServiceLaunchd } = await import("./managers/launchd.ts")
    await installServiceLaunchd(config, onlyGenerate)
  } else {
    throw new Error("Unsupported operating system. Service installation is only supported on Linux and macOS.")
  }
}

async function detectInitSystem(): Promise<string> {
  if (Deno.build.os === "darwin") {
    return "launchd"
  }

  if (Deno.build.os === "windows") {
    return "windows"
  }

  const process = await new Deno.Command("ps", {
    args: ["-p", "1", "-o", "comm="],
    stdout: "piped",
    stderr: "piped",
  })

  process.spawn()
  const output = await process.output()
  const outputText = new TextDecoder().decode(output.stdout)

  if (outputText.includes("systemd")) {
    return "systemd"
  } else if (outputText.includes("init")) {
    // Check for Upstart
    try {
      if (Deno.statSync("/sbin/initctl").isFile && Deno.statSync("/etc/init").isDirectory) {
        return "upstart"
      } else {
        return "sysvinit"
      }
    } catch (_e) {
      return "sysvinit"
    }
  } else if (outputText.includes("openrc")) {
    return "openrc"
  } else if (outputText.includes("docker-init")) {
    return "dockerinit"
  } else {
    throw new Error("Unsupported init system.")
  }
}

/**
 * Uninstalls a command from a systemd service using the currently installed service manager.
 * Throws an error on failure, or unsupported system.
 *
 * @async
 * @function uninstallService
 * @param {InstallServiceOptions} options - Options for the uninstallService function.
 */
async function uninstallService(options: UninstallServiceOptions, forceInitSystem?: string) {
  const config = prepareConfig(options)

  // Determine init system
  const initSystem = forceInitSystem || await detectInitSystem()

  if (initSystem === "systemd") {
    const { uninstallServiceSystemd } = await import("./managers/systemd.ts")
    await uninstallServiceSystemd(config)
  } else if (initSystem === "sysvinit" || initSystem === "docker-init") {
    const { uninstallServiceInit } = await import("./managers/init.ts")
    await uninstallServiceInit(config)
  } else if (initSystem === "upstart") {
    const { uninstallServiceUpstart } = await import("./managers/upstart.ts")
    await uninstallServiceUpstart(config)
  } else if (initSystem === "launchd") {
    const { uninstallServiceLaunchd } = await import("./managers/launchd.ts")
    await uninstallServiceLaunchd(config)
  } else {
    throw new Error("Unsupported operating system. Service uninstallation is only supported on Linux and macOS.")
  }
}

export { installService, uninstallService }
export type { InstallServiceOptions, UninstallServiceOptions }
