# EIP Linting Bot

This Github Actions integrated bot lints EIPs and provides feedback for authors; its goal is to catch simple problems, notify the relevant individuals to review, and merge simple changes automatically.

# Usage

```yml
on:
  workflow_run:
    workflows:
      - Auto Review Bot Trigger
    types:
      - completed

name: Auto Review Bot
jobs:
  auto-review-bot:
    runs-on: ubuntu-latest
    name: Run
    steps:
      - name: Fetch PR Number
        uses: dawidd6/action-download-artifact@6765a42d86407a3d532749069ac03705ad82ebc6
        with:
          name: pr-number
          workflow: auto-review-trigger.yml
          run_id: ${{ github.event.workflow_run.id }}

      - name: Save PR Number
        id: save-pr-number
        run: echo "::set-output name=pr::$(cat pr-number.txt)"

      - name: Checkout
        uses: actions/checkout@2541b1294d2704b0964813337f33b291d3f8596b
        with:
          repository: ethereum/EIPs # Default, but best to be explicit here
          ref: master

      - name: Setup Node.js Environment
        uses: actions/setup-node@2fddd8803e2f5c9604345a0b591c3020ee971a93
        with:
          node-version: 16

      - name: Auto Review Bot
        id: auto-review-bot
        uses: ethereum/EIP-Bot@1e1bb6a58e02d28e9afa9462b00a518d9b47860e # dist
        with:
          GITHUB-TOKEN: ${{ secrets.TOKEN }}
          PR_NUMBER: ${{ steps.save-pr-number.outputs.pr }}
          CORE_EDITORS: '@MicahZoltu,@lightclient,@axic,@gcolvin,@SamWilsn,@Pandapip1'
          ERC_EDITORS: '@lightclient,@axic,@SamWilsn,@Pandapip1'
          NETWORKING_EDITORS: '@MicahZoltu,@lightclient,@axic,@SamWilsn'
          INTERFACE_EDITORS: '@lightclient,@axic,@SamWilsn,@Pandapip1'
          META_EDITORS: '@lightclient,@axic,@gcolvin,@SamWilsn,@Pandapip1'
          INFORMATIONAL_EDITORS: '@lightclient,@axic,@gcolvin,@SamWilsn,@Pandapip1'
          MAINTAINERS: '@alita-moore,@mryalamanchi'

      - name: Enable Auto-Merge
        uses: reitermarkus/automerge@a25ea0de41019ad13380d22e01db8f5638f1bcdc
        with:
          token: ${{ secrets.TOKEN }}
          pull-request: ${{ steps.save-pr-number.outputs.pr }}

      - name: Submit Approval
        uses: hmarr/auto-approve-action@24ec4c8cc344fe1cdde70ff37e55ace9e848a1d8
        with:
          github-token: ${{ secrets.TOKEN }}
          pull-request-number: ${{ steps.save-pr-number.outputs.pr }}
```

# Contributing

## Standard Practices

### Function Naming

This library uses concepts that may appear strange,

- **require...** : functions that start with `require` are used to guarantee it responds with the resource you're looking for or else it will error
- **assert...** : functions that start with `assert` are used to test something and if that test fails it'll respond with some kind of error message string. This is where the errors that the bot tells the author comes from.
- **...Purifier** : functions that end in `purifier` are used to _purify_ test results, they help to keep the logic of assertions clean and handle cross error dependencies like the fact that if you change the status you need an editor approval, but then once you actually get that approval we don't want to show the error for changing the status (i.e. `if (changedStatus && !approvedByEditor) { return error } else if (changedStatus && approvedByEditor) { return }`).

These practices are applied to make things easier to understand. If you're not careful, then the logic can get tangled very quick, and then it's really hard to read and change things.

### Testing

This bot employs two types of tests

- functional
- integration

A functional test is your standard unit test. Take a small function and test its behavior thoroughly. You don't need anything more than jest to do this, and your code should be organized such that the sub functions are abstracted and tested. It also uses dependency injection for this reason (it's typically easier to mock that way). Everything should have unit tests.

An integration test is a test that considers the behavior as a whole. In this bot, we mock a network response from the github api using `nock`. When you do this for every network request you're able to get a snapshot and test the whole's behavior. All integration tests were once bugs that were fixed, so if you implement a feature you don't need to add an integration test. It's easier to manage this way, and it serves the purpose of reducing code regression. Integration tests tend to be brittle because of the number of different facets. So the code uses several homebrewed tools to maximize reliability.

Feel free to share ideas on how to improve testing procedures.

## Getting Started

### Requirements

1. node package manager (npm)
2. Github Token
3. Forked Repo
4. nodejs

### Quick Start (npm run it)

`npm run it` runs the bot end to end; which means you can integrate and test with github directly. It uses the typescript built script so don't forget to build that by using `npm run build` or `npm run watch`.

1. Download your forked `EIPS` repo
2. Create a [Github Token](/creating-a-personal-access-token)
3. Create a PR in your forked repo doing anything, I recommend just editing a couple lines in an already existing EIPs
4. Create a .env variable in the root dir with the following information defined:

```
GITHUB_TOKEN = <YOUR GITHUB TOKEN>
NODE_ENV = development

PULL_NUMBER = <pull_number>
BASE_SHA = <base sha of the PR>
HEAD_SHA = <head sha of the PR>
REPO_OWNER_NAME = <your login>
REPO_NAME = EIPs
GITHUB_REPOSITORY = <your login>/EIPs
```

