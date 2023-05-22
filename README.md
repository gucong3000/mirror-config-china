mirror-config-china
===========

[![NPM version](https://img.shields.io/npm/v/mirror-config-china)](https://www.npmjs.com/package/mirror-config-china)
[![Linux](https://img.shields.io/github/actions/workflow/status/gucong3000/mirror-config-china/node.yml?&label=Linux)](https://github.com/gucong3000/mirror-config-china/actions)
[![Windows](https://img.shields.io/github/actions/workflow/status/gucong3000/mirror-config-china/node_win.yml?&label=Windows)](https://github.com/gucong3000/mirror-config-china/actions)
[![codecov](https://img.shields.io/codecov/c/github/gucong3000/mirror-config-china.svg)](https://codecov.io/gh/gucong3000/mirror-config-china)
[![David](https://img.shields.io/david/gucong3000/mirror-config-china.svg)](https://david-dm.org/gucong3000/mirror-config-china)

为中国内地的Node.js开发者准备的镜像配置，大大提高node模块安装速度。

## 特性

- 支持Windows和其他操作系统
- 自动配置各个node模块的安装源为淘宝镜像

## 安装

```bash
npm i -g mirror-config-china --registry=https://registry.npmmirror.com
# 查看npm配置
npm config list
# 查看环境变量
source ~/.bashrc && env
```

## 参数

### `--registry=https://registry.npmmirror.com`
registry.npmjs.com 镜像URL

### `--bin-mirrors-prefix=https://cdn.npmmirror.com/binaries`
npmmirror.com/mirrors 镜像URL，会覆盖下文中的`{bin-mirrors}`

### `--xxx-mirrors-prefix=https://some.com/mirrors`
自定义镜像URL字面量`{xxx-mirrors}`

### `--http-proxy=https://my.proxy.com`
### `--https-proxy=https://my.proxy.com`
代理配置，默认从操作系统设置中读取

### `--disturl={bin-mirrors}/node` (别名: `--node-mirror`、`--nodejs-org-mirror`)
nodejs.org/dist 镜像URL 默认值为`{bin-mirrors}/node`

### 其他
其他参数将被写入`.npmrc`文件中，如

```bash
# 在`~/.npmrc`加入自定义设置项 canvas-binary-mirror
mirror-config-china --ali-mirrors-prefix=https://mirrors.aliyun.com --canvas-binary-mirror={ali-mirrors}/canvas-prebuilt

npm i -g mirror-config-china --canvas-binary-mirror=https://mirrors.aliyun.com/canvas-prebuilt
```

## 安装成功后，针对以下组件的镜像URL，将被写入npm用户配置文件(~/.npmrc)中

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

## 环境变量自动设置

Windows 下会写入注册表:`HKLM/SYSTEM/CurrentControlSet/Control/Session Manager/Environment`

其他系统会写入文件:`/etc/profile.d/node.sh`

自动将当前的代理设置写入`https_proxy`、`http_proxy`

[Homebrew](https://brew.sh/index_zh-cn)`HOMEBREW_BOTTLE_DOMAIN` 写入国内源（清华）

Node.js IO.js 的镜像下载地址镜像写入`NVM_NODEJS_ORG_MIRROR`、`N_NODE_MIRROR` 等几个环境变量

-[Node Version Manager](https://github.com/creationix/nvm)
-[n](https://github.com/tj/n)
-[nodist](https://github.com/marcelklehr/nodist)
-[Node Version Manager for Windows](https://github.com/hakobera/nvmw)

PATH 环境变量中加入`node_modules/.bin`这个路径，方便调用 mocha、eslint 等命令行工具

 (Windows 下 Path 为`node_modules\\.bin;%Path%` )

## 为项目生成镜像配置文件

```
cd ~/my-project
mirror-config-china --registry=https://registry.npmmirror.com
```
