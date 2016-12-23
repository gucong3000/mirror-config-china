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
