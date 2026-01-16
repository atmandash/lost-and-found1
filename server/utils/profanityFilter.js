// Minimal profanity filter - only blocks severe explicit words
const profanityList = [
    // Only the most severe explicit words
    'fuck', 'f*ck', 'f**k',
    'shit', 'sh*t',
    'bitch', 'b*tch',
    'cunt', 'c*nt',

    // Hindi/Urdu - only most severe
    'madarchod', 'maderchod',
    'behenchod',
    'chutiya',
    'bhosdike',
];

// Check if text contains profanity - only exact word matches
const containsProfanity = (text) => {
    if (!text || typeof text !== 'string') return false;

    // Convert to lowercase and split into words
    const words = text.toLowerCase().split(/\s+/);

    // Only check for exact word matches (not substrings)
    return profanityList.some(badWord => {
        const cleanBadWord = badWord.replace(/[^a-z]/g, '');
        return words.some(word => {
            const cleanWord = word.replace(/[^a-z]/g, '');
            return cleanWord === cleanBadWord;
        });
    });
};

module.exports = {
    containsProfanity,
    profanityList
};

