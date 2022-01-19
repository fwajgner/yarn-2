# @scope/package-name

- Manager pakietów: [Yarn 2](https://yarnpkg.com/getting-started) (codename berry).
- Automatyzacja: [Webpack v5](https://webpack.js.org/api/)
- Transpilacja: [Typescript v4](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-4.html)
- Linter: [Eslint v7](https://eslint.org/docs/user-guide/getting-started)
- Code formatter: [Prettier](https://prettier.io/docs/en/index.html)
- Git hooks: [Husky v7](https://typicode.github.io/husky/#/)

Domyślna integracja z vscode, w przypadku innego edytora należy uruchomić komendę `yarn sdks nazwa_edytora`, [link do obsługiwanych edytorów](https://yarnpkg.com/getting-started/editor-sdks)

W przypadku wprowadzania zmian do repozytorium należy przedtem jednorazowo uruchomić husky w sklonowanym repo, za pomocą `yarn husky install`. Dzięki temu przed każdym commitem husky uruchomi skrypt z folderu .husky -> auto formatowanie kodu (prettier) oraz sprawdzenie reguł lintera (ESLint).

Na dystrybucjach Linuxa trzeba uruchomić dodatkowo `chmod +x .husky/pre-commit`, aby nadać uprawniena do wykonywania skryptowi lub `yarn dlx husky-init --yarn2 && yarn` wtedy cały husky zainicjuje się w projekcie od nowa (zawartość skryptu pre-commit zostanie utracona).

# Uruchomienie

`yarn install`

`yarn start < --env PORT=3000 >`

# Budowanie

`yarn build < --env BUILD_PATH=dist >`
