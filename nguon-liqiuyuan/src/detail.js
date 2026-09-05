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

function firstText(doc, selectors) {
    if (!Array.isArray(selectors)) selectors = [selectors];
    for (var i = 0; i < selectors.length; i++) {
        var el = doc.querySelector(selectors[i]);
        if (el) {
            var text = cleanText(el.textContent);
            if (text) return text;
        }
    }
    return "";
}

// ===== HÀM CHÍNH: LẤY THÔNG TIN TRUYỆN =====
function execute(url) {
    url = absUrl(url);

    var response = fetch(url, {
        headers: {
            "User-Agent": USER_AGENT || "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) vBook/1.0",
            "Referer": BASE_URL
        }
    });

    if (!response.ok) {
        return Response.error("❌ Không tải được trang truyện: Lỗi " + response.status);
    }

    var doc = response.html();

    var name = firstText(doc, [".novel-title", "h1", ".book-title", "title"]);
    var author = firstText(doc, [".novel-author", ".author", ".book-author"]);
    var coverEl = doc.querySelector(".novel-cover img, .book-cover img, .cover img, img.cover");
    var cover = coverEl ? absUrl(coverEl.getAttribute("src")) : "";
    var intro = firstText(doc, [".novel-intro", ".book-intro", ".summary", ".description", "main > p"]);

    if (!name) {
        return Response.error("⚠️ Không tìm thấy tên truyện trên trang.");
    }

    return Response.success({
        name: name,
        author: author || "Không rõ",
        cover: cover,
        description: intro || "Chưa có mô tả.",
        host: BASE_URL
    });
}