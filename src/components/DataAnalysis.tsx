import React from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

interface DataItem {
    view: number;
    heart: number;
    star: number;
}

interface DataAnalysisProps {
    data: DataItem[];
}

const DataAnalysis: React.FC<DataAnalysisProps> = ({ data }) => {
    const totalViews = data.reduce((sum, item) => sum + item.view, 0);
    const totalHearts = data.reduce((sum, item) => sum + item.heart, 0);
    const totalStars = data.reduce((sum, item) => sum + item.star, 0);

    const barChartData = {
        labels: ['Lượt xem', 'Lượt tim', 'Lượt ghim'],
        datasets: [
            {
                label: 'Tổng số',
                data: [totalViews, totalHearts, totalStars],
                backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)'],
            },
        ],
    };

    const pieChartData = {
        labels: ['Lượt xem', 'Lượt tim', 'Lượt ghim'],
        datasets: [
            {
                data: [totalViews, totalHearts, totalStars],
                backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)'],
            },
        ],
    };

    const lineChartData = {
        labels: data.map((_, index) => `Ngày ${index + 1}`),
        datasets: [
            {
                label: 'Lượt xem',
                data: data.map(item => item.view),
                borderColor: 'rgba(255, 99, 132, 1)',
                fill: false,
            },
            {
                label: 'Lượt tim',
                data: data.map(item => item.heart),
                borderColor: 'rgba(54, 162, 235, 1)',
                fill: false,
            },
            {
                label: 'Lượt ghim',
                data: data.map(item => item.star),
                borderColor: 'rgba(255, 206, 86, 1)',
                fill: false,
            },
        ],
    };

    return (
        <div className="bg-[#1E293B] p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-[#93C5FD]">Phân tích dữ liệu</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-[#2D3748] p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 text-[#93C5FD]">Tổng lượt xem</h3>
                    <p className="text-3xl font-bold text-white">{totalViews}</p>
                </div>
                <div className="bg-[#2D3748] p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 text-[#93C5FD]">Tổng lượt tim</h3>
                    <p className="text-3xl font-bold text-white">{totalHearts}</p>
                </div>
                <div className="bg-[#2D3748] p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 text-[#93C5FD]">Tổng lượt ghim</h3>
                    <p className="text-3xl font-bold text-white">{totalStars}</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-[#2D3748] p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 text-[#93C5FD]">Biểu đồ cột</h3>
                    <Bar data={barChartData} />
                </div>
                <div className="bg-[#2D3748] p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 text-[#93C5FD]">Biểu đồ tròn</h3>
                    <Pie data={pieChartData} />
                </div>
                <div className="bg-[#2D3748] p-4 rounded-lg col-span-2">
                    <h3 className="text-lg font-semibold mb-2 text-[#93C5FD]">Biểu đồ đường</h3>
                    <Line data={lineChartData} />
                </div>
            </div>
        </div>
    );
};

export default DataAnalysis;
