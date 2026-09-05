function execute(url) {
    let doc = fetch(url).html();

    // ===== LẤY TÊN TRUYỆN =====
    let name = doc.querySelector(".novel-title")?.textContent?.trim() || "Truyện";

    // ===== LẤY DANH SÁCH CHƯƠNG TỪ MỤC LỤC =====
    let chapters = [];
    doc.querySelectorAll("section li a").forEach(a => {
        let href = a.getAttribute("href");
        let chapterTitle = (a.textContent || "").trim();

        if (href && chapterTitle) {
            // Tạo link tuyệt đối từ link tương đối
            let chapterUrl = new URL(href, url).href;
            chapters.push({
                name: chapterTitle,
                url: chapterUrl
            });
        }
    });

    // ===== TRẢ KẾT QUẢ =====
    return Response.success({
        name: name,
        chapters: chapters
    });
}