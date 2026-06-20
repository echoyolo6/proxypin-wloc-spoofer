# ProxyPin WLOC 响应重写脚本

中文 | [English](README.md)

这是一个用于授权 iOS 定位测试的 ProxyPin 脚本。它拦截 Apple WLOC
接口响应：

- `gs-loc-cn.apple.com/clls/wloc`
- `gs-loc.apple.com/clls/wloc`

然后在原始二进制响应包里替换经纬度字段。

这不是 Apple CVE，也不是远程漏洞。它只能在用户主动安装并信任
ProxyPin CA 证书、并让设备流量经过 ProxyPin 的测试环境里生效。

## 功能

- 保留原始 WLOC 二进制请求体，避免 ProxyPin 把 body 重编码坏。
- 支持 gzip 压缩的 WLOC 响应。
- 在原始响应包结构中替换经纬度。
- 通过响应头输出调试信息，例如：
  - `X-WLOC-ProxyPin`
  - `X-WLOC-Origin-Status`
  - `X-WLOC-Patched-Locations`
  - `X-WLOC-Error`

## 使用方法

1. 把 `proxypin_wloc_compat_v2.js` 放到一个 HTTPS 静态地址。
2. 修改 `proxypin_script_config.example.json` 里的 `remoteUrl`。
3. 在 ProxyPin 中导入或刷新脚本配置。
4. 在 iOS 测试设备上安装并信任 ProxyPin CA。
5. 开启 HTTPS 抓包。
6. 触发系统定位。

正常情况下，WLOC 响应头应出现：

```text
X-WLOC-ProxyPin: v5.3.0
X-WLOC-Origin-Status: 200
X-WLOC-Patched-Locations: 大于 0
```

如果看到：

```text
X-WLOC-Origin-Status: 400
```

说明 Apple 服务端拒绝了原始请求，脚本还没机会修改有效响应。

## 修改坐标

打开 `proxypin_wloc_compat_v2.js`，修改：

```js
var TARGET_LONGITUDE = 113.94114;
var TARGET_LATITUDE = 22.544577;
var TARGET_ACCURACY = 25;
```

每次改脚本后，建议同步修改远程 URL 的版本参数：

```text
https://example.com/proxypin_wloc_compat_v2.js?version=5.3.1
```

ProxyPin 可能会缓存远程脚本，修改版本参数可以强制刷新。

## 适用范围

本项目仅用于：

- 授权设备测试。
- QA 定位场景复现。
- 本地代理环境下的安全研究。

不要在未授权设备或网络上使用。

## 限制

这个脚本修改的是 Apple 网络定位 WLOC 响应，不是直接修改 GPS 硬件读数。
当 GPS 信号强时，iOS 可能优先采用真实 GPS。
