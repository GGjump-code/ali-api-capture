# Ali API Capture Tool

🎯 基于 Puppeteer 的网页 API 请求监听脚本。支持自动打开网页、监听登录后请求、统计接口调用次数，并导出为 Markdown 报表。

---

## ✨ 功能特点

- 🕵️ 实时监听所有 `xhr/fetch` 类型的 API 请求
- 🔐 支持登录后地址跳转、页面重定向、新 tab 打开
- 🧠 自动统计每个 API 被调用的次数
- 📋 Markdown 格式导出请求日志
- ✅ 支持命令行传入目标网址
- 🧑‍💻 控制台输入 `exit` 手动终止监听

---

## 🚀 使用方法

```bash
npm install
node capture.js https://www.aliwork.com/# ali-api-capture

