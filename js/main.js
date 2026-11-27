(function () {
  var ENDPOINT = "https://formsubmit.co/ajax/contact@kepty.co";
  var form = document.getElementById("order-form");
  if (!form) return;

  var alertBox = document.getElementById("form-alert");
  var done = document.getElementById("order-done");
  var submitBtn = form.querySelector(".submit");
  var sending = false;

  function valueOf(name) {
    var field = form.elements[name];
    return field && field.value ? field.value.trim() : "";
  }

  function invalidate(name, invalid) {
    var field = form.elements[name];
    if (!field) return;
    if (invalid) field.setAttribute("aria-invalid", "true");
    else field.removeAttribute("aria-invalid");
  }

  function validEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validPhone(phone) {
    var digits = phone.replace(/\D/g, "");
    if (digits.indexOf("81") === 0 && digits.length > 2) digits = "0" + digits.slice(2);
    return /^0\d{9,10}$/.test(digits);
  }

  function showErrors(errors) {
    alertBox.replaceChildren();
    errors.forEach(function (message) {
      var p = document.createElement("p");
      p.textContent = message;
      alertBox.appendChild(p);
    });
    alertBox.hidden = false;
    alertBox.focus();
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (sending) return;
    if (valueOf("_honey")) return;

    var name = valueOf("お名前");
    var email = valueOf("email");
    var tel = valueOf("電話番号");
    var plan = valueOf("希望商品");
    var size = valueOf("サイズ");
    var errors = [];

    invalidate("お名前", !name);
    invalidate("email", !email || !validEmail(email));
    invalidate("電話番号", !tel || !validPhone(tel));
    invalidate("希望商品", !plan);
    invalidate("サイズ", !size);

    if (!name) errors.push("お名前を書いてください。");
    if (!email) errors.push("メールアドレスを書いてください。");
    else if (!validEmail(email)) errors.push("メールアドレスの形を確認してください。");
    if (!tel) errors.push("電話番号を書いてください。");
    else if (!validPhone(tel)) errors.push("電話番号の形を確認してください。");
    if (!plan) errors.push("希望商品を選んでください。");
    if (!size) errors.push("サイズを選んでください。");

    if (errors.length) {
      showErrors(errors);
      return;
    }

    alertBox.hidden = true;
    sending = true;
    submitBtn.disabled = true;
    submitBtn.textContent = "送信しています";

    var payload = {
      _subject: "Kepty Proへのお申し込み（" + plan + "）",
      _template: "table",
      _captcha: "false",
      _replyto: email,
      email: email,
      お名前: name,
      メールアドレス: email,
      電話番号: tel,
      希望商品: plan,
      サイズ: size,
      相談内容: valueOf("相談内容") || "（なし）"
    };

    fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(payload)
    }).then(function (response) {
      return response.text().then(function (text) {
        var data = {};
        try { data = JSON.parse(text); } catch (error) { data = {}; }
        if (!response.ok || String(data.success) !== "true") {
          throw new Error(data.message || "rejected");
        }
        form.hidden = true;
        done.hidden = false;
        done.focus();
      });
    }).catch(function () {
      sending = false;
      submitBtn.disabled = false;
      submitBtn.textContent = "送信する";
      showErrors(["送信できませんでした。しばらくしてから、もう一度お試しください。"]);
    });
  });
})();
