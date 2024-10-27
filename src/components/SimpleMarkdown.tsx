import React from 'react';

interface SimpleMarkdownProps {
    content: string;
}

const SimpleMarkdown: React.FC<SimpleMarkdownProps> = ({ content }) => {
    const renderMarkdown = (text: string) => {
        // Chuẩn bị text
        text = text.trim();

        // Xử lý headings (h1-h6)
        text = text.replace(/^(#{1,6})\s(.+)$/gm, (match, level, content) => {
            const headingLevel = level.length as 1 | 2 | 3 | 4 | 5 | 6;
            const sizes: Record<number, string> = {
                1: 'text-3xl',
                2: 'text-2xl',
                3: 'text-xl',
                4: 'text-lg',
                5: 'text-base',
                6: 'text-sm'
            };
            return `<h${headingLevel} class="font-bold ${sizes[headingLevel] || 'text-base'} my-6 first:mt-0">${content}</h${headingLevel}>`;
        });

        // Xử lý danh sách có dấu chấm
        const lines = text.split('\n');
        let inList = false;
        text = lines.map(line => {
            if (line.match(/^\s*[\*\-]\s/)) {
                if (!inList) {
                    inList = true;
                    return '<ul class="list-disc pl-8 my-6 space-y-3">' +
                        line.replace(/^\s*[\*\-]\s(.+)/, '<li class="ml-2 leading-relaxed">$1</li>');
                }
                return line.replace(/^\s*[\*\-]\s(.+)/, '<li class="ml-2 leading-relaxed">$1</li>');
            } else if (inList) {
                inList = false;
                return '</ul>' + line;
            }
            return line;
        }).join('\n');

        // Xử lý code blocks với highlight
        text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, language, code) => {
            const escapedCode = code.trim()
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
            return `<pre class="bg-gray-900 p-6 my-6 rounded-lg overflow-x-auto">
                     <code class="language-${language || 'plaintext'} text-sm">${escapedCode}</code>
                   </pre>`;
        });

        // Xử lý inline code
        text = text.replace(/`([^`]+)`/g, (match, code) => {
            const escapedCode = code
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
            return `<code class="bg-gray-800 px-2 py-1 rounded text-sm font-mono">${escapedCode}</code>`;
        });

        // Xử lý bold và italic
        text = text.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
        text = text.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

        // Xử lý links
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g,
            '<a href="$2" class="text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-200" target="_blank" rel="noopener noreferrer">$1</a>');

        // Xử lý các đoạn văn
        text = text.split('\n\n').map(paragraph => {
            if (paragraph.trim() && !paragraph.startsWith('<')) {
                return `<p class="my-6 leading-relaxed first:mt-0 last:mb-0">${paragraph}</p>`;
            }
            return paragraph;
        }).join('\n');

        return text;
    };

    return (
        <div
            className="markdown-content prose prose-invert max-w-none space-y-6 text-gray-200"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
        />
    );
};

export default SimpleMarkdown;
