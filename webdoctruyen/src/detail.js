load('config.js');

function execute() {
    try {
        let pageUrl = arguments[0] || "";
        if (!pageUrl) return Response.error("⚠️ Không có link truyện");

        let res = fetch(pageUrl);
        if (!res.ok) return Response.error("⚠️ Không tải được trang: " + res.status);
        
        let html = res.text().toString();

        // === TÊN TRUYỆN ===
        let name = "Truyện";
        let nameMatch = html.match(/class=["']novel-title["'][^>]*>([\s\S]*?)<\/h1>/i);
        if (nameMatch) {
            name = nameMatch[1].replace(/<[^>]+>/g, "").trim() || "Truyện";
        }

        // === TÁC GIẢ ===
        let author = "Không rõ";
        let authMatch = html.match(/class=["']top-right author["'][^>]*>([\s\S]*?)<\/div>/i);
        if (authMatch) {
            author = authMatch[1].replace("✍️", "").replace(/<[^>]+>/g, "").trim() || "Không rõ";
        }

        // === TRẠNG THÁI & SỐ CHƯƠNG ===
        let status = "Chưa rõ";
        let totalChapters = "?";
        let metaMatch = html.match(/class=["']novel-meta["'][^>]*>([\s\S]*?)<\/div>/i);
        if (metaMatch) {
            let metaText = metaMatch[1].replace(/<[^>]+>/g, " ").trim();
            if (metaText.indexOf(" Hoàn thành") >= 0) status = "Hoàn thành";
            else if (metaText.indexOf("Đang ra") >= 0) status = "Đang tiến hành";
            
            let chapMatch = metaText.match(/(\d+)\s*Chương/i);
            if (chapMatch) totalChapters = chapMatch[1];
        }

        // === THỂ LOẠI ===
        let category = "Chưa rõ";
        let tagMatch = html.match(/class=["']tag-line["'][^>]*>([\s\S]*?)<\/div>/i);
        if (tagMatch) {
            category = tagMatch[1]
                .replace(/<span[^>]*>/gi, "· ")
                .replace(/<\/span>/gi, "")
                .replace(/<[^>]+>/g, "")
                .trim() || "Chưa rõ";
        }

        // === VĂN ÁN ===
        let description = "Chưa có mô tả.";
        let descMatch = html.match(/📜 Văn án[\s\S]*?class=["']content["'][^>]*>([\s\S]*?)<\/div>/i);
        if (descMatch) {
            description = descMatch[1]
                .replace(/<\/p>/gi, "\n\n")
                .replace(/<[^>]+>/g, "")
                .trim() || "Chưa có mô tả.";
        }

        // === BASE URL ===
        let baseUrl = pageUrl.substring(0, pageUrl.lastIndexOf("/") + 1);

        // ✅ Bỏ hoàn toàn trường chapters khỏi kết quả trả về
        return Response.success({
            name: name,
            cover: "",
            author: author,
            description: description,
            status: status,
            category: category,
            totalChapters: totalChapters
        });

    } catch (err) {
        return Response.error("⚠️ Lỗi xử lý: " + err.message);
    }
}