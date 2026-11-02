(function () {
  var preloader = document.querySelector(".preloader");
  var recText = document.querySelector("[data-rec-text]");
  if (preloader && recText) {
    var phrase = "Антоша Как Дела ?";
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function closePreloader() {
      preloader.classList.add("is-done");
      window.setTimeout(function () {
        document.documentElement.classList.remove("is-loading");
        preloader.remove();
      }, reduceMotion ? 0 : 460);
    }

    if (reduceMotion) {
      recText.textContent = phrase;
      window.setTimeout(closePreloader, 350);
    } else {
      var index = 0;
      window.setTimeout(function () {
        var timer = window.setInterval(function () {
          index += 1;
          recText.textContent = phrase.slice(0, index);
          if (index >= phrase.length) {
            window.clearInterval(timer);
            window.setTimeout(closePreloader, 720);
          }
        }, 78);
      }, 280);
    }
  } else {
    document.documentElement.classList.remove("is-loading");
  }

  var header = document.querySelector(".site-header");
  var year = document.querySelector("[data-year]");
  var copyButton = document.querySelector("[data-copy-phone]");

  function syncHeader() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });

  if (year) year.textContent = String(new Date().getFullYear());

  if (copyButton) {
    var defaultLabel = copyButton.textContent;
    copyButton.addEventListener("click", function () {
      var phone = copyButton.getAttribute("data-copy-phone");
      if (!navigator.clipboard || !phone) return;
      navigator.clipboard.writeText(phone).then(function () {
        copyButton.textContent = "Номер скопирован";
        window.setTimeout(function () {
          copyButton.textContent = defaultLabel;
        }, 1600);
      }).catch(function () {
        copyButton.textContent = "Скопируйте вручную";
        window.setTimeout(function () {
          copyButton.textContent = defaultLabel;
        }, 1800);
      });
    });
  }

  document.querySelectorAll("[data-filter]").forEach(function (button) {
    button.addEventListener("click", function () {
      var filter = button.getAttribute("data-filter");
      var visible = 0;
      document.querySelectorAll("[data-filter]").forEach(function (item) {
        var active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", active ? "true" : "false");
      });
      document.querySelectorAll(".video-card").forEach(function (card) {
        var show = filter === "all" || card.getAttribute("data-cat") === filter;
        card.hidden = !show;
        if (show) visible += 1;
      });
      var empty = document.querySelector(".empty-videos");
      if (empty) empty.hidden = visible !== 0;
    });
  });

  document.querySelectorAll(".faq-item button").forEach(function (button) {
    button.addEventListener("click", function () {
      var answer = button.nextElementSibling;
      var open = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", open ? "false" : "true");
      if (answer) answer.hidden = open;
    });
  });

  var devPanel = document.querySelector("#dev-panel");
  var openDev = document.querySelector("[data-open-dev]");
  var closeDev = document.querySelector("[data-close-dev]");
  if (devPanel && openDev) {
    document.body.appendChild(devPanel);
    var pinned = false;
    var openTimer = 0;
    var closeTimer = 0;

    var credit = openDev.closest(".footer-dev") || openDev;
    var anchor = document.querySelector("[data-credit-anchor]") || openDev;

    function placeDev() {
      var rect = anchor.getBoundingClientRect();
      var width = Math.min(400, window.innerWidth - 24);
      devPanel.style.width = width + "px";
      var height = devPanel.offsetHeight;
      var left = Math.max(12, Math.min(rect.left, window.innerWidth - width - 12));
      var top = rect.top - height - 10;
      if (top < 12) top = Math.min(rect.bottom + 10, window.innerHeight - height - 12);
      devPanel.style.left = left + "px";
      devPanel.style.top = top + "px";
    }

    function showDev() {
      devPanel.hidden = false;
      openDev.setAttribute("aria-expanded", "true");
      placeDev();
    }

    function hideDev() {
      pinned = false;
      devPanel.hidden = true;
      openDev.setAttribute("aria-expanded", "false");
    }

    credit.addEventListener("mouseenter", function () {
      window.clearTimeout(closeTimer);
      openTimer = window.setTimeout(showDev, 160);
    });
    credit.addEventListener("mouseleave", function () {
      window.clearTimeout(openTimer);
      if (pinned) return;
      closeTimer = window.setTimeout(hideDev, 220);
    });
    devPanel.addEventListener("mouseenter", function () { window.clearTimeout(closeTimer); });
    devPanel.addEventListener("mouseleave", function () {
      if (pinned) return;
      closeTimer = window.setTimeout(hideDev, 220);
    });
    openDev.addEventListener("click", function (event) {
      event.preventDefault();
      if (!devPanel.hidden && pinned) hideDev();
      else {
        pinned = true;
        showDev();
      }
    });
    if (closeDev) closeDev.addEventListener("click", hideDev);
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") hideDev();
    });
    document.addEventListener("click", function (event) {
      if (devPanel.hidden) return;
      if (credit.contains(event.target) || devPanel.contains(event.target)) return;
      hideDev();
    });
    window.addEventListener("resize", function () {
      if (!devPanel.hidden) placeDev();
    });
    window.addEventListener("scroll", function () {
      if (!devPanel.hidden) placeDev();
    }, true);
  }

  try { localStorage.removeItem("theme"); } catch (e) {}

  document.querySelectorAll(".video-frame").forEach(mountVideo);

  function mountVideo(frame) {
    var src = (frame.getAttribute("data-src") || "").trim();
    if (!src) return;

    var embed = toEmbed(src);
    frame.textContent = "";
    frame.classList.add("is-ready");

    if (embed.type === "file") {
      var video = document.createElement("video");
      video.controls = true;
      video.playsInline = true;
      video.preload = "metadata";
      video.src = embed.url;
      frame.appendChild(video);
      return;
    }

    var iframe = document.createElement("iframe");
    iframe.src = embed.url;
    iframe.title = frame.getAttribute("data-title") || "Видео";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    iframe.loading = "lazy";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    frame.appendChild(iframe);
  }

  function toEmbed(src) {
    var youtube = src.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
    if (youtube) return { type: "iframe", url: "https://www.youtube.com/embed/" + youtube[1] };

    var vimeo = src.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vimeo) return { type: "iframe", url: "https://player.vimeo.com/video/" + vimeo[1] };

    if (/\.(mp4|webm|ogg)(\?|#|$)/i.test(src)) return { type: "file", url: src };

    return { type: "iframe", url: src };
  }
})();
