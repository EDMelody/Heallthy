# 伙伴体重记录

简洁的手机端体重趋势页，使用原生 HTML、CSS、JavaScript，无需安装依赖。

## 每日更新

在 `data.js` 的 `records` 数组中追加记录：

```js
{ date: "2026-11-09", person: "于鸿翔", morning: 195.2, evening: 196.0 }
```

缺测时对应数值填 `null`。仅当缺失值两侧都有记录时，图表会按日期间隔线性插值，并以空心点/虚线标记；明细表保留缺失标记，不把估算值当实测值。体重请用 kg。

## 发布

将仓库推送到 GitHub 后，在仓库 **Settings → Pages** 选择从 `main` 分支根目录发布。GitHub Pages 是公开网页，分享链接的人可能转发，网页中的数据也可被公开访问。发布完成后可把 `https://edmelody.github.io/Heallthy/` 发到微信群。
