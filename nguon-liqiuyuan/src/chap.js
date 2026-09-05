function execute(url) {
    let doc = fetch(url).html();

    // ===== LẤY TIÊU ĐỀ CHƯƠNG =====
    let chapterTitle = doc.querySelector(".novel-meta span")?.textContent?.trim() ||
                       doc.querySelector(".novel-title")?.textContent?.trim() ||
                       "Chương";

    // ===== LẤY NỘI DUNG CHƯƠNG =====
    let contentParts = [];
    let contentEl = doc.querySelector(".chapter-content") || doc.querySelector("main .content");

    if (contentEl) {
        // Duyệt tất cả thẻ <p> trong nội dung → giữ nguyên xuống dòng
        let paragraphs = contentEl.querySelectorAll("p");
        paragraphs.forEach(p => {
            let text = p.textContent?.trim() || "";
            if (text) contentParts.push(text);
        });
    }

    // Trường hợp không tìm thấy cấu trúc → lấy toàn bộ văn bản trong main
    if (contentParts.length === 0) {
        let mainEl = doc.querySelector("main");
        if (mainEl) {
            let allText = mainEl.textContent || "";
            allText = allText.replace(/📑 Mục lục[\s\S]*?⏭ Chương sau/g, "");
            allText = allText.replace(/📌 Kẹp sách[\s\S]*$/g, "");
            allText = allText.replace(/(^\s*|\s*$)/g, "");
            contentParts = allText.split(/\n\s*\n/).filter(p => p.trim());
        }
    }

    // ===== TRẢ KẾT QUẢ =====
    let result = "### " + chapterTitle + "\n\n";

    if (contentParts.length > 0) {
        result += contentParts.join("\n\n");
    } else {
        result += "⚠️ Không trích xuất được nội dung chương.";
    }

    return Response.success(result);
}