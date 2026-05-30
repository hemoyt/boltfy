import { useEffect } from "react";

interface SEOProps {
    title: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: string;
}

export const SEO = ({
    title,
    description = "Boltfy is the world's most beautiful form builder for creators and agencies. Build high-converting contact forms, lead magnets, and surveys with zero code.",
    keywords = "form builder, online form creator, drag and drop form builder, contact form, lead collection, survey tool, beautiful forms, no-code forms, boltfy, saas form builder, dark mode forms",
    image = "/og-image.png",
    url = window.location.origin,
    type = "website"
}: SEOProps) => {
    useEffect(() => {
        // Update title
        document.title = `${title} | Boltfy - Professional Form Builder`;

        // Standard SEO
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute("content", description);

        // Open Graph / Facebook
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute("content", title);

        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) ogDesc.setAttribute("content", description);

        const ogImage = document.querySelector('meta[property="og:image"]');
        if (ogImage) ogImage.setAttribute("content", image);

        const ogUrl = document.querySelector('meta[property="og:url"]');
        if (ogUrl) ogUrl.setAttribute("content", url);

        const ogType = document.querySelector('meta[property="og:type"]');
        if (ogType) ogType.setAttribute("content", type);

        // Twitter
        const twTitle = document.querySelector('meta[name="twitter:title"]');
        if (twTitle) twTitle.setAttribute("content", title);

        const twDesc = document.querySelector('meta[name="twitter:description"]');
        if (twDesc) twDesc.setAttribute("content", description);

        const twImage = document.querySelector('meta[name="twitter:image"]');
        if (twImage) twImage.setAttribute("content", image);

        // Keywords
        let keywordsTag = document.querySelector('meta[name="keywords"]');
        if (!keywordsTag) {
            keywordsTag = document.createElement("meta");
            keywordsTag.setAttribute("name", "keywords");
            document.head.appendChild(keywordsTag);
        }
        keywordsTag.setAttribute("content", keywords);

        // Robots
        let robotsTag = document.querySelector('meta[name="robots"]');
        if (!robotsTag) {
            robotsTag = document.createElement("meta");
            robotsTag.setAttribute("name", "robots");
            document.head.appendChild(robotsTag);
        }
        robotsTag.setAttribute("content", "index, follow");

    }, [title, description, image, url, type, keywords]);

    return null;
};
