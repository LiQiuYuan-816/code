function execute(url) {
    // ===== LẤY DỮ LIỆU TRANG CHI TIẾT =====
    let doc = fetch(url).html();

    // Tạo link tuyệt đối đến file stories.json
    let urlObj = new URL(url);
    let pathParts = urlObj.pathname.split("/").filter(p => p);
    let currentSlug = pathParts.length >= 2 ? pathParts[pathParts.length - 2] : "";
    let storiesJsonUrl = `${urlObj.origin}/web-doc-truyen/stories.json`;

    // Tải dữ liệu từ stories.json
    let storiesData = [];
    try {
        storiesData = fetch(storiesJsonUrl).json() || [];
    } catch (e) {
        storiesData = [];
    }

    // Tìm thông tin truyện trong stories.json theo slug
    let jsonInfo = {};
    if (currentSlug && storiesData.length > 0) {
        jsonInfo = storiesData.find(s => s.slug === currentSlug) || {};
    }

    // ===== TRỊ GIÁ ƯU TIÊN: JSON trước → trang chi tiết sau =====
    let name = jsonInfo.title ||
               doc.querySelector(".novel-title")?.textContent?.trim() ||
               "Truyện";

    let author = jsonInfo.author ||
                 (doc.querySelector(".author")?.textContent || "").replace("✍️", "").trim() ||
                 "Chưa cập nhật";

    let totalChapters = jsonInfo.chapters || "?";
    let cover = jsonInfo.cover || doc.querySelector(".cover-image img")?.src || "";

    // ===== LẤY THÔNG TIN TỪ TRANG CHI TIẾT =====
    let status = "Chưa rõ";
    let category = "Tổng hợp";

    // Trạng thái & số chương từ trang
    let metaText = doc.querySelector(".novel-meta")?.textContent || "";
    if (metaText.includes("Hoàn thành")) status = "Hoàn thành";
    if (metaText.includes("Đang tiến hành")) status = "Đang tiến hành";
    let chapMatch = metaText.match(/(\d+)\s*chương/);
    if (chapMatch) totalChapters = chapMatch[1];

    // Thể loại / Thẻ
    let tags = [];
    doc.querySelectorAll(".tag-line span").forEach(el => {
        let t = (el.textContent || "").trim();
        if (t) tags.push(t);
    });
    if (tags.length > 0) category = tags.join(" · ");

    // Mô tả / Văn án
    let description = doc.querySelector(".section .content")?.textContent?.trim() || "Chưa có mô tả.";

    // ===== LẤY DANH SÁCH CHƯƠNG TỪ MỤC LỤC =====
    let chapters = [];
    doc.querySelectorAll("section li a").forEach(a => {
        let href = a.getAttribute("href");
        let title = (a.textContent || "").trim();
        if (href && title) {
            let chapUrl = new URL(href, url).href;
            chapters.push({ title: title, url: chapUrl });
        }
    });

    // ===== TRẢ KẾT QUẢ =====
    return Response.success({
        name: name,
        cover: cover,
        author: author,
        description: description,
        status: status,
        category: category,
        totalChapters: totalChapters,
        chapters: chapters
    });
}