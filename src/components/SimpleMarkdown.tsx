import React from 'react';

interface SimpleMarkdownProps {
    content: string;
}

const SimpleMarkdown: React.FC<SimpleMarkdownProps> = ({ content }) => {
    const renderMarkdown = (text: string) => {
        // Xử lý code blocks
        text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, language, code) => {
            return `<pre class="bg-gray-800 p-2 rounded-md overflow-x-auto"><code class="language-${language || ''}">${code.trim()}</code></pre>`;
        });

        // Xử lý inline code
        text = text.replace(/`([^`]+)`/g, '<code class="bg-gray-700 px-1 rounded">$1</code>');

        // Xử lý bold
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Xử lý italic
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');

        // Xử lý links
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-400 hover:underline">$1</a>');

        // Xử lý danh sách không có thứ tự
        text = text.replace(/^\s*-\s(.+)/gm, '<li>$1</li>');
        text = text.replace(/<li>(.+?)<\/li>/g, '<ul class="list-disc list-inside">$&</ul>');

        // Xử lý danh sách có thứ tự
        text = text.replace(/^\s*\d+\.\s(.+)/gm, '<li>$1</li>');
        text = text.replace(/<li>(.+?)<\/li>/g, '<ol class="list-decimal list-inside">$&</ol>');

        // Xử lý các đoạn văn
        text = text.replace(/(.+)(\n|$)/g, '<p>$1</p>');

        return text;
    };

    return <div dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />;
};

export default SimpleMarkdown;
