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

// ===== LẤY DANH SÁCH TRUYỆN TỪ TRANG =====
function parseNovelItems(doc) {
    var list = [];
    doc.querySelectorAll("li").forEach(function(li) {
        var text = cleanText(li.textContent);
        if (!text || text.length <= 15) return;

        // Bỏ các mục lục, không phải truyện
        var boQua = ["Trang ", "Tất cả", "Quốc gia", "Thể loại", "Đang đọc", "Tra cứu", "Chưa có"];
        var bo = false;
        for (var i = 0; i < boQua.length; i++) {
            if (text.indexOf(boQua[i]) >= 0) { bo = true; break; }
        }
        if (bo) return;

        // Tách tên truyện — dòng đầu tiên, bỏ dấu gạch đầu dòng
        var dongDau = text.split("\n")[0].replace(/^[-•*]\s*/, "").trim();
        if (!dongDau || dongDau.length < 8) return;

        // Tạo link hợp lệ từ tên truyện
        var link = absUrl("stories/" + encodeURIComponent(dongDau) + "/");

        // Lấy mô tả — các dòng sau
        var cacDong = text.split("\n").slice(1).filter(function(d){ return d.trim(); });
        var moTa = cacDong.join(" ").substring(0, 180);

        list.push({
            name: dongDau,
            link: link,
            cover: "",
            description: moTa,
            host: BASE_URL
        });
    });
    return list;
}

// ===== TÌM LINK TRANG TIẾP THEO =====
function findNextPage(doc, urlHienTai) {
    var vanBan = doc.body ? doc.body.textContent : "";
    var khop = vanBan.match(/Trang\s+(\d+)\s*\/\s*(\d+)/);
    if (!khop) return null;

    var tongTrang = parseInt(khop[2]) || 1;
    var soTrangHienTai = 1;
    var trangKhop = urlHienTai.match(/[?&]page=(\d+)/i);
    if (trangKhop) soTrangHienTai = parseInt(trangKhop[1]);

    if (soTrangHienTai >= tongTrang) return null;

    var trangTiep = soTrangHienTai + 1;
    var dauCham = urlHienTai.indexOf("?");
    if (dauCham < 0) return urlHienTai + "?page=" + trangTiep;
    return urlHienTai.substring(0, dauCham) + "?page=" + trangTiep;
}

// ===== LỌC KẾT QUẢ THEO TỪ KHÓA =====
function locTheoTuKhoa(danhSach, tuKhoa) {
    if (!tuKhoa || tuKhoa.trim() === "") return danhSach;
    var khoa = tuKhoa.trim().toLowerCase();
    return danhSach.filter(function(item) {
        var ten = (item.name || "").toLowerCase();
        var moTa = (item.description || "").toLowerCase();
        return ten.indexOf(khoa) >= 0 || moTa.indexOf(khoa) >= 0;
    });
}

// ===== HÀM CHÍNH: TÌM KIẾM =====
function execute(key, page) {
    var url = page ? normalizeUrl(page) : BASE_URL;

    var response = fetch(url, {
        headers: {
            "User-Agent": USER_AGENT || "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) vBook/1.0"
        }
    });

    if (!response.ok) {
        return Response.error("❌ Không tải được trang tìm kiếm: Lỗi " + response.status);
    }

    var doc = response.html();
    var tatCaTruyen = parseNovelItems(doc);
    var ketQua = locTheoTuKhoa(tatCaTruyen, key);
    var trangTiep = findNextPage(doc, url);

    return Response.success(ketQua, trangTiep);
}