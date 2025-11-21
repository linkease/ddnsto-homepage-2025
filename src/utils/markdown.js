const escapeHtml = (str = '') =>
    str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

const applyInline = (str) => {
    if (!str) return '';
    let out = str;
    out = out.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>');
    out = out.replace(/`([^`]+)`/g, '<code class="bg-white\\/10 text-white px-1.5 py-0.5 rounded text-[12px]">$1</code>');
    out = out.replace(/\[(.+?)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-brand-primary underline">$1</a>');
    return out;
};

export const markdownToHtml = (md = '') => {
    const lines = md.split('\n');
    const html = [];
    let inList = false;
    let inCode = false;
    let codeLines = [];

    const closeList = () => {
        if (inList) {
            html.push('</ul>');
            inList = false;
        }
    };

    const closeCode = () => {
        if (inCode) {
            html.push(
                `<pre class="bg-black/50 border border-white/10 rounded-lg p-3 text-xs text-gray-200 overflow-x-auto"><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`
            );
            codeLines = [];
            inCode = false;
        }
    };

    lines.forEach((rawLine) => {
        const line = rawLine.replace(/\r/g, '');

        if (line.startsWith('```')) {
            if (inCode) {
                closeCode();
            } else {
                closeList();
                inCode = true;
                codeLines = [];
            }
            return;
        }

        if (inCode) {
            codeLines.push(line);
            return;
        }

        if (!line.trim()) {
            closeList();
            html.push('<div class="h-2" />');
            return;
        }

        if (/^\s*[-*]\s+/.test(line)) {
            if (!inList) {
                closeCode();
                html.push('<ul class="list-disc list-inside space-y-1 text-gray-300">');
                inList = true;
            }
            const content = line.replace(/^\s*[-*]\s+/, '');
            html.push(`<li>${applyInline(escapeHtml(content))}</li>`);
            return;
        }

        closeList();

        if (/^###\s+/.test(line)) {
            const content = line.replace(/^###\s+/, '');
            html.push(`<h3 class="text-lg font-semibold text-white mb-1">${applyInline(escapeHtml(content))}</h3>`);
            return;
        }

        if (/^##\s+/.test(line)) {
            const content = line.replace(/^##\s+/, '');
            html.push(`<h2 class="text-xl font-bold text-white mb-1">${applyInline(escapeHtml(content))}</h2>`);
            return;
        }

        if (/^#\s+/.test(line)) {
            const content = line.replace(/^#\s+/, '');
            html.push(`<h1 class="text-2xl font-bold text-white mb-1">${applyInline(escapeHtml(content))}</h1>`);
            return;
        }

        html.push(`<p class="text-gray-300 leading-relaxed">${applyInline(escapeHtml(line))}</p>`);
    });

    closeList();
    closeCode();

    return html.join('\n');
};
