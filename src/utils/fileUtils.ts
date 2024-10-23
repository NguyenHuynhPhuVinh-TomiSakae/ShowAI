export const getImageDimensions = (file: File): Promise<{ width: number; height: number } | null> => {
    return new Promise((resolve, reject) => {
        if (file.type === 'image/svg+xml') {
            // SVG không có kích thước cố định
            resolve(null);
        } else {
            const img = new Image();
            img.onload = () => {
                resolve({ width: img.width, height: img.height });
            };
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        }
    });
};

export const getFileInfo = async (file: File): Promise<{ type: string; format: string; size: number }> => {
    const fileType = file.type.split('/')[0];
    let format = file.type.split('/')[1];

    // Xử lý các trường hợp đặc biệt
    if (file.name.endsWith('.svg')) {
        format = 'svg';
    } else if (file.name.endsWith('.docx')) {
        format = 'docx';
    } else if (file.name.endsWith('.pptx')) {
        format = 'pptx';
    } else if (file.name.endsWith('.xlsx')) {
        format = 'xlsx';
    }

    return {
        type: fileType,
        format: format,
        size: file.size
    };
};
