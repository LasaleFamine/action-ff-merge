# action-ff-merge

> GitHub Action to forward merge a branch to another

## How to use

```yml
name: 'Merge to Stage'
on:
  push:
    branches:
      - master

jobs:
  merge:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          # Fetch the whole history to prevent unrelated history errors
          fetch-depth: '0'
          # The branch you want to checkout (usually equal to `from`)
          ref: 'master'
      - name: Merge Fast Forward
        uses: LasaleFamine/action-ff-merge@v1
        with:
          # Branch to merge
          from: master
          # Branch that will be updated
          to: stage
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
