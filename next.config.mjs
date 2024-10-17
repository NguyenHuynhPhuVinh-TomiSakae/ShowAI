/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/sitemap.xml',
                destination: '/api/sitemap',
            },
        ];
    },
    images: {
        domains: ['firebasestorage.googleapis.com'], // Thay 'example.com' bằng tên miền thực tế của bạn
    },
};

export default nextConfig;
