// ===== TẢI CẤU HÌNH config.js =====
if (typeof BASE_URL === "undefined" || !BASE_URL) {
    try {
        var _configUrl = new URL("config.js", url);
        var _configText = fetch(_configUrl.href).text();
        eval(_configText);
    } catch (e) {
        // Dùng giá trị mặc định nếu tải thất bại
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

// ===== HÀM CHÍNH LẤY NỘI DUNG CHƯƠNG =====
function execute(url) {
    // Chuẩn hóa link
    url = absUrl(url);

    // Tải trang với UA đúng chuẩn
    var response = fetch(url, {
        headers: {
            "User-Agent": USER_AGENT || "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) vBook/1.0",
            "Referer": BASE_URL
        }
    });

    if (!response.ok) {
        return Response.error("❌ Không tải được chương: Lỗi " + response.status);
    }

    var doc = response.html();

    // ===== LẤY TIÊU ĐỀ CHƯƠNG =====
    var chapterTitle = firstText(doc, [
        ".novel-meta span",
        ".novel-title",
        "h1",
        "title"
    ]) || "Chương";

    // ===== LẤY NỘI DUNG CHƯƠNG =====
    var contentParts = [];
    var contentEl = doc.querySelector(".chapter-content") || doc.querySelector("main .content");

    if (contentEl) {
        // Loại bỏ thẻ script/style/quảng cáo trước khi lấy nội dung
        contentEl.querySelectorAll("script, style, noscript, iframe, .ad, .advertisement").forEach(function(el) {
            el.parentNode.removeChild(el);
        });

        // Lấy từng đoạn văn
        var paragraphs = contentEl.querySelectorAll("p");
        paragraphs.forEach(function(p) {
            var text = cleanText(p.textContent);
            if (text) contentParts.push(text);
        });
    }

    // ===== PHƯƠNG ÁN DỰ PHÒNG =====
    if (contentParts.length === 0) {
        var mainEl = doc.querySelector("main");
        if (mainEl) {
            var allText = cleanText(mainEl.textContent);
            // Loại bỏ thanh điều hướng / nút bấm ở đầu và cuối
            allText = allText.replace(/📑 Mục lục[\s\S]*?(?=Đọc tiếp|$)/g, "");
            allText = allText.replace(/📌 Kẹp sách[\s\S]*$/g, "");
            allText = allText.replace(/⏭ Chương sau[\s\S]*$/g, "");
            // Tách thành các đoạn
            contentParts = allText.split(/\n\s*\n/).filter(function(p) {
                return p.trim().length > 10;
            });
        }
    }

    // ===== TRẢ KẾT QUẢ =====
    var result = "### " + chapterTitle + "\n\n";

    if (contentParts.length > 0) {
        result += contentParts.join("\n\n");
    } else {
        return Response.error("⚠️ Không tìm thấy nội dung chương. Cấu trúc trang có thể đã thay đổi.");
    }

    return Response.success(result);
}