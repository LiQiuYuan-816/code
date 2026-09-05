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

// ===== HÀM CHÍNH: LẤY DANH SÁCH THỂ LOẠI =====
function execute() {
    var response = fetch(BASE_URL, {
        headers: {
            "User-Agent": USER_AGENT || "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) vBook/1.0",
            "Referer": BASE_URL
        }
    });

    if (!response.ok) {
        return Response.error("❌ Không tải được danh sách thể loại: Lỗi " + response.status);
    }

    var doc = response.html();
    var list = [];
    var seen = {};

    // Tìm tất cả link thể loại trên trang
    doc.querySelectorAll("a[href*=/the-loai/], a[href*=/tag/], a[href*=/genre/]").forEach(function(a) {
        var title = cleanText(a.textContent);
        var input = absUrl(a.getAttribute("href"));

        if (!title || title.length < 2 || !input || seen[input]) return;

        // Bỏ các mục không phải thể loại
        var boQua = ["Trang", "Tất cả", "Quốc gia", "Thể loại", "Đang đọc", "Tra cứu"];
        var bo = false;
        for (var i = 0; i < boQua.length; i++) {
            if (title.indexOf(boQua[i]) >= 0) { bo = true; break; }
        }
        if (bo) return;

        seen[input] = true;
        list.push({
            title: title,
            input: input,
            script: "list.js"
        });
    });

    // Nếu không có link thể loại riêng → tạo từ nhóm trên trang
    if (list.length === 0) {
        doc.querySelectorAll("li").forEach(function(li) {
            var text = cleanText(li.textContent);
            if (!text || text.length <= 5 || text.length > 30) return;
            if (text.indexOf("Trang") >= 0 || text.indexOf("Tất cả") >= 0) return;

            var title = text.split("\n")[0].replace(/^[-•*]\s*/, "").trim();
            if (!title || title.length < 2 || title.length > 25) return;

            var input = absUrl("?genre=" + encodeURIComponent(title));
            if (!seen[input]) {
                seen[input] = true;
                list.push({
                    title: title,
                    input: input,
                    script: "list.js"
                });
            }
        });
    }

    if (list.length === 0) {
        return Response.error("⚠️ Không tìm thấy danh sách thể loại trên trang.");
    }

    return Response.success(list);
}