## Setup

To install and run

```
yarn
yarn start
```

We don't have lint-staged, or any other method to enforce styling as a pre-commit hook (lint-staged does not work well without it being setup in root dir), so you might want to setup prettier/eslint in your editor of choice (or run the fix script before submitting PR).

## Sass and Css

You should write styles in `Component.scss` and then import a `.css` file in `Component.js`:

```
import './Component.css'
```

The required `.css` files are created automatically by `node-sass-chokidar`, and are ignored (as they are essentially build files) by `.gitignore`.
