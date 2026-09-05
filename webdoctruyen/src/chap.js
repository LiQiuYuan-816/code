load('config.js');

function execute(url) {
    try {
        let chapUrl = arguments[0] || url || "";
        if (!chapUrl) return Response.error("⚠️ Không có link chương");

        let res = fetch(chapUrl);
        if (!res.ok) return Response.error("⚠️ Không tải được: " + res.status);

        // === LẤY HTML THÔ — KHÔNG DÙNG .html() ===
        let html = res.text().toString();

        // === CẮT KHỐI NỘI DUNG CHÍNH ===
        let startMark = 'class="content chapter-content"';
        let endMark = "<!-- ===== NAV DƯỚI =====";

        let startPos = html.indexOf(startMark);
        if (startPos === -1) return Response.error("⚠️ Không tìm thấy khối nội dung");
        startPos = html.indexOf(">", startPos) + 1;
        let endPos = html.indexOf(endMark, startPos);
        if (endPos === -1) endPos = html.length;

        let content = html.slice(startPos, endPos);

        // === ✅ GIỮ NGUYÊN THẺ <p> — CHỈ THÊM DÒNG TRỐNG ĐỂ DỄ ĐỌC ===
        // Thay </p> thành </p>\n\n → vẫn giữ thẻ, vẫn tách đoạn rõ ràng
        content = content.split("</p>").join("</p>\n\n");

        // === LÀM SẠCH CÁC THẺ KHÁC (nếu có) ===
        // Bỏ thẻ <script>, <style>, nhưng KHÔNG đụng đến <p>
        while (content.indexOf("<script") !== -1) {
            let s = content.indexOf("<script");
            let e = content.indexOf("</script>", s);
            if (e === -1) break;
            content = content.slice(0, s) + content.slice(e + 9);
        }
        while (content.indexOf("<style") !== -1) {
            let s = content.indexOf("<style");
            let e = content.indexOf("</style>", s);
            if (e === -1) break;
            content = content.slice(0, s) + content.slice(e + 8);
        }

        // === LẤY TIÊU ĐỀ ===
        let chapterTitle = "Nội dung";
        let titleStart = html.indexOf('class="novel-title"');
        if (titleStart !== -1) {
            titleStart = html.indexOf(">", titleStart) + 1;
            let titleEnd = html.indexOf("</h1>", titleStart);
            if (titleEnd !== -1) {
                chapterTitle = html.slice(titleStart, titleEnd);
                // Bỏ thẻ trong tiêu đề thôi
                while (chapterTitle.indexOf("<") !== -1) {
                    let s = chapterTitle.indexOf("<");
                    let e = chapterTitle.indexOf(">", s);
                    if (e === -1) break;
                    chapterTitle = chapterTitle.slice(0, s) + "" + chapterTitle.slice(e + 1);
                }
                chapterTitle = chapterTitle.trim();
            }
        }

        return Response.success(chapterTitle + "\n\n" + content.trim());

    } catch (err) {
        return Response.error("❌ Lỗi: " + (err.message || "Không xác định"));
    }
}