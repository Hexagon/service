# Service

Service is a simple Deno module for managing system services. It offers a convenient way to install, uninstall, and generate service configurations for various service managers.

If you want a fully featured process manager for Deno, we recommend using [Pup](https://github.com/hexagon/pup).

## Features

- Easy-to-use CLI for managing services
- Library usage through `mod.ts` for custom integrations
- Install, uninstall, and generate service configurations
- Compatible with systemd, sysvinit, docker-init, upstart (Linux) and launchd (macOS) service managers
- Built for Deno, but usable to install any script as service on any system.

## Installation

To use Service as a CLI program, you can install it using Deno:

```sh
deno install -fra --name service https://deno.land/x/service/service.ts
```

For library usage, simply import the `installService()` function from the `mod.ts` file:

    import { installService } from "https://deno.land/x/service/mod.ts"

> **Note**: Make sure to pin the import to a specific version, like `service@1.0.0`

## CLI Usage

To use the service library from the command line, follow these steps:

1. Install a command as a service:

   ```
   service install --name my-service --cmd "deno run --allow-net server.ts"
   ```

2. Uninstall a service:

   ```
   service uninstall --name my-service
   ```

## Programmatic Usage

To use the service library programmatically, you can import and use the `installService` and `uninstallService` functions.

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
}
```

The interface for the `uninstallService` function is very similar:

```ts
interface UnnstallServiceOptions {
  system: boolean
  name: string
  user?: string
  home?: string
  cwd?: string
}
```

### installService

The `installService` function installs a command as a service, using the current service manager:

```ts
import { installService } from "https://deno.land/x/service/mod.ts"

await installService({
  system: false, // Use user mode (default) or system mode
  name: "my-service",
  cmd: "deno run --allow-net server.ts",
  user: "username", // Optional, defaults to current user
  home: "/home/username", // Optional, defaults to current user's home
  cwd: "/path/to/working/directory", // Optional, defaults to current working directory
})
```

### uninstallService

The `uninstallService` function uninstalls a command from a service, using the currently installed service manager:

```ts
import { uninstallService } from "https://deno.land/x/service/mod.ts"

await uninstallService({
  system: false, // Use user mode (default) or system mode
  name: "my-service",
  user: "username", // Optional, defaults to current user
  home: "/home/username", // Optional, defaults to current user's home
  cwd: "/path/to/working/directory", // Optional, defaults to current working directory
})
```

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

Before submitting a pull request, please ensure your code follows the project's coding style and passes all tests.
