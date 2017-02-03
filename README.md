mirror-config-china
===========

[![NPM version](https://img.shields.io/npm/v/mirror-config-china.svg?style=flat-square)](https://www.npmjs.com/package/mirror-config-china)
[![AppVeyor](https://img.shields.io/appveyor/ci/gucong3000/mirror-config-china.svg)](https://ci.appveyor.com/project/gucong3000/mirror-config-china)
[![Coverage Status](https://img.shields.io/coveralls/gucong3000/mirror-config-china.svg)](https://coveralls.io/r/gucong3000/mirror-config-china)

为中国内地的Node.js开发者准备的镜像配置，大大提高node模块安装速度。

## 特性

- 支持Windows和其他操作系统
- 自动配置各个node模块的安装源为淘宝镜像

## 安装

### Windows

**管理权限下运行**：

```bash
npm i -g mirror-config-china --registry=http://registry.npm.taobao.org && exit
```

### Linux
```bash
$ sudo npm i -g mirror-config-china --registry=http://registry.npm.taobao.org && exit
```

## 针对以下组件的镜像地址，将被写入环境变量和npm全局配置文件中

- [ChromeDriver](https://www.npmjs.com/package/chromedriver)
- [Electron](https://www.npmjs.com/package/electron)
- [git-win](https://www.npmjs.com/package/git-win)
- [node-gyp](https://github.com/nodejs/node-gyp)
- [node-sass](https://www.npmjs.com/package/node-sass)
- [node-sqlite3](https://www.npmjs.com/package/node-sqlite3)
- [nodist](https://github.com/marcelklehr/nodist)
- [nvm-windows](https://github.com/coreybutler/nvm-windows)
- [nvm](https://github.com/creationix/nvm)
- [OperaDriver](https://www.npmjs.com/package/operadriver)
- [phantomjs](https://www.npmjs.com/package/phantomjs)
- [selenium-standalone](https://www.npmjs.com/package/selenium-standalone)
- [windows-build-tools](https://www.npmjs.com/package/windows-build-tools)
