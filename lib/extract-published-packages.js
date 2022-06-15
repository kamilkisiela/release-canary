"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function extractPublishedPackages(line) {
    let newTagRegex = /New tag:\s+(@[^/]+\/[^@]+|[^/]+)@([^\s]+)/;
    let match = line.match(newTagRegex);
    if (match === null) {
        let npmOutRegex = /\+?\s+(@[^/]+\/[^@]+|[^/]+)@([^\s]+)/;
        match = line.match(npmOutRegex);
    }
    if (match) {
        const [, name, version] = match;
        return { name, version };
    }
    return null;
}
exports.extractPublishedPackages = extractPublishedPackages;
