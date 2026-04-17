/**
 * Global utility functions for formatting data.
 */

/**
 * Format a phone number for WhatsApp links.
 * Cleans non-digit characters and prepends the country code (52 for Mexico) if the length is 10.
 *
 * @param {string|null} phone 
 * @returns {string} Formatted phone number
 */
export const formatWhatsAppPhone = (phone) => {
    if (!phone) return '';
    const cleanPhone = phone.toString().replace(/\D/g, '');
    return cleanPhone.length === 10 ? '52' + cleanPhone : cleanPhone;
};

/**
 * Generate a complete WhatsApp link.
 *
 * @param {string|null} phone 
 * @param {string} [text] Optional message text to pre-fill
 * @returns {string} WhatsApp wa.me URL
 */
export const getWhatsAppLink = (phone, text = '') => {
    const formattedPhone = formatWhatsAppPhone(phone);
    if (!formattedPhone) return '#';
    
    let url = `https://wa.me/${formattedPhone}`;
    if (text) {
        // We use encodeURIComponent but avoid encoding spaces as %20 if we want + ? 
        // Actually encodeURIComponent uses %20 for spaces, which works fine for WA. 
        // But the previous implementation used `+` instead of spaces manually, so we'll just encodeURIComponent.
        // Actually, let's just let the caller pass pre-encoded text, or encode it if it's normal text.
        // Wait, the previous usages: `text=Hola+${name}%2C+...` which is manually encoded.
        // If they already pass pre-encoded text (with + and %2C), encodeURIComponent will double-encode it.
        // Let's just append it.
        url += `?text=${text}`;
    }
    return url;
};
