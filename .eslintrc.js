module.exports = {
    env: {
        commonjs: true,
        es2021: true,
        node: true
    },
    extends: [
        'eslint-config-streamr-ts'
    ],
    parserOptions: {
        ecmaVersion: 12,
        requireConfigFile: false
    },
    rules: {
        "space-before-function-paren": ["error", {
            "anonymous": "always",
            "named": "never",
            "asyncArrow": "always"
        }],
    },
    parser: '@babel/eslint-parser'
}
