mirror-config-china
===========

为中国内地的Node.js开发者准备的镜像配置，大大提高node模块安装速度。

## 特性
- 支持Windows和其他操作系统
- 自动配置各个node模块的安装源为淘宝镜像

## 安装

```bash
sudo npm i -g mirror-config-china
sudo bash -c "/etc/profile.d/mirrors.sh"
```

## 其他

- Windows下无请使用`npm i -g mirror-config-china`命令安装
- 安好后应重启命令行窗口或者注销后重新登录才能生效
- [查看具体镜像配置](lib/mirrors.js)

## 支持下载加速的名单
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
