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
        domains: ['firebasestorage.googleapis.com', 'faas-output-image.s3.ap-southeast-1.amazonaws.com'], // Thay 'example.com' bằng tên miền thực tế của bạn
    },
    webpack: (config) => {
        config.output.webassemblyModuleFilename = 'static/wasm/[modulehash].wasm'
        config.experiments = { ...config.experiments, asyncWebAssembly: true }
        return config
    }
};

export default nextConfig;
