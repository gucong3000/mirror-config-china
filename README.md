mirror-config-china
===========

[![NPM version](https://img.shields.io/npm/v/mirror-config-china.svg?style=flat-square)](https://www.npmjs.com/package/mirror-config-china)
[![Travis](https://img.shields.io/travis/gucong3000/mirror-config-china.svg?&label=Linux)](https://travis-ci.org/gucong3000/mirror-config-china)
[![AppVeyor](https://img.shields.io/appveyor/ci/gucong3000/mirror-config-china.svg?&label=Windows)](https://ci.appveyor.com/project/gucong3000/mirror-config-china)
[![codecov](https://img.shields.io/codecov/c/github/gucong3000/mirror-config-china.svg)](https://codecov.io/gh/gucong3000/mirror-config-china)
[![David](https://img.shields.io/david/gucong3000/mirror-config-china.svg)](https://david-dm.org/gucong3000/mirror-config-china)

为中国内地的Node.js开发者准备的镜像配置，大大提高node模块安装速度。

## 特性

- 支持Windows和其他操作系统
- 自动配置各个node模块的安装源为淘宝镜像

## 安装

```bash
npm i -g mirror-config-china --registry=https://registry.npm.taobao.org
# 检查是否安装成功
npm config list
```

## 安装成功后，针对以下组件的镜像地址，将被写入npm用户配置文件(~/.npmrc)中

- [ChromeDriver](https://www.npmjs.com/package/chromedriver)
- [Electron](https://www.npmjs.com/package/electron)
- [git-win](https://www.npmjs.com/package/git-win)
- [node-gyp](https://www.npmjs.com/package/node-gyp)
- [node-inspector](https://www.npmjs.com/package/node-inspector)
- [node-sass](https://www.npmjs.com/package/node-sass)
- [node-sqlite3](https://www.npmjs.com/package/node-sqlite3)
- [nodegit](https://www.npmjs.com/package/nodegit)
- [nodist](https://github.com/marcelklehr/nodist)
- [nvm-windows](https://github.com/coreybutler/nvm-windows)
- [nvm](https://github.com/creationix/nvm)
- [OperaDriver](https://www.npmjs.com/package/operadriver)
- [phantomjs](https://www.npmjs.com/package/phantomjs)
- [Puppeteer](https://www.npmjs.com/package/puppeteer)
- [selenium-standalone](https://www.npmjs.com/package/selenium-standalone)
- [windows-build-tools](https://www.npmjs.com/package/windows-build-tools)

## 为项目生成镜像配置

```
cd ~/my-project
mirror-config-china --registry=https://registry.npm.taobao.org
```