5. `npm run build && npm run it`

### Quick Start (npm run mock)

`npm run mock` is a tool built for writing integration tests, but it can also be used to develop. `npm run mock` uses the saved network data of previous pull requests and states of those pull requests. Try this by mocking [pull 3670](https://github.com/ethereum/EIPs/pull/3670)..

1. Clone this repo
2. Setup your local environment (requires node > 14.x): `npm install`
3. Create a .env variable in the root dir with the following information:

```
GITHUB_TOKEN = anything

PULL_NUMBER = 3670
REPO_OWNER_NAME = ethereum
REPO_NAME = EIPs
GITHUB_REPOSITORY = ethereum/EIPs
EVENT_TYPE = pull_request_target
```

4. Then run the mock `npm run mock`
5. You should get a response like the following

```bash
alitamoore@Alitas-MBP EIP-Bot % npm run mock

> auto-merge-eip@1.0.0 mock /Users/alitamoore/ethereum/EIP-Bot
> NODE_ENV=MOCK node -r dotenv/config build/src/index.js

failed to pass tests with the following errors:
        - File with name EIPS/eip-3670.md is new and new files must be reviewed
        - This PR requires review from one of [@micahzoltu, @lightclient, @arachnid, @cdetrio, @souptacular, @vbuterin, @nicksavers, @wanderer, @gcolvin]
::error::failed to pass tests with the following errors:%0A     - File with name EIPS/eip-3670.md is new and new files must be reviewed%0A      - This PR requires review from one of [@micahzoltu, @lightclient, @arachnid, @cdetrio, @souptacular, @vbuterin, @nicksavers, @wanderer, @gcolvin]
npm ERR! code ELIFECYCLE
npm ERR! errno 1
npm ERR! auto-merge-eip@1.0.0 mock: `NODE_ENV=MOCK node -r dotenv/config build/src/index.js`
npm ERR! Exit status 1
npm ERR!
npm ERR! Failed at the auto-merge-eip@1.0.0 mock script.
npm ERR! This is probably not a problem with npm. There is likely additional logging output above.

npm ERR! A complete log of this run can be found in:
npm ERR!     /Users/alitamoore/.npm/_logs/2021-07-25T06_43_54_229Z-debug.log
```

In this case, an error was expected because the bug in question was if the editors were mentioned if a status error occurred (if the status wasn't one of the allowed types)

### Troubleshooting

- <i>When I run it, I'm getting unexplainable errors with my github requests.</i>
  - Github limits the number of requests from a given IP, this may be avoidable if you only use the `octokit` but a VPN also works just fine

## Code Style Guidelines (in no particular order)

This repo is a living repo, and it will grow with the EIP drafting and editing process. It's important to maintain code quality.

1. Define every type (including octokit)
2. Make clean and clear error messages
3. Avoid abstraction
4. Use [enums](https://www.sohamkamani.com/javascript/enums/) as much as possible

## Explanations of Style Guidelines

A couple things to keep in mind if you end up making changes to this

#### 1. <ins>Define every type</ins>

Define every type, no `any` types. The time it takes to define a type now will save you or someone else later a lot of time. If you make assumptions about types, protect those assumptions (throw exception if they are false).

Sometimes [Octokit types](https://www.npmjs.com/package/@octokit/types) can be difficult to index, but it's important that whenever possible the types are defined and assumptions protected.

#### 2. <ins>Make clean and clear error messages</ins>

This bot has a single goal: catch simple mistakes automatically and save the editors time. So clear error messages that allow the PR author to change it themselves are very important.

#### 3. <ins>Avoid Abstraction</ins>

Only abstract if necessary, keep things in one file where applicable; other examples of okay abstraction are types, regex, and methods used more than 3 times. Otherwise, it's often cleaner to just re-write things.

```javascript
// DON'T DO THIS
** src/lib.ts **
export const baz = () => "baz"

** src/foo.ts **
import { baz } from "./lib"
export const foo = () => baz();

** src/bar.ts **
import { baz } from "./lib"
export const bar = () => baz();

// DO THIS
** src/foo.ts **
const baz = () => "baz"
export const foo = () => baz();

** src/bar.ts **
const baz = () => "baz"
export const bar = () => baz();
```

#### 4. <ins>Always use enum when defining restricted string types</ins>

In short, enums make code easier to read, trace, and maintain.

But here's a brief info if you haven't worked with them before

```typescript
enum EnumFoo {
  bar = "BAR",
  baz = "BAZ"
}
type Foo = "BAR" | "BAZ";
```

Inline declaration is maintained

```typescript
const foo: EnumFoo;
const bar: Foo;
// foo and bar both must be either "BAR" or "BAZ"
```

Use case is slightly different

```typescript
const foo: EnumFoo = EnumFoo.baz; // you can't directly assign "BAZ"
const bar: Foo = "BAZ";
```

But comparisons are maintained

```typescript
// taking variables from above
("BAZ" === foo) === ("BAZ" === bar) &&
  ("BAZ" === EnumFoo.baz) === ("BAZ" === "BAZ");
```

In addition to the above use case and string eradication it centralizes the strings to be matched so they can be easily changed. So, making life much easier if you wanted to change the names of statuses on an EIP.
