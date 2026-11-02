(function () {
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
