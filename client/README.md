## Setup

To install and run

```
yarn
yarn start
```

We don't have lint-staged, or any other method to enforce styling as a pre-commit hook (lint-staged does not work well without it being setup in root dir), so you might want to setup prettier/eslint in your editor of choice (or run the fix script before submitting PR).

## Redux

We use a less boilerplate-heavy way of writing redux actions/reducers - essentially merging them together - so our actionCreators (and respective actions returned from them) look like this:

```
  const someAction = () => ({
    type: 'Anything that serves you well as action identifier (ideally a string) - used only in logging',
    doNotLog: false, // optional, if true the action is ignored by redux-logger middleware
    path: ['path', 'to', 'changed', 'substate'], // optional, without path you'll receive the whole state
    payload: {any: 'data'}, // passed to reducer, again mostly usefull for clearer logging
    reducer: (substateDefinedByPath, payload) => newSubstate
  })
```

This means the actions are no longer serializable so you can't use time-travel, but all other features of redux dev-tools still work.

## Sass and Css

You should write styles in `Component.scss` and then import a `.css` file in `Component.js`:

```
import './Component.css'
```

The required `.css` files are created automatically by `node-sass-chokidar`, and are ignored (as they are essentially build files) by `.gitignore`.
