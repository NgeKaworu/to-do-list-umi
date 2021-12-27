## Ecmascript Development Kit

常用工具集

建议使用 git subtree 引入项目

```sh
# 添加加远端URL
git remote add -f js-sdk https://github.com/NgeKaworu/js-sdk.git

# 添加subtree -P --prefix 前缀的缩写  --squash 是压缩成一个
git subtree add -P src/js-sdk js-sdk master --squash
# 拉取 subtree
git subtree pull -P src/js-sdk js-sdk master --squash
# 推送 subtree
git subtree push -P src/js-sdk js-sdk master

```
