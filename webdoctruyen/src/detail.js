load('config.js');

function execute(url) {
    let res = fetch(url);
    if (!res.ok) return Response.error("Lỗi tải trang: " + res.status);
    let doc = res.html();

    let urlObj = new URL(url);
    let pathname = urlObj.pathname;
    let pathParts = pathname.split("/");
    let currentSlug = "";
    if (pathParts.length >= 2) {
        currentSlug = pathParts[pathParts.length - 2];
    }

    let storiesData = [];
    try {
        let jsonRes = fetch(BASE_DOMAIN + "/web-doc-truyen/stories.json");
        if (jsonRes.ok) {
            storiesData = jsonRes.json() || [];
        }
    } catch(e) {}

    let jsonInfo = {};
    if (storiesData.length > 0 && currentSlug) {
        for (let i = 0; i < storiesData.length; i++) {
            if (storiesData[i].slug === currentSlug) {
                jsonInfo = storiesData[i];
                break;
            }
        }
    }

    // Lấy tên truyện
    let name = jsonInfo.title || "";
    if (!name) {
        try {
            let h1 = doc.querySelector("h1");
            if (h1) name = h1.textContent || "";
        } catch(e) {}
    }
    if (!name) {
        try {
            let nt = doc.querySelector(".novel-title");
            if (nt) name = nt.textContent || "";
        } catch(e) {}
    }
    name = name.trim() || "Truyện";

    // Lấy tác giả
    let author = jsonInfo.author || "";
    if (!author) {
        try {
            let authEl = doc.querySelector(".author");
            if (authEl) {
                author = authEl.textContent || "";
                author = author.replace("✍️", "").trim();
            }
        } catch(e) {}
    }
    author = author || "Không rõ";

    // Lấy bìa
    let cover = jsonInfo.cover || "";
    if (!cover) {
        try {
            let img = doc.querySelector(".cover-image img");
            if (img) cover = img.getAttribute("src") || "";
        } catch(e) {}
    }

    // Thông tin khác
    let totalChapters = jsonInfo.chapters || "?";
    let status = "Chưa rõ";
    try {
        let metaEl = doc.querySelector(".novel-meta");
        if (metaEl) {
            let metaText = metaEl.textContent || "";
            if (metaText.indexOf("Hoàn thành") >= 0) status = "Hoàn thành";
            else if (metaText.indexOf("Đang tiến hành") >= 0) status = "Đang tiến hành";
            let chapMatch = metaText.match(/(\d+)\s*chương/);
            if (chapMatch && chapMatch[1]) totalChapters = chapMatch[1];
        }
    } catch(e) {}

    // Mô tả
    let description = "Chưa có mô tả.";
    try {
        let descEl = doc.querySelector(".section .content");
        if (descEl) description = (descEl.textContent || "").trim() || description;
    } catch(e) {}

    // Danh sách chương
    let chapters = [];
    try {
        let links = doc.querySelectorAll("section li a");
        if (links && links.length > 0) {
            for (let j = 0; j < links.length; j++) {
                let a = links[j];
                let href = a.getAttribute("href") || "";
                let title = (a.textContent || "").trim();
                if (href && title) {
                    chapters.push({
                        name: title,
                        url: new URL(href, url).href
                    });
                }
            }
        }
    } catch(e) {}

    return Response.success({
        name: name,
        cover: cover,
        author: author,
        description: description,
        status: status,
        totalChapters: totalChapters,
        chapters: chapters
    });
}