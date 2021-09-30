# node-foundation

(For more information, [click here](https://movement-pass.github.io/foundation.html))

In order run:

1. Create an aws profile in your local machine named `movement-pass`.

2. Make sure you have AWS CDK installed globally, if not, open your terminal and run:

```shell
npm install -g aws-cdk
```

3. Assuming your terminal is open, and you are in the root of this repository, run the following command to install the packages:

```shell
npm install
```

4. If you are in Windows, then run:

```
poweshell
.\deploy.ps1
```

5. If you are in macOS or Linux:

```
chmod +x ./deploy.sh
./deploy
```

**Note**: Running it your own AWS account would fail unless you change the domain name in `./cdk.json`.
