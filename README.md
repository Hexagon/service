# Service

Service is a simple Deno module for managing system services. It offers a convenient way to install, uninstall, and generate service configurations for various service managers.

If you want a fully featured process manager for Deno, we recommend using [Pup](https://github.com/hexagon/pup).

## Features

- Easy-to-use CLI for managing services
- Library usage through `mod.ts` for custom integrations
- Install, uninstall, and generate service configurations
- Compatible with systemd, sysvinit, docker-init, upstart (Linux), launchd (macOS) and SCM (Windows) service managers
- Built for Deno, but usable to install any script as service on any system.

## Installation

To use Service as a CLI program, you can install or upgrade it using Deno:

```sh
deno install -frA --name service https://deno.land/x/service/service.ts
```

For library usage, simply import the `installService()` function from the `mod.ts` file:

    import { installService } from "https://deno.land/x/service/mod.ts"

> **Note**: Make sure to pin the import to a specific version, like `service@1.0.0`

## CLI Usage

To use the service library from the command line, follow these steps:

Install a command as a service:

```
# Using deno

service install --name my-service --cmd "deno run --allow-net /full/path/to/server.ts"

# ... or a generic executable (with arguments and extra paths)

service install --name my-service --cmd "/full/path/to/executable --optional-arg /full/path/to/config.ext" --path "/add/this/to/path:/and/this"
```

Uninstall a service:

```
service uninstall --name my-service
```

Generate a service configuration file without installing it:

```
service generate --name my-service --cmd "deno run --allow-net /full/path/to/server.ts --arg /full/path/to/config.ext"
```

Note:

- The deno install path (`$HOME/.deno/bin`) will automatically be added to path. Additional paths can be supplied by passing a colon separated list to`--path`.
- If you have any problems, always use full paths when registering a service. Services do not have the `PATH` that your shell have.
- Use `generate` before `install`, that way you can visually inspect the generated configuration before installing it.
- Steps requiring elevated access (like installing a system wide service) will not be performed automatically, you will insted get step by step instruction to make the required steps using `sudo` or
  the tool of your choice.
- You can force service to generate configuration for a manager that is not installed, using systemd as an example: `generate --force systemd`

## Programmatic Usage

To use the service library programmatically, you can import and use the `installService`, `generateConfig` and `uninstallService` functions.

### InstallServiceOptions

This is the interface for the options used by the `installService` function:

```ts
interface InstallServiceOptions {
  system: boolean
  name: string
  cmd: string
  user?: string
  home?: string
  cwd?: string
  path?: string[]
  env?: string[]
}
```

The interface for the `uninstallService` function is very similar:

```ts
interface UninstallServiceOptions {
  system: boolean
  name: string
  home?: string
}
```

### installService

The `installService` function installs a command as a service, using the current service manager:

```ts
import { installService } from "https://deno.land/x/service/mod.ts"

await installService({
  system: false, // Use user mode if available (default) or force system mode
  name: "my-service",
  cmd: "deno run --allow-net server.ts",
  user: "username", // Optional, defaults to current user
  home: "/home/username", // Optional, defaults to current user's home
  cwd: "/path/to/working/directory", // Optional, defaults to current working directory
  path: ["/extra/path", "/extra/path/2"], // Optional
  env: ["KEY=VALUE", "KEY2=VALUE2"], // Optional
})
```

### uninstallService

The `uninstallService` function uninstalls a command from a service, using the currently installed service manager:

```ts
import { uninstallService } from "https://deno.land/x/service/mod.ts"

await uninstallService({
  system: false, // Use user mode if available (default) or force system mode
  name: "my-service",
  home: "/home/username", // Optional, defaults to current user's home, used in case of user services
})
```

### generateConfig

The `generateConfig` function generates a service configuration string for the specified service:

```ts
import { generateConfig } from "https://deno.land/x/service/mod.ts"

const config = await generateConfig({
  system: false, // Use user mode if available (default) or force system mode
  name: "my-service",
  cmd: "deno run --allow-net server.ts",
  user: "username", // Optional, defaults to current user
  home: "/home/username", // Optional, defaults to current user's home
  cwd: "/path/to/working/directory", // Optional, defaults to current working directory,
  path: ["/extra/path", "/extra/path/2"], // Optional
  env: ["KEY=VALUE", "KEY2=VALUE2"], // Optional
})

console.log(config)
```

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

Before submitting a pull request, please ensure your code follows the project's coding style and passes all tests.

### Template for a new service manager implementation

```ts
/**
 * @file lib/managers/name_of_manager.ts
 *
 * This module provides a template for implementing new manager classes
 * for various init systems. The template contains the structure and descriptions
 * of the required methods for a manager class. Replace 'ManagerTemplate' with the
 * name of the new manager class and implement the necessary methods according
 * to the target init system.
 *
 * When done, add this new implementation to lib/service.ts
 */

import { InstallServiceOptions, UninstallServiceOptions } from "../service.ts"

class ManagerTemplate {
  /**
   * Generates the configuration file content based on the given options.
   * @param config - The configuration options for the service.
   * @returns The generated configuration file content.
   */
  generateConfig(config: InstallServiceOptions): string {
    // TODO: Implement this method for the target init system.
    throw new Error("Not implemented")
  }

  /**
   * Installs the service based on the given options.
   * @param config - The configuration options for the service.
   * @param onlyGenerate - A flag indicating whether to only generate the configuration or
   * also install the service. The difference between install with onlyGenerate and the
   * generateConfig function, is that install with onlyGenerate should console.log additional
   * steps needed to finish the installation, such as `sudo systemctl daemon-reload`.
   * generateConfig do only output the base configuration file.
   */
  async install(config: InstallServiceOptions, onlyGenerate: boolean) {
    // TODO: Implement this method for the target init system.
    throw new Error("Not implemented")
  }

  /**
   * Uninstalls the service based on the given options.
   * @param config - The configuration options for uninstalling the service.
   */
  async uninstall(config: UninstallServiceOptions) {
    // TODO: Implement this method for the target init system.
    throw new Error("Not implemented")
  }
}

export { ManagerTemplate }
```
