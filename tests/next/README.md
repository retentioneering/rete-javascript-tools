# How to

## Run e2e tests

### Better way

Step 0: Build `dist`

Step 1: Build app with

```shell
npm run build:clean
```

Step 2: Run e2e tests with

```shell
npm run e2e:headless
```

Step 3: ⏲ Profit

### Devs way

Step 0: Build `dist`

Step 1: Run

```shell
npm run dev:clean
```

Step 2: And then

```shell
npm run cypress
# or
npm run cypress:headless
```

Step 3: ⏲ Profit
