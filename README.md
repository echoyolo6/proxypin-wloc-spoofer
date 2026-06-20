# ProxyPin WLOC Response Rewriter

[中文文档](README.zh-CN.md) | English

ProxyPin script for authorized iOS location testing. It intercepts Apple WLOC
responses for `gs-loc-cn.apple.com/clls/wloc` and `gs-loc.apple.com/clls/wloc`,
then rewrites the latitude/longitude values inside the original binary response.

This is not an Apple CVE or a remote exploit. It only works on a device where
the user has explicitly installed and trusted the ProxyPin CA certificate and
routes traffic through ProxyPin.

## What It Does

- Preserves the original binary WLOC request body.
- Handles gzip-compressed Apple WLOC responses.
- Rewrites location fields in the original protobuf-like WLOC payload.
- Returns debug headers such as `X-WLOC-ProxyPin`, `X-WLOC-Patched-Locations`,
  and `X-WLOC-Error`.

## Files

- `proxypin_wloc_compat_v2.js`: ProxyPin JavaScript script.
- `proxypin_script_config.example.json`: Example remote script config for ProxyPin.
- `LICENSE`: MIT license for this project.
- `NOTICE`: Third-party notice for pako.

## Usage

1. Host `proxypin_wloc_compat_v2.js` on an HTTPS URL.
2. Edit `proxypin_script_config.example.json` and replace the `remoteUrl`.
3. Import or refresh that config in ProxyPin.
4. Install and trust the ProxyPin CA certificate on the iOS test device.
5. Enable HTTPS capture in ProxyPin.
6. Trigger location on the test device.

The script is working when the intercepted WLOC response contains headers like:

```text
X-WLOC-ProxyPin: v5.3.0
X-WLOC-Origin-Status: 200
X-WLOC-Patched-Locations: 1
```

If `X-WLOC-Origin-Status` is `400`, the Apple server rejected the original
request before the response could be rewritten.

## Change Coordinates

Edit these constants near the top of `proxypin_wloc_compat_v2.js`:

```js
var TARGET_LONGITUDE = 113.94114;
var TARGET_LATITUDE = 22.544577;
var TARGET_ACCURACY = 25;
```

After changing the script, update the query string in your ProxyPin remote URL,
for example:

```text
https://example.com/proxypin_wloc_compat_v2.js?version=5.3.1
```

ProxyPin may cache remote scripts, so changing the version query helps force a
refresh.

## Scope

This project is intended for:

- Authorized device testing.
- QA workflows that need repeatable iOS network-location behavior.
- Security research in a controlled local proxy environment.

Do not use it on devices or networks you do not own or have permission to test.

## Notes

This modifies Apple network-location WLOC responses. It does not directly modify
GPS hardware readings, and iOS may prefer real GPS when GPS signal is strong.
