/**
 * Simple utility to sanitize string content for use in innerHTML.
 * Prevents basic XSS by escaping HTML special characters.
 */
export const sanitize = (str: string): string => {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

/**
 * Safe HTML builder for specific UI patterns where we need to inject icons/colors
 * but keeping text content safe.
 * @param icon The raw icon character/emoji (assumed safe or will be sanitized)
 * @param text The text content to sanitize
 * @param color Optional hex color
 */
export const buildSkillHtml = (icon: string, text: string, color?: string): string => {
    const safeText = sanitize(text);
    const safeIcon = sanitize(icon);
    const colorStyle = color ? `color:${sanitize(color)};` : '';
    // Note: We trust the structural HTML tags here (span), but sanitize content
    return `<span style="font-size:20px; margin-right:8px;">${safeIcon}</span><span style="${colorStyle}">${safeText}</span>`;
};
