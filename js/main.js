(function () {
  var EMAIL = "order@onze-atelier.jp";
  var form = document.getElementById("order-form");
  if (!form) return;

  var alertBox = document.getElementById("form-alert");
  var draft = document.getElementById("draft");
  var draftText = document.getElementById("draft-text");
  var copyBtn = document.getElementById("copy-draft");

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

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (valueOf("company")) return;

    var name = valueOf("name");
    var email = valueOf("email");
    var age = valueOf("age");
    var plan = valueOf("plan");
    var errors = [];

    invalidate("name", !name);
    invalidate("email", !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
    invalidate("age", !age);
    invalidate("plan", !plan);

    if (!name) errors.push("お名前を書いてください。");
    if (!email) errors.push("メールアドレスを書いてください。");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("メールアドレスの形を確認してください。");
    if (!age) errors.push("選手の年代を選んでください。");
    if (!plan) errors.push("写真立てか、キャンバスか、まだ決めていないかを選んでください。");

    alertBox.replaceChildren();
    if (errors.length) {
      errors.forEach(function (message) {
        var p = document.createElement("p");
        p.textContent = message;
        alertBox.appendChild(p);
      });
      alertBox.hidden = false;
      alertBox.focus();
      return;
    }

    alertBox.hidden = true;
    var body = [
      "Kepty Proへの依頼",
      "",
      "お名前: " + name,
      "メール: " + email,
      "選手の年代: " + age,
      "希望: " + plan,
      "サイズ: " + (valueOf("size") || "未定"),
      "置く場所: " + (valueOf("place") || "未定"),
      "",
      valueOf("message") || "（本文なし）"
    ].join("\n");

    draft.hidden = false;
    draftText.value = body;
    if (copyBtn) copyBtn.textContent = "文面をコピーする";

    window.location.href = "mailto:" + EMAIL
      + "?subject=" + encodeURIComponent("Kepty Proへの依頼（" + plan + "）")
      + "&body=" + encodeURIComponent(body);
    draftText.focus();
  });

  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var text = draftText.value;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          copyBtn.textContent = "コピーしました";
        }, function () {
          draftText.select();
          copyBtn.textContent = "文面を選択しました";
        });
      } else {
        draftText.select();
        copyBtn.textContent = "文面を選択しました";
      }
    });
  }
})();
