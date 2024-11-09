// Định nghĩa interface cho một nhân vật
export interface AnimeCharacter {
    id: number;
    name: string;
    personality: string;
}

// Định nghĩa kiểu cho mảng chứa tất cả nhân vật
export type AnimeCharacters = AnimeCharacter[];

// Khai báo animeCharacters với kiểu mảng
export const animeCharacters: AnimeCharacters = [
    {
        id: 0,
        name: "Naruto Uzumaki",
        personality: "nhiệt huyết và không bao giờ bỏ cuộc"
    },
    {
        id: 1,
        name: "Levi Ackerman",
        personality: "lạnh lùng và nghiêm túc"
    },
    {
        id: 2,
        name: "Monkey D. Luffy",
        personality: "vui vẻ và yêu thích phiêu lưu"
    },
    {
        id: 3,
        name: "Son Goku",
        personality: "hào hứng chiến đấu và thuần khiết"
    },
    {
        id: 4,
        name: "Saitama",
        personality: "thờ ơ và chán nản với sức mạnh của mình"
    },
    {
        id: 5,
        name: "Eren Yeager",
        personality: "quyết tâm và sẵn sàng hy sinh vì tự do"
    },
    {
        id: 6,
        name: "Light Yagami",
        personality: "thông minh và tham vọng"
    },
    {
        id: 7,
        name: "Sasuke Uchiha",
        personality: "kiêu ngạo và trầm tính"
    },
    {
        id: 8,
        name: "Roronoa Zoro",
        personality: "nghiêm túc và trung thành"
    },
    {
        id: 9,
        name: "Ken Kaneki",
        personality: "nhút nhát nhưng mạnh mẽ khi cần thiết"
    },
    {
        id: 10,
        name: "Mikasa Ackerman",
        personality: "mạnh mẽ và bảo vệ người thân"
    },
    {
        id: 11,
        name: "Hinata Hyuga",
        personality: "nhẹ nhàng và kiên trì"
    },
    {
        id: 12,
        name: "Asuna Yuuki",
        personality: "can đảm và quyết đoán"
    },
    {
        id: 13,
        name: "Rem",
        personality: "tận tụy và yêu thương"
    },
    {
        id: 14,
        name: "Zero Two",
        personality: "nổi loạn và quyến rũ"
    },
    {
        id: 15,
        name: "Megumin",
        personality: "nhiệt tình và thích phép nổ"
    },
    {
        id: 16,
        name: "Aqua",
        personality: "ngốc nghếch và tự tin thái quá"
    },
    {
        id: 17,
        name: "Nezuko Kamado",
        personality: "đáng yêu và bảo vệ anh trai"
    },
    {
        id: 18,
        name: "Mai Sakurajima",
        personality: "thẳng thắn và trưởng thành"
    },
    {
        id: 19,
        name: "Ichigo Kurosaki",
        personality: "mạnh mẽ và luôn bảo vệ bạn bè"
    },
    {
        id: 20,
        name: "Tanjiro Kamado",
        personality: "tốt bụng và kiên trì"
    },
    {
        id: 21,
        name: "Satoru Gojo",
        personality: "tự tin và mạnh mẽ"
    },
    {
        id: 22,
        name: "Itachi Uchiha",
        personality: "thông minh và hy sinh"
    },
    {
        id: 23,
        name: "Edward Elric",
        personality: "thông minh và kiên định"
    },
    {
        id: 24,
        name: "Lelouch Lamperouge",
        personality: "chiến lược và tham vọng"
    },
    {
        id: 25,
        name: "Kazuto Kirigaya",
        personality: "can đảm và quyết tâm"
    },
    {
        id: 26,
        name: "Izuku Midoriya",
        personality: "nhút nhát nhưng quyết tâm"
    },
    {
        id: 27,
        name: "Killua Zoldyck",
        personality: "thông minh và lạnh lùng"
    },
    {
        id: 28,
        name: "Gintoki Sakata",
        personality: "lười biếng nhưng mạnh mẽ"
    },
    {
        id: 29,
        name: "Vegeta",
        personality: "kiêu ngạo và hiếu chiến"
    },
    {
        id: 30,
        name: "All Might",
        personality: "anh hùng và truyền cảm hứng"
    },
    {
        id: 31,
        name: "Kakashi Hatake",
        personality: "thông minh và bình tĩnh"
    },
    {
        id: 32,
        name: "Artoria Pendragon",
        personality: "cao quý và trách nhiệm"
    },
    {
        id: 33,
        name: "Rin Tohsaka",
        personality: "thông minh và kiêu hãnh"
    },
    {
        id: 34,
        name: "Emilia",
        personality: "tốt bụng và quyết tâm"
    },
    {
        id: 35,
        name: "Kurisu Makise",
        personality: "thông minh và tsundere"
    },
    {
        id: 36,
        name: "Miku Nakano",
        personality: "nhút nhát và yêu thích âm nhạc"
    },
    {
        id: 37,
        name: "Yuno Gasai",
        personality: "yandere và ám ảnh"
    },
    {
        id: 38,
        name: "Violet Evergarden",
        personality: "nghiêm túc và muốn hiểu tình yêu"
    },
    {
        id: 39,
        name: "Shinobu Kocho",
        personality: "lạnh lùng và mạnh mẽ"
    },
    {
        id: 40,
        name: "Nami",
        personality: "thông minh và yêu tiền"
    },
    {
        id: 41,
        name: "Sakura Haruno",
        personality: "quyết tâm và yêu thương"
    },
    {
        id: 42,
        name: "Erza Scarlet",
        personality: "nghiêm khắc và mạnh mẽ"
    },
    {
        id: 43,
        name: "Lucy Heartfilia",
        personality: "lạc quan và tốt bụng"
    },
    {
        id: 44,
        name: "Rukia Kuchiki",
        personality: "nghiêm túc và trách nhiệm"
    },
    {
        id: 45,
        name: "Himiko Toga",
        personality: "điên loạn và ám ảnh máu"
    },
    {
        id: 46,
        name: "Ochaco Uraraka",
        personality: "vui vẻ và quyết tâm"
    },
    {
        id: 47,
        name: "Misa Amane",
        personality: "vui vẻ và si tình"
    },
    {
        id: 48,
        name: "Tsunade Senju",
        personality: "mạnh mẽ và có trách nhiệm"
    },
    {
        id: 49,
        name: "Yoruichi Shihouin",
        personality: "tinh nghịch và mạnh mẽ"
    },
];
