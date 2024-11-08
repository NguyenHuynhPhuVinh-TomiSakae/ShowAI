import React from 'react';

interface RoleplayMarkdownProps {
    content: string;
}

export default function RoleplayMarkdown({ content }: RoleplayMarkdownProps) {
    const renderLine = (line: string) => {
        const elements: JSX.Element[] = [];

        // Tách dòng thành các phần riêng biệt
        const segments = line.split(/(\[.*?\])|(".*?")|(\*.*?\*)|(\~.*?\~)/g).filter(Boolean);

        segments.forEach((segment, index) => {
            if (segment.startsWith('[') && segment.endsWith(']')) {
                elements.push(
                    <div key={index} className="text-purple-400 mb-2">
                        {segment.slice(1, -1)}
                    </div>
                );
            } else if (segment.startsWith('"') && segment.endsWith('"')) {
                elements.push(
                    <div key={index} className="text-white text-lg mb-2">
                        {segment.slice(1, -1)}
                    </div>
                );
            } else if (segment.match(/\*(.*?)\*/g)) {
                const parts = segment.split(/\*(.*?)\*/g);
                elements.push(
                    <div key={index} className="text-gray-400 italic mb-2">
                        {parts.map((part, i) => {
                            if (i % 2 === 1) return <span key={i}>{part}</span>;
                            return part;
                        })}
                    </div>
                );
            } else if (segment.match(/\~(.*?)\~/g)) {
                elements.push(
                    <div key={index} className="text-yellow-400 mb-2">
                        {segment.replace(/\~(.*?)\~/g, '$1')}
                    </div>
                );
            } else if (segment.trim()) {
                elements.push(
                    <div key={index} className="text-white mb-2">{segment}</div>
                );
            }
        });

        return <>{elements}</>;
    };

    return (
        <div className="space-y-1 leading-relaxed">
            {content.split('\n').map((line, index) => (
                <React.Fragment key={index}>
                    {renderLine(line.trim())}
                </React.Fragment>
            ))}
        </div>
    );
}
