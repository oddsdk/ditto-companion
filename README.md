# Ditto Companion

Ditto companion is an app for sharing and collecting Ditto plugin presets.

See the [Ditto repository](https://github.com/oddsdk/ditto) for the Ditto plugin.

### Get Started

1. Clone the repository:

    ```shell
    git clone https://github.com/oddsdk/ditto-companion
    ```

2. Install the dependencies.

    ```shell
    npm install
    ```

3. Start the local development server.

    ```shell
    npm run dev
    ```

4. Navigate to `http://localhost:5173` in your web browser.

### Static Build

Export a static build.

```shell
npm run build
```

The build outputs the static site to the `build` directory.

### Fission App Hosting

An ODD SDK application can be published to IPFS with the [Fission CLI](https://guide.fission.codes/developers/cli) or the [Fission GitHub publish action](https://github.com/fission-suite/publish-action).

**To publish with the Fission CLI:**

1. [Install the CLI](https://guide.fission.codes/developers/installation)
2. Run `fission setup` to make a Fission account
3. Run `npm run build` to build the app
4. Delete `fission.yaml`
5. Run `fission app register` to register a new Fission app (accept the `./build` directory suggestion for your build directory)
6. Run `fission app publish` to publish your app to the web

Your app will be available online at the domain assigned by the register command.

**To set up the GitHub publish action:**

1. Register the app with the CLI
2. Export your machine key with `base64 ~/.config/fission/key/machine_id.ed25519`
3. Add your machine key as a GH Repository secret named `FISSION_MACHINE_KEY`
4. Update the `publish.yml` with the name of your registered app

See the [Fission Guide](https://guide.fission.codes/developers/installation) and the publish action README for more details.