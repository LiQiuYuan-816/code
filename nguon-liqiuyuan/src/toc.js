// ===== TẢI CẤU HÌNH config.js =====
if (typeof BASE_URL === "undefined" || !BASE_URL) {
    try {
        var _configUrl = new URL("config.js", url);
        var _configText = fetch(_configUrl.href).text();
        eval(_configText);
    } catch (e) {
        var BASE_URL = "https://liqiuyuan-816.github.io/web-doc-truyen/";
        var USER_AGENT = "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) vBook/1.0";
    }
}

// ===== HÀM HỖ TRỢ CHUẨN =====
function absUrl(url) {
    if (!url) return "";
    url = String(url);
    if (url.indexOf("//") === 0) return "https:" + url;
    if (/^https?:\/\//i.test(url)) return url;
    if (url.charAt(0) !== "/" && !BASE_URL.endsWith("/")) url = "/" + url;
    return BASE_URL + url;
}

function cleanText(value) {
    if (!value) return "";
    return String(value)
        .replace(/\u00a0/g, " ")
        .replace(/[\t\f\v]+/g, " ")
        .replace(/\r\n?/g, "\n")
        .replace(/[ \t]*\n[ \t]*/g, "\n")
        .replace(/[ \t]{2,}/g, " ")
        .trim();
}

// ===== HÀM CHÍNH: LẤY DANH SÁCH CHƯƠNG =====
function execute(url) {
    url = absUrl(url);

    var response = fetch(url, {
        headers: {
            "User-Agent": USER_AGENT || "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) vBook/1.0",
            "Referer": BASE_URL
        }
    });

    if (!response.ok) {
        return Response.error("❌ Không tải được mục lục: Lỗi " + response.status);
    }

    var doc = response.html();
    var chapters = [];

    // Lấy danh sách chương từ link
    doc.querySelectorAll("section li a, .chapter-list a, ul.chapters a, .toc-list a").forEach(function(a) {
        var href = a.getAttribute("href");
        var title = cleanText(a.textContent) || cleanText(a.getAttribute("title"));
        if (!title || !href) return;

        // Bỏ các link không phải chương
        if (title.length < 2 || href.indexOf("#") === 0) return;

        chapters.push({
            title: title,
            link: absUrl(href)
        });
    });

    if (chapters.length === 0) {
        return Response.error("⚠️ Không tìm thấy danh sách chương trên trang.");
    }

    return Response.success(chapters);
}