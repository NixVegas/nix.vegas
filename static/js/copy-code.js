// Click a code block to copy its contents to the clipboard.
(function () {
  function flash(pre) {
    pre.classList.add("copied");
    setTimeout(function () {
      pre.classList.remove("copied");
    }, 1200);
  }

  function copyPre(pre) {
    // If the user has actively selected text, don't hijack it — let them copy
    // their selection instead of the whole block.
    var sel = window.getSelection();
    if (sel && sel.toString().length) {
      return;
    }
    var text = pre.innerText.replace(/\n+$/, "");
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        flash(pre);
      }, function () {});
      return;
    }
    // Fallback for non-secure contexts / old browsers.
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      flash(pre);
    } catch (e) {
      /* clipboard unavailable */
    }
    document.body.removeChild(ta);
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("pre").forEach(function (pre) {
      pre.classList.add("copyable");
      pre.setAttribute("title", "Click to copy");
      pre.addEventListener("click", function () {
        copyPre(pre);
      });
    });
  });
})();
