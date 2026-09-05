load('config.js');
const PAGE_SIZE = 5;

function execute(url, page) {
    let currentPage = page ? parseInt(page) : 1;
    let res = fetch(url);
    if (!res.ok) return Response.error("Lỗi tải: " + res.status);
    let doc = res.html();

    // === LẤY DANH SÁCH LI TỪ HTML ===
    // Tìm tất cả <li> nằm trong ul#story-list
    let items = [];
    try {
        items = doc.querySelectorAll("ul#story-list li");
    } catch (e) {
        try {
            items = doc.querySelectorAll(".story-list li");
        } catch (e2) {
            // Fallback: lấy tất cả <li> trên trang
            items = doc.querySelectorAll("li");
        }
    }

    if (!items || items.length === 0) {
        return Response.success([], null);
    }

    let allList = [];
    for (let i = 0; i < items.length; i++) {
        let item = items[i];
        let linkEl = null;
        try {
            linkEl = item.querySelector("a");
        } catch (e) {
            continue;
        }
        if (!linkEl) continue;

        let name = "";
        try {
            name = linkEl.textContent || "";
        } catch (e) {
            continue;
        }
        name = name.trim();
        if (!name) continue;

        let href = linkEl.getAttribute("href") || "";
        if (!href) continue;

        let fullLink = href.indexOf("http") === 0 ? href : BASE_DOMAIN + href;
        let text = "";
        try {
            text = item.textContent || "";
        } catch (e) {
            text = name;
        }

        // Tách thông tin
        let author = "Không rõ";
        let authorMatch = text.match(/✍️\s*([^·\n]+)/);
        if (authorMatch && authorMatch[1]) {
            author = authorMatch[1].trim();
        }

        let isCompleted = text.indexOf("✅ Hoàn thành") >= 0;

        let chapNum = "?";
        let chapMatch = text.match(/📖\s*(\d+)\s*chương/);
        if (chapMatch && chapMatch[1]) {
            chapNum = chapMatch[1];
        }

        allList.push({
            name: name,
            link: fullLink,
            author: author,
            description: author + " · " + (isCompleted ? "Hoàn thành" : "Đang tiến hành") + " · " + chapNum + " chương",
            totalChapters: chapNum,
            status: isCompleted ? "Hoàn thành" : "Đang tiến hành"
        });
    }

    // Phân trang
    let totalPages = Math.ceil(allList.length / PAGE_SIZE);
    let start = (currentPage - 1) * PAGE_SIZE;
    let pageData = [];
    for (let p = start; p < start + PAGE_SIZE && p < allList.length; p++) {
        pageData.push(allList[p]);
    }
    let nextPage = currentPage < totalPages ? String(currentPage + 1) : null;

    return Response.success(pageData, nextPage);
}