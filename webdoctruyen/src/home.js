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

// ===== LẤY DANH SÁCH TRUYỆN TỪ 1 TRANG =====
function layDanhSachTuTrang(doc, pageUrl) {
    var list = [];
    doc.querySelectorAll("li").forEach(function(li) {
        var text = cleanText(li.textContent);
        if (!text || text.length <= 15) return;

        // Bỏ các mục lục, thể loại, phân trang
        var boQua = ["Trang ", "Tất cả", "Quốc gia", "Thể loại", "Đang đọc", "Tra cứu", "Chưa có"];
        var bo = false;
        for (var i = 0; i < boQua.length; i++) {
            if (text.indexOf(boQua[i]) >= 0) { bo = true; break; }
        }
        if (bo) return;

        // Lấy tên truyện — dòng đầu tiên, bỏ dấu gạch đầu dòng
        var dongDau = text.split("\n")[0].replace(/^[-•*]\s*/, "").trim();
        if (!dongDau || dongDau.length < 8) return;

        // Tạo link hợp lệ từ tên truyện
        var link = absUrl("stories/" + encodeURIComponent(dongDau) + "/");

        // Lấy mô tả — các dòng sau đó
        var cacDong = text.split("\n").slice(1).filter(function(d){ return d.trim(); });
        var moTa = cacDong.join(" ").substring(0, 180);

        list.push({
            name: dongDau,
            link: link,
            cover: "",
            description: moTa,
            host: pageUrl
        });
    });
    return list;
}

// ===== TÌM LINK TRANG TIẾP THEO =====
function layLinkTrangTiep(doc, urlHienTai) {
    var vanBan = doc.body ? doc.body.textContent : "";
    var khop = vanBan.match(/Trang\s+\d+\s*\/\s*(\d+)/);
    if (!khop) return null;

    var tongTrang = parseInt(khop[1]) || 1;
    var soTrangHienTai = 1;
    var trangKhop = urlHienTai.match(/[?&]page=(\d+)/i);
    if (trangKhop) soTrangHienTai = parseInt(trangKhop[1]);

    if (soTrangHienTai >= tongTrang) return null;

    var trangTiep = soTrangHienTai + 1;
    var dauCham = urlHienTai.indexOf("?");
    if (dauCham < 0) return urlHienTai + "?page=" + trangTiep;
    return urlHienTai.substring(0, dauCham) + "?page=" + trangTiep;
}

// ===== HÀM CHÍNH: LẤY TOÀN BỘ TRUYỆN =====
function execute(url) {
    url = absUrl(url);
    var tatCaTruyen = [];
    var daLay = {}; // Tránh trùng lặp
    var trangDangLay = url;
    var soTrangDaLay = 0;
    var TOI_DA_TRANG = 25; // Giới hạn an toàn — đủ 23 trang

    // ===== Ưu tiên lấy từ stories.json =====
    var jsonUrl = new URL("stories.json", url).href;
    try {
        var jsonRes = fetch(jsonUrl, {
            headers: { "User-Agent": USER_AGENT || "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) vBook/1.0" }
        });
        if (jsonRes.ok) {
            var data = JSON.parse(jsonRes.text());
            if (Array.isArray(data) && data.length > 0) {
                data.forEach(function(item) {
                    tatCaTruyen.push({
                        name: item.name || item.title || "Truyện không tên",
                        link: absUrl(item.href || item.url || item.link),
                        cover: absUrl(item.cover || item.image || ""),
                        description: cleanText(item.description || item.intro || ""),
                        host: BASE_URL
                    });
                });
                return Response.success(tatCaTruyen);
            }
        }
    } catch (e) {}

    // ===== LẤY TỪ HTML — QUÉT NHIỀU TRANG =====
    while (trangDangLay && soTrangDaLay < TOI_DA_TRANG) {
        soTrangDaLay++;

        var res = fetch(trangDangLay, {
            headers: {
                "User-Agent": USER_AGENT || "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) vBook/1.0",
                "Referer": BASE_URL
            }
        });

        if (!res.ok) break;

        var doc = res.html();
        var trenTrang = layDanhSachTuTrang(doc, trangDangLay);

        // Thêm vào tổng — bỏ qua trùng lặp
        for (var i = 0; i < trenTrang.length; i++) {
            var ten = trenTrang[i].name;
            if (!daLay[ten]) {
                daLay[ten] = true;
                tatCaTruyen.push(trenTrang[i]);
            }
        }

        // Tìm trang tiếp theo
        trangDangLay = layLinkTrangTiep(doc, trangDangLay);
    }

    if (tatCaTruyen.length === 0) {
        return Response.error("⚠️ Không tìm thấy danh sách truyện trên trang.");
    }

    return Response.success(tatCaTruyen);
}