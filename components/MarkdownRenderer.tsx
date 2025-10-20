import React from 'react';

interface MarkdownRendererProps {
    content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    const processLine = (line: string) => {
        // Process bold and italics. Split by the markdown characters to preserve order.
        const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i}>{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('*') && part.endsWith('*')) {
                return <em key={i}>{part.slice(1, -1)}</em>;
            }
            return part;
        });
    };

    return (
        <div>
            {content.split('\n').map((line, index) => {
                const trimmedLine = line.trim();
                // Check for list items
                if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
                    return (
                        <div key={index} className="flex items-start pl-4 py-0.5">
                            <span className="mr-2 mt-1">•</span>
                            <span>{processLine(trimmedLine.substring(2))}</span>
                        </div>
                    );
                }
                // Render as a paragraph
                return (
                    <p key={index} className="my-1">
                        {processLine(line)}
                    </p>
                );
            })}
        </div>
    );
};

export default MarkdownRenderer;
