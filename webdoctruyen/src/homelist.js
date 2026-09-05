load('config.js');
const PAGE_SIZE = 5;

function execute(url, page) {
    let currentPage = page ? parseInt(page) : 1;

    // === TẢI TRỰC TIẾP stories.json ===
    let jsonUrl = BASE_URL + "stories.json";
    let jsonRes = fetch(jsonUrl);
    if (!jsonRes.ok) return Response.error("⚠️ Không tải được danh sách truyện");

    let stories = [];
    try {
        stories = jsonRes.json() || [];
    } catch (e) {
        return Response.error("⚠️ Dữ liệu JSON không hợp lệ");
    }
    if (!Array.isArray(stories) || stories.length === 0) {
        return Response.success([], null);
    }

    // === CHUYỂN ĐỊNH DẠNG DỮ LIỆU ===
    let allList = [];
    for (let i = 0; i < stories.length; i++) {
        let s = stories[i];
        let slug = s.slug || "";
        let link = BASE_DOMAIN + "/web-doc-truyen/stories/" + slug + "/index.html";

        // Trạng thái
        let status = s.status === "hoan-thanh" ? "Hoàn thành" : "Đang tiến hành";

        // Thể loại
        let genreText = "";
        if (Array.isArray(s.genre) && s.genre.length > 0) {
            genreText = s.genre.join(" · ");
        }

        allList.push({
            name: s.title || "Không có tiêu đề",
            link: link,
            author: s.author || "Không rõ",
            description: (s.author || "Không rõ") + " · " + status + " · " + (s.chapters || 0) + " chương" + (genreText ? " · " + genreText : ""),
            totalChapters: String(s.chapters || "?"),
            status: status
        });
    }

    // === PHÂN TRANG ===
    let totalPages = Math.ceil(allList.length / PAGE_SIZE);
    let start = (currentPage - 1) * PAGE_SIZE;
    let pageData = [];
    for (let p = start; p < start + PAGE_SIZE && p < allList.length; p++) {
        pageData.push(allList[p]);
    }
    let nextPage = currentPage < totalPages ? String(currentPage + 1) : null;

    return Response.success(pageData, nextPage);
}