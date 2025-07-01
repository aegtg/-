(async () => {
  // ==== 配置部分 ====
  const CONFIG = {
    jsonUrl: "https://raw.githubusercontent.com/aegtg/-/main/accounts.json", // ✅ 已替换成你的地址
    debug: true // 控制是否打印日志
  };

  function log(...args) {
    if (CONFIG.debug) console.log("[AutoForm]", ...args);
  }

  // ==== 读取当前账号（从 cookie 中读取 email） ====
  const currentEmail = document.cookie
    .split("; ")
    .find(row => row.startsWith("email="))
    ?.split("=")[1];

  if (!currentEmail) return alert("❌ 未找到 email Cookie，请先设置 document.cookie = 'email=xxx@gmail.com'");

  log("当前邮箱:", currentEmail);

  // ==== 拉取配置数据 ====
  const res = await fetch(CONFIG.jsonUrl);
  const accounts = await res.json();

  const data = accounts[currentEmail];
  if (!data) {
    alert("⚠️ 未在配置中找到该邮箱的数据: " + currentEmail);
    return;
  }

  log("匹配数据:", data);

  // ==== 智能填写函数 ====
  function fillInput(keyword, value) {
    if (!value) return;

    const keywordLc = keyword.toLowerCase();

    const allInputs = Array.from(document.querySelectorAll("input, textarea"));
    const target = allInputs.find(el => {
      const labelText = el.closest("label")?.innerText || "";
      const placeholder = el.placeholder || "";
      const name = el.name || "";
      const aria = el.getAttribute("aria-label") || "";
      return (
        labelText.toLowerCase().includes(keywordLc) ||
        placeholder.toLowerCase().includes(keywordLc) ||
        name.toLowerCase().includes(keywordLc) ||
        aria.toLowerCase().includes(keywordLc)
      );
    });

    if (target) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        Object.getPrototypeOf(target),
        "value"
      )?.set;
      nativeInputValueSetter?.call(target, value);
      target.dispatchEvent(new Event("input", { bubbles: true }));
      log(`✔ 填写 ${keyword}:`, value);
    } else {
      log(`❌ 未找到字段: ${keyword}`);
    }
  }

  // ==== 执行填写 ====
  fillInput("email", currentEmail);
  fillInput("twitter", data.twitter);
  fillInput("discord", data.discord);
  fillInput("telegram", data.telegram);

  log("✅ 填写完成");
})();

