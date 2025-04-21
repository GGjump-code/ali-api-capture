/**
 * 🕵️ API 抓取脚本（支持登录后页面变化、新页面监听）
 *
 * 支持命令行传入 URL，输入 `exit` 手动退出并导出 Markdown 报告
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const readline = require('readline');

const TARGET_URL = process.argv[2] || 'https://www.aliwork.com/';
const logs = [];

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });

  let mainPage = await browser.newPage();
  attachRequestLogger(mainPage, '[主页面]');

  console.log(`📡 正在打开页面：${TARGET_URL}`);
  await mainPage.goto(TARGET_URL, { waitUntil: 'networkidle2' });

  // 👉 监听新页面 / tab 打开
  browser.on('targetcreated', async target => {
    const newPage = await target.page();
    if (newPage) {
      const url = target.url();
      console.log(`🆕 检测到新页面：${url}`);
      attachRequestLogger(newPage, '[新页面]');
    }
  });

  // 👉 监听跳转
  mainPage.on('framenavigated', frame => {
    console.log('🧭 页面跳转到：', frame.url());
  });

  // ✅ 控制台输入 exit 手动结束
  console.log('⏳ 正在监听请求，操作网页后输入 `exit` 并按回车结束...');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.on('line', async (input) => {
    if (input.trim().toLowerCase() === 'exit') {
      rl.close();
      await browser.close();
      exportMarkdown();
    }
  });

})();

// 🧩 请求监听器
function attachRequestLogger(page, tag = '') {
  page.on('request', request => {
    const type = request.resourceType();
    if (type === 'xhr' || type === 'fetch') {
      const info = {
        method: request.method(),
        url: request.url(),
        headers: request.headers(),
        postData: request.postData()
      };
      logs.push(info);
      const urlObj = new URL(info.url);
      console.log(`${tag} [${info.method}] ${urlObj.pathname}`);
    }
  });
}

// 📄 导出 Markdown 报告
function exportMarkdown() {
  const countMap = new Map();

  for (const entry of logs) {
    const urlObj = new URL(entry.url);
    const key = `${entry.method} ${urlObj.pathname}`;
    countMap.set(key, (countMap.get(key) || 0) + 1);
  }

  const mdLines = [
    `# API 请求调用统计 (${new Date().toLocaleString()})`,
    '',
    '| 方法 | API 路径 | 调用次数 |',
    '|------|-----------|----------|',
  ];

  for (const [key, count] of countMap.entries()) {
    const [method, path] = key.split(' ');
    mdLines.push(`| \`${method}\` | \`${path}\` | ${count} |`);
  }

  fs.writeFileSync('api_requests.md', mdLines.join('\n'));
  console.log('✅ 已生成 api_requests.md');
}