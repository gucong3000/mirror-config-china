mirror-config-china
===========

[![NPM version](https://img.shields.io/npm/v/mirror-config-china)](https://www.npmjs.com/package/mirror-config-china)
[![Linux](https://img.shields.io/github/actions/workflow/status/gucong3000/mirror-config-china/node.yml?&label=Linux)](https://github.com/gucong3000/mirror-config-china/actions)
[![Windows](https://img.shields.io/github/actions/workflow/status/gucong3000/mirror-config-china/node_win.yml?&label=Windows)](https://github.com/gucong3000/mirror-config-china/actions)
[![codecov](https://img.shields.io/codecov/c/github/gucong3000/mirror-config-china.svg)](https://codecov.io/gh/gucong3000/mirror-config-china)
[![David](https://img.shields.io/david/gucong3000/mirror-config-china.svg)](https://david-dm.org/gucong3000/mirror-config-china)

为中国内地的Node.js开发者准备的镜像配置，大大提高node模块安装成功率和速度。

## 特性

- 自动配置 npm 注册表为国内镜像`https://registry.npmmirror.com/`
- 自动配置 npm 包的二进制模块的安装源为`https://cdn.npmmirror.com/binaries/`
- 自动配置 git 的 clone 镜像地址为`https://gitclone.com/github.com/`

## 安装

```bash
npm i -g mirror-config-china --registry=https://registry.npmmirror.com
# 查看npm配置
npm config list
# 查看环境变量
source ~/.bashrc && env
```

## 命令行参数

- `--registry=https://registry.npmmirror.com`
  `https://registry.npmjs.org/`的镜像地址
- `--disturl=https://cdn.npmmirror.com/binaries/node`
  `https://nodejs.org/dist/`的镜像地址
- `--bin-mirror-prefix=https://cdn.npmmirror.com/binaries`
  二进制文件下载镜像站地址

以上信息存入`.npmrc`文件

### 自定义其他镜像

你可以使用自定义参数，向`.npmrc`文件中添加更多内容，如

```bash
# 在当前目录`./.npmrc`加入自定义设置项 canvas-binary-mirror
mirror-config-china --my-mirror-prefix=https://mirrors.aliyun.com --canvas-binary-mirror={my-mirror}/canvas-prebuilt

# 功能同上，但信息储存在家目录`~/.npmrc`
npm i -g mirror-config-china --canvas-binary-mirror=https://mirrors.aliyun.com/canvas-prebuilt
```

## 环境变量设置

写入位置：

  - POSIX: 文件：`/etc/profile.d/node.sh`
  - Windows: 注册表：`HKLM/SYSTEM/CurrentControlSet/Control/Session Manager/Environment`

需要重启终端，环境变量才生效

写入内容:

  - `NODEJS_ORG_MIRROR`(通用，如[node-gyp](https://github.com/nodejs/node-gyp/))
  - `NODE_MIRROR`(通用)
  - `NVM_NODEJS_ORG_MIRROR`(仅 POSIX，供[Node Version Manager](https://github.com/nvm-sh/nvm/#use-a-mirror-of-node-binaries)使用)
  - `N_NODE_MIRROR`(仅 POSIX，供[n](https://github.com/tj/n#custom-source)使用)
  - `NVMW_NODEJS_ORG_MIRROR`(仅 Windows，供[Node Version Manager for Windows](https://github.com/hakobera/nvmw#mirror-nodejsiojsnpm-dist)使用)
  - `NODIST_NODE_MIRROR`(仅 Windows，供[nodist](https://github.com/nullivex/nodist#settings)使用)

以上环境变量的值将完全相同，并与`.npmrc`中的`disturl`保持一致

  - `export PATH=node_modules/.bin:$PATH`(仅 POSIX)
  - `setx /M Path "node_modules\.bin;%Path%"`(仅 Windows)

PATH 环境变量中加入`node_modules/.bin`这个路径，方便调用`mocha`、`eslint`和本工具的命令行工具，可能需要重启终端才能生效

## 支持安装加速的 NPM 包

安装或运行成功后，针对以下组件的镜像URL，将被写入npm用户配置文件(`~/.npmrc`或`./.npmrc`)中

- [ChromeDriver](https://www.npmjs.com/package/chromedriver)
- [Electron](https://www.npmjs.com/package/electron)
- [git-win](https://www.npmjs.com/package/git-win)
- [node-gyp](https://www.npmjs.com/package/node-gyp)
- [node-inspector](https://www.npmjs.com/package/node-inspector)
- [node-sass](https://www.npmjs.com/package/node-sass)
- [sqlite3](https://www.npmjs.com/package/sqlite3)
- [nodegit](https://www.npmjs.com/package/nodegit)
- [nodist](https://github.com/marcelklehr/nodist)
- [nvm-windows](https://github.com/coreybutler/nvm-windows)
- [nvm](https://github.com/creationix/nvm)
- [OperaDriver](https://www.npmjs.com/package/operadriver)
- [phantomjs](https://www.npmjs.com/package/phantomjs)
- [Puppeteer](https://www.npmjs.com/package/puppeteer)
- [selenium-standalone](https://www.npmjs.com/package/selenium-standalone)
- [windows-build-tools](https://www.npmjs.com/package/windows-build-tools)
- [@swc/core](https://www.npmjs.com/package/@swc/core)

注：未能全部列出

## 未尽功能

部分 npm 包可能用 git 命令从 github 下载依赖，建议配置镜像：

```bash
# 关闭 https 证书检查
git config --global protocol.https.allow always
# 配置 github 镜像
git config --global url."https://gitclone.com/github.com/".insteadOf "https://github.com/"
# 查看配置文件
cat ~/.gitconfig
```

浏览器中 github 的加速，有待进一步开发相关功能
