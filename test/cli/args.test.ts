import { checkArguments, parseArguments } from "../../lib/cli/args.ts"
import { assertEquals, assertThrows } from "../deps.ts"

Deno.test("parseArguments should correctly parse CLI arguments", () => {
  const args = parseArguments([
    "install",
    "-c",
    "deno",
    "-n",
    "deno-service",
    "--help",
    "--",
    "run",
    "--allow-net",
    "app.ts",
  ])

  assertEquals(args, {
    _: ["install"],
    help: true,
    h: true,
    name: "deno-service",
    n: "deno-service",
    cmd: "deno",
    c: "deno",
    "--": ["run", "--allow-net", "app.ts"],
  })
})

Deno.test("checkArguments should return valid parsed arguments", () => {
  const args = {
    _: ["install"],
    help: false,
    h: false,
    system: "systemd",
    s: "systemd",
    name: "deno-service",
    n: "deno-service",
    cwd: "/path/to/working/directory",
    w: "/path/to/working/directory",
    cmd: "deno",
    c: "deno",
    user: "user",
    u: "user",
    home: "/path/to/home",
    H: "/path/to/home",
    force: "true",
    f: "true",
    "--": ["run", "--allow-net", "app.ts"],
  }

  const result = checkArguments(args)
  assertEquals(result, args)
})

Deno.test("checkArguments should throw error for invalid base argument", () => {
  const args = {
    _: ["invalid"],
    help: false,
    h: false,
    system: "systemd",
    s: "systemd",
    name: "deno-service",
    n: "deno-service",
    cwd: "/path/to/working/directory",
    w: "/path/to/working/directory",
    cmd: "deno",
    c: "deno",
    user: "user",
    u: "user",
    home: "/path/to/home",
    H: "/path/to/home",
    force: "true",
    f: "true",
    "--": ["run", "--allow-net", "app.ts"],
  }

  assertThrows(() => checkArguments(args), Error, "Invalid base argument: invalid")
})

Deno.test("checkArguments should throw error for missing cmd and --", () => {
  const args = {
    _: ["install"],
    help: false,
    h: false,
    system: "systemd",
    s: "systemd",
    name: "deno-service",
    n: "deno-service",
    cwd: "/path/to/working/directory",
    w: "/path/to/working/directory",
    cmd: undefined,
    c: undefined,
    user: "user",
    u: "user",
    home: "/path/to/home",
    H: "/path/to/home",
    force: "true",
    f: "true",
    "--": [],
  }

  assertThrows(() => checkArguments(args), Error, "Specify a command using '--cmd'")
})
