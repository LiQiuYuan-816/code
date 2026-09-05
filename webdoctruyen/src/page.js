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
function normalizeUrl(url) {
    if (!url) return BASE_URL;
    return String(url).replace(/^(?:https?:\/\/)?(?:www\.)?liqiuyuan-816\.github\.io\/web-doc-truyen/i, BASE_URL);
}

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

// ===== LẤY TÊN TRUYỆN TỪ LINK =====
function parseSlug(url) {
    url = normalizeUrl(url).split("#")[0].split("?")[0].replace(/\/+$/, "");
    var match = url.match(/\/stories\/([^\/]+)/i);
    return match ? match[1] : "";
}

// ===== ĐẾM SỐ TRANG CHƯƠNG =====
function parseListPageCountFromDoc(doc) {
    var vanBan = doc.body ? doc.body.textContent : "";
    var match = vanBan.match(/Trang\s+(\d+)\s*\/\s*(\d+)/);
    if (match) {
        return parseInt(match[2]) || 1;
    }
    // Nếu không có phân trang → mặc định 1 trang
    return 1;
}

// ===== HÀM CHÍNH: TRẢ VỀ DANH SÁCH LINK TRANG =====
function execute(url) {
    url = normalizeUrl(url).replace(/\/+$/, "");

    var response = fetch(url, {
        headers: {
            "User-Agent": USER_AGENT || "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) vBook/1.0"
        }
    });

    if (!response.ok) {
        return Response.error("❌ Không tải được trang truyện: " + url);
    }

    var doc = response.html();
    var slug = parseSlug(url);
    var pageCount = parseListPageCountFromDoc(doc);

    if (pageCount < 1) pageCount = 1;

    // Tạo danh sách link tất cả các trang
    var pages = [];
    for (var i = 1; i <= pageCount; i++) {
        var pageUrl = url;
        if (i > 1) {
            // Thêm tham số trang nếu không phải trang 1
            var dauChamHoac = url.indexOf("?");
            if (dauChamHoac < 0) {
                pageUrl = url + "?page=" + i;
            } else {
                pageUrl = url + "&page=" + i;
            }
        }
        // Thêm slug để đồng bộ, giống như mẫu
        if (slug) {
            pageUrl = pageUrl.split("#")[0] + "#slug=" + encodeURIComponent(slug);
        }
        pages.push(pageUrl);
    }

    return Response.success(pages);
}