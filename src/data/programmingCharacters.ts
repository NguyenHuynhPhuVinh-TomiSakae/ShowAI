// Định nghĩa interface cho một nhân vật
export interface ProgrammingCharacter {
    id: number;
    name: string;
    personality: string;
}

// Định nghĩa kiểu cho mảng chứa tất cả nhân vật
export type ProgrammingCharacters = ProgrammingCharacter[];

// Khai báo programmingCharacters với kiểu mảng
export const programmingCharacters: ProgrammingCharacters = [
    {
        id: 0,
        name: "Python",
        personality: "đơn giản, dễ đọc và thân thiện với người mới bắt đầu"
    },
    {
        id: 1,
        name: "JavaScript",
        personality: "linh hoạt và đa năng, nhưng đôi khi khó đoán"
    },
    {
        id: 2,
        name: "Java",
        personality: "chặt chẽ, an toàn và đáng tin cậy"
    },
    {
        id: 3,
        name: "C++",
        personality: "mạnh mẽ nhưng phức tạp, đòi hỏi kỹ năng cao"
    },
    {
        id: 4,
        name: "TypeScript",
        personality: "nghiêm túc và an toàn kiểu dữ liệu"
    },
    {
        id: 5,
        name: "React",
        personality: "linh hoạt và component-based, được cộng đồng yêu thích"
    },
    {
        id: 6,
        name: "Angular",
        personality: "cấu trúc chặt chẽ và enterprise-ready"
    },
    {
        id: 7,
        name: "Vue.js",
        personality: "dễ học và progressive framework"
    },
    {
        id: 8,
        name: "Node.js",
        personality: "nhanh chóng và event-driven"
    },
    {
        id: 9,
        name: "PHP",
        personality: "phổ biến trong web development và dễ tiếp cận"
    },
    {
        id: 10,
        name: "Ruby",
        personality: "thanh lịch và developer-friendly"
    },
    {
        id: 11,
        name: "Swift",
        personality: "hiện đại và an toàn cho iOS development"
    },
    {
        id: 12,
        name: "Kotlin",
        personality: "hiện đại và tương thích với Java"
    },
    {
        id: 13,
        name: "Go",
        personality: "đơn giản và hiệu suất cao"
    },
    {
        id: 14,
        name: "Rust",
        personality: "an toàn bộ nhớ và hiệu suất cao"
    },
    {
        id: 15,
        name: "C#",
        personality: "mạnh mẽ và đa nền tảng với .NET"
    },
    {
        id: 16,
        name: "MongoDB",
        personality: "linh hoạt và phi quan hệ"
    },
    {
        id: 17,
        name: "MySQL",
        personality: "đáng tin cậy và phổ biến trong RDBMS"
    },
    {
        id: 18,
        name: "PostgreSQL",
        personality: "mạnh mẽ và feature-rich"
    },
    {
        id: 19,
        name: "Redis",
        personality: "nhanh nhẹn và in-memory database"
    },
    {
        id: 20,
        name: "HTML",
        personality: "nền tảng và cấu trúc web"
    },
    {
        id: 21,
        name: "CSS",
        personality: "sáng tạo và thẩm mỹ trong styling"
    },
    {
        id: 22,
        name: "Sass",
        personality: "mở rộng và powerful CSS preprocessor"
    },
    {
        id: 23,
        name: "Tailwind CSS",
        personality: "tiện lợi và utility-first"
    },
    {
        id: 24,
        name: "Bootstrap",
        personality: "responsive và component-rich"
    },
    {
        id: 25,
        name: "Spring Boot",
        personality: "mạnh mẽ và enterprise Java framework"
    },
    {
        id: 26,
        name: "Django",
        personality: "batteries-included Python framework"
    },
    {
        id: 27,
        name: "Laravel",
        personality: "thanh lịch và full-featured PHP framework"
    },
    {
        id: 28,
        name: "Express.js",
        personality: "minimalist và linh hoạt Node.js framework"
    },
    {
        id: 29,
        name: "Docker",
        personality: "container hóa và deployment đơn giản"
    },
    {
        id: 30,
        name: "Kubernetes",
        personality: "orchestration và quản lý container mạnh mẽ"
    },
    {
        id: 31,
        name: "Git",
        personality: "version control và collaboration essential"
    },
    {
        id: 32,
        name: "AWS",
        personality: "đa dạng và leader trong cloud services"
    },
    {
        id: 33,
        name: "Azure",
        personality: "enterprise-focused và Microsoft ecosystem"
    },
    {
        id: 34,
        name: "GraphQL",
        personality: "query language linh hoạt và hiệu quả"
    },
    {
        id: 35,
        name: "Redux",
        personality: "predictable state management"
    },
    {
        id: 36,
        name: "Next.js",
        personality: "React framework với SSR và routing"
    },
    {
        id: 37,
        name: "Webpack",
        personality: "powerful module bundler"
    },
    {
        id: 38,
        name: "Jenkins",
        personality: "automation và CI/CD reliable"
    },
    {
        id: 39,
        name: "Linux",
        personality: "mã nguồn mở và stable OS"
    },
    {
        id: 40,
        name: "Nginx",
        personality: "high performance web server"
    },
    {
        id: 41,
        name: "Apache",
        personality: "reliable và widely-used web server"
    },
    {
        id: 42,
        name: "Flutter",
        personality: "cross-platform và beautiful UI"
    },
    {
        id: 43,
        name: "React Native",
        personality: "mobile development với React"
    },
    {
        id: 44,
        name: "TensorFlow",
        personality: "powerful machine learning framework"
    },
    {
        id: 45,
        name: "PyTorch",
        personality: "flexible deep learning platform"
    },
    {
        id: 46,
        name: "Elasticsearch",
        personality: "powerful search và analytics engine"
    },
    {
        id: 47,
        name: "RabbitMQ",
        personality: "reliable message broker"
    },
    {
        id: 48,
        name: "Kafka",
        personality: "distributed streaming platform"
    },
    {
        id: 49,
        name: "WebAssembly",
        personality: "high-performance web execution"
    }
];
