interface ButtonDescription {
    text: string;
    description: string;
    category: 'navigation' | 'modal' | 'form' | 'action' | 'game' | 'social';
}

export const buttonDescriptions: Record<string, ButtonDescription> = {
    // Navigation - Thanh điều hướng
    'Hộp Công Cụ': {
        text: 'Hộp Công Cụ',
        description: 'Chứa các công cụ AI như tạo hình ảnh và chuyển đổi file',
        category: 'navigation'
    },
    'Bảng Xếp Hạng': {
        text: 'Bảng Xếp Hạng',
        description: 'Xem thứ hạng và điểm số của người dùng',
        category: 'navigation'
    },
    'Trò Chơi': {
        text: 'Trò Chơi',
        description: 'Khám phá các trò chơi thú vị',
        category: 'navigation'
    },
    'AI': {
        text: 'AI',
        description: 'Truy cập các tính năng AI như tạo mã và trò chuyện',
        category: 'navigation'
    },

    // Modal Actions - Các nút trong modal
    'Tạo Hình Ảnh': {
        text: 'Tạo Hình Ảnh',
        description: 'Tạo hình ảnh mới bằng AI từ mô tả của bạn',
        category: 'modal'
    },
    'Chuyển Đổi Ảnh': {
        text: 'Chuyển Đổi Ảnh',
        description: 'Chuyển đổi kích thước, định dạng và tối ưu hóa ảnh',
        category: 'modal'
    },

    // Form Actions - Các nút trong form
    'Đăng Nhập': {
        text: 'Đăng Nhập',
        description: 'Đăng nhập vào tài khoản của bạn',
        category: 'form'
    },
    'Đăng Ký': {
        text: 'Đăng Ký',
        description: 'Tạo tài khoản mới',
        category: 'form'
    },
    'Gửi': {
        text: 'Gửi',
        description: 'Gửi thông tin form',
        category: 'form'
    },

    // Game Actions - Các nút trong game
    'Bắt Đầu': {
        text: 'Bắt Đầu',
        description: 'Bắt đầu trò chơi mới',
        category: 'game'
    },
    'Tạm Dừng': {
        text: 'Tạm Dừng',
        description: 'Tạm dừng trò chơi hiện tại',
        category: 'game'
    },

    // Social Actions - Tương tác xã hội
    'Theo Dõi': {
        text: 'Theo Dõi',
        description: 'Theo dõi người dùng này',
        category: 'social'
    },
    'Chia Sẻ': {
        text: 'Chia Sẻ',
        description: 'Chia sẻ nội dung này với người khác',
        category: 'social'
    },

    // Account Actions - Quản lý tài khoản
    'Tài Khoản': {
        text: 'Tài Khoản',
        description: 'Quản lý thông tin tài khoản của bạn',
        category: 'action'
    },
    'Đăng Xuất': {
        text: 'Đăng Xuất',
        description: 'Đăng xuất khỏi tài khoản',
        category: 'action'
    },

    // AI Features - Tính năng AI
    'Tạo Mã': {
        text: 'Tạo Mã',
        description: 'Tạo và chỉnh sửa mã nguồn với sự hỗ trợ của AI',
        category: 'action'
    },
    'Trò Chuyện': {
        text: 'Trò Chuyện',
        description: 'Trò chuyện với AI assistant thông minh',
        category: 'action'
    },

    // Logo và Brand
    'ShowAI Logo': {
        text: 'ShowAI Logo',
        description: 'Quay về trang chủ ShowAI - Nền tảng AI đa năng',
        category: 'navigation'
    },

    // Website List Actions - Các nút trong danh sách website
    'Xem Thêm': {
        text: 'Xem Thêm',
        description: 'Xem chi tiết về website này',
        category: 'action'
    },
    'Truy Cập': {
        text: 'Truy Cập',
        description: 'Mở website trong tab mới',
        category: 'action'
    },
    'Lượt Xem': {
        text: 'Lượt Xem',
        description: 'Số lượt người dùng đã xem website này',
        category: 'action'
    },
    'Yêu Thích': {
        text: 'Yêu Thích',
        description: 'Số lượt yêu thích website này',
        category: 'action'
    },
    'Đánh Giá': {
        text: 'Đánh Giá',
        description: 'Điểm đánh giá trung bình của website',
        category: 'action'
    },
    'Tag': {
        text: 'Tag',
        description: 'Nhấn để lọc các website có cùng tag này',
        category: 'action'
    },

    // Search Actions - Các nút tìm kiếm
    'search-input': {
        text: 'Tìm Kiếm',
        description: 'Nhập từ khóa để tìm kiếm công cụ AI',
        category: 'form'
    },
    'voice-search': {
        text: 'Tìm Kiếm Bằng Giọng Nói',
        description: 'Nhấn để tìm kiếm bằng giọng nói của bạn',
        category: 'form'
    },
    'tag-button': {
        text: 'Danh Sách Tag',
        description: 'Xem và chọn các tag phổ biến',
        category: 'form'
    },
    'search-button': {
        text: 'Tìm Kiếm',
        description: 'Nhấn để thực hiện tìm kiếm',
        category: 'form'
    }
};

// Helper function để lấy mô tả
export const getButtonDescription = (buttonText: string): string => {
    return buttonDescriptions[buttonText]?.description || 'Di chuột vào các nút để tôi giải thích chức năng!';
};

// Helper function để lấy category
export const getButtonCategory = (buttonText: string): string => {
    return buttonDescriptions[buttonText]?.category || 'other';
};