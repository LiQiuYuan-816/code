function execute() {
    let url = "https://liqiuyuan-816.github.io/web-doc-truyen/index.html";
    let doc = fetch(url).html();
    let baseUrl = "https://liqiuyuan-816.github.io";
    
    let list = [];
    // Lấy tất cả mục truyện trong danh sách
    let items = doc.querySelectorAll("#story-list li");
    
    items.forEach(item => {
        // Lấy link và tên truyện
        let linkEl = item.querySelector("a");
        if (!linkEl) return;
        
        let name = linkEl.textContent.trim();
        let href = linkEl.getAttribute("href") || "";
        
        // Tạo link đầy đủ
        let fullLink = href.startsWith("http") 
            ? href 
            : baseUrl + href;
        
        // Lấy nội dung văn bản để tách thông tin
        let text = item.textContent.trim();
        
        // Tách tác giả
        let authorMatch = text.match(/✍️\s*([^·]+)·/);
        let author = authorMatch ? authorMatch[1].trim() : "Không rõ";
        
        // Tách quốc gia
        let countryMatch = text.match(/·\s*(🇨🇳|🇯🇵|🇰🇷|🇻🇳|🌍)\s*([^\n]+)/);
        let country = countryMatch ? countryMatch[2].trim() : "";
        
        // Tách trạng thái & số chương
        let isCompleted = text.includes("✅ Hoàn thành");
        let chapMatch = text.match(/📖\s*(\d+)\s*chương/);
        let totalChapters = chapMatch ? chapMatch[1] : "?";
        let status = isCompleted ? "Hoàn thành" : "Đang tiến hành";
        
        // Lấy mô tả/giới thiệu
        let descMatch = text.match(/📖\s*\d+\s*chương\s*(.+)$/s);
        let description = descMatch ? descMatch[1].trim() : "";
        
        list.push({
            name: name,
            link: fullLink,
            host: "liqiuyuan-816.github.io",
            description: `${author} · ${country} · ${status} · ${totalChapters} chương`,
            author: author,
            chapterCount: totalChapters,
            status: status
        });
    });
    
    return Response.success(list);
}