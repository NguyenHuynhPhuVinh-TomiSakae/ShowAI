'use client'
import React, { useEffect, useState } from 'react';
import { Line, Bar, Radar, PolarArea } from 'react-chartjs-2';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { FaPlay, FaPause, FaEye, FaChartLine } from 'react-icons/fa';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    RadialLinearScale,
    ArcElement,
    BarElement
} from 'chart.js';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import 'github-markdown-css/github-markdown-dark.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    RadialLinearScale,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

interface AIChartProps {
    websiteId: string;
    websiteName: string;
    description: string[];
    keyFeatures: string[];
}

interface ChartDataset {
    label: string;
    data: number[];
    borderColor: string | string[];
    backgroundColor: string | string[];
    borderWidth?: number;
    fill?: boolean;
    pointBackgroundColor?: string;
    pointBorderColor?: string;
    pointHoverBackgroundColor?: string;
    pointHoverBorderColor?: string;
}

interface ChartData {
    labels: string[];
    datasets: ChartDataset[];
}

interface AnalysisType {
    id: string;
    name: string;
    chartType: 'line' | 'bar' | 'radar' | 'polar';
    description: string;
}

const AIChart: React.FC<AIChartProps> = ({ websiteName, description, keyFeatures }) => {
    const [chartData, setChartData] = useState<ChartData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showChart, setShowChart] = useState(false);
    const [analysisText, setAnalysisText] = useState('');
    const [typingIndex, setTypingIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [selectedAnalysis, setSelectedAnalysis] = useState<string>('performance');

    const analysisTypes: AnalysisType[] = [
        {
            id: 'performance',
            name: 'Hiệu suất theo thời gian',
            chartType: 'line',
            description: 'Phân tích hiệu suất AI theo thời gian'
        },
        {
            id: 'comparison',
            name: 'So sánh các chỉ số',
            chartType: 'bar',
            description: 'So sánh các chỉ số hiệu suất'
        },
        {
            id: 'balance',
            name: 'Cân bằng chỉ số',
            chartType: 'radar',
            description: 'Đánh giá sự cân bằng giữa các chỉ số'
        },
        {
            id: 'distribution',
            name: 'Phân phối hiệu suất',
            chartType: 'polar',
            description: 'Phân tích phân phối hiệu suất'
        }
    ];

    useEffect(() => {
        if (analysisText && typingIndex < analysisText.length && !isPaused) {
            const timer = setTimeout(() => {
                setTypingIndex(typingIndex + 1);
            }, 20);
            return () => clearTimeout(timer);
        }
    }, [analysisText, typingIndex, isPaused]);

    useEffect(() => {
        setChartData(null);
        setShowChart(false);
        setAnalysisText('');
        setTypingIndex(0);
        setIsPaused(false);
    }, [selectedAnalysis]);

    const generateChartData = async () => {
        setIsLoading(true);
        setShowChart(false);
        setAnalysisText('');
        setTypingIndex(0);
        setIsPaused(false);

        try {
            const apiKeyResponse = await fetch('/api/Gemini11');
            const apiKeyData = await apiKeyResponse.json();
            if (!apiKeyData.success) {
                throw new Error('Không lấy được khóa API');
            }

            const genAI = new GoogleGenerativeAI(apiKeyData.apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-exp-1121" });

            const selectedType = analysisTypes.find(type => type.id === selectedAnalysis);
            let prompt = `Dựa trên thông tin về công cụ AI "${websiteName}":
            
            Mô tả: ${description.join(' ')}
            Tính năng chính: ${keyFeatures.join(', ')}
            `;

            switch (selectedType?.chartType) {
                case 'line':
                    prompt += `
                    Hãy phân tích và dự đoán xu hướng phát triển trong 12 tháng tới.
                    Trả về kết quả theo định dạng sau:
                    {
                        "analysis": "phân tích xu hướng theo thời gian",
                        "data": {
                            "labels": ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"],
                            "accuracy": [12 số liệu thể hiện xu hướng độ chính xác],
                            "speed": [12 số liệu thể hiện xu hướng tốc độ],
                            "scalability": [12 số liệu thể hiện xu hướng khả năng mở rộng],
                            "reliability": [12 số liệu thể hiện xu hướng độ tin cậy]
                        }
                    }`;
                    break;

                case 'bar':
                    prompt += `
                    Hãy so sánh hiệu suất hiện tại của các chỉ số.
                    Trả về kết quả theo định dạng sau:
                    {
                        "analysis": "phân tích so sánh giữa các chỉ số",
                        "data": {
                            "labels": ["Độ chính xác", "Tốc độ xử lý", "Khả năng mở rộng", "Độ tin cậy"],
                            "accuracy": [1 số đánh giá],
                            "speed": [1 số đánh giá],
                            "scalability": [1 số đánh giá],
                            "reliability": [1 số đánh giá]
                        }
                    }`;
                    break;

                case 'radar':
                    prompt += `
                    Hãy đánh giá sự cân bằng giữa 6 khía cạnh: Độ chính xác, Tốc độ, Khả năng mở rộng, Độ tin cậy, Tính linh hoạt, và Khả năng tích hợp.
                    Trả về kết quả theo định dạng sau:
                    {
                        "analysis": "phân tích sự cân bằng giữa các khía cạnh",
                        "data": {
                            "labels": ["Độ chính xác", "Tốc độ xử lý", "Khả năng mở rộng", "Độ tin cậy", "Tính linh hoạt", "Khả năng tích hợp"],
                            "accuracy": [6 số đánh giá cho từng khía cạnh],
                            "speed": [6 số đánh giá cho từng khía cạnh],
                            "scalability": [6 số đánh giá cho từng khía cạnh],
                            "reliability": [6 số đánh giá cho từng khía cạnh]
                        }
                    }`;
                    break;

                case 'polar':
                    prompt += `
                    Hãy phân tích phân phối tài nguyên và hiệu suất theo 4 nhóm chính.
                    Trả về kết quả theo định dạng sau:
                    {
                        "analysis": "phân tích phân phối tài nguyên",
                        "data": {
                            "labels": ["Nhóm 1: Hiệu suất", "Nhóm 2: Tài nguyên", "Nhóm 3: Độ tin cậy", "Nhóm 4: Khả năng"],
                            "accuracy": [4 số thể hiện phân phối],
                            "speed": [4 số thể hiện phân phối],
                            "scalability": [4 số thể hiện phân phối],
                            "reliability": [4 số thể hiện phân phối]
                        }
                    }`;
                    break;
            }

            prompt += `\nCác số liệu nên được đánh giá trên thang điểm từ 0-100.`;

            const result = await model.generateContent(prompt);
            const response = result.response;
            const jsonStr = response.text().match(/\{[\s\S]*\}/)?.[0];

            if (!jsonStr) throw new Error('Không thể phân tích kết quả từ AI');

            const aiResponse = JSON.parse(jsonStr);
            setAnalysisText(aiResponse.analysis);

            setChartData({
                labels: aiResponse.data.labels,
                datasets: [
                    {
                        label: 'Độ chính xác',
                        data: aiResponse.data.accuracy,
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    },
                    {
                        label: 'Tốc độ xử lý',
                        data: aiResponse.data.speed,
                        borderColor: '#EF4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.5)',
                    },
                    {
                        label: 'Khả năng mở rộng',
                        data: aiResponse.data.scalability,
                        borderColor: '#F59E0B',
                        backgroundColor: 'rgba(245, 158, 11, 0.5)',
                    },
                    {
                        label: 'Độ tin cậy',
                        data: aiResponse.data.reliability,
                        borderColor: '#10B981',
                        backgroundColor: 'rgba(16, 185, 129, 0.5)',
                    }
                ]
            });
            setShowChart(true);
        } catch (error) {
            console.error('Lỗi khi tạo dữ liệu biểu đồ:', error);
            setAnalysisText('Đã xảy ra lỗi khi phân tích dữ liệu. Vui lòng thử lại sau.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePauseResume = () => {
        setIsPaused(!isPaused);
    };

    const handleShowAll = () => {
        setTypingIndex(analysisText.length);
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: '#fff'
                }
            },
            title: {
                display: true,
                text: 'Phân tích hiệu suất AI',
                color: '#fff'
            }
        }
    };

    const chartOptions = {
        line: {
            ...options,
            maintainAspectRatio: false,
            scales: {
                y: {
                    min: 0,
                    max: 100,
                    ticks: {
                        color: '#fff',
                        font: {
                            size: window.innerWidth < 640 ? 10 : 12
                        }
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                x: {
                    ticks: {
                        color: '#fff',
                        font: {
                            size: window.innerWidth < 640 ? 10 : 12
                        },
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            },
            elements: {
                line: {
                    tension: 0.3
                }
            }
        },
        bar: {
            ...options,
            maintainAspectRatio: false,
            scales: {
                y: {
                    min: 0,
                    max: 100,
                    ticks: {
                        color: '#fff',
                        font: {
                            size: window.innerWidth < 640 ? 10 : 12
                        }
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                x: {
                    ticks: {
                        color: '#fff',
                        font: {
                            size: window.innerWidth < 640 ? 10 : 12
                        }
                    },
                    grid: { display: false }
                }
            },
            indexAxis: 'y' as const,
            barThickness: window.innerWidth < 640 ? 20 : 30
        },
        radar: {
            ...options,
            maintainAspectRatio: false,
            scales: {
                r: {
                    min: 0,
                    max: 100,
                    ticks: {
                        color: '#fff',
                        backdropColor: 'transparent',
                        font: {
                            size: window.innerWidth < 640 ? 10 : 12
                        }
                    },
                    pointLabels: {
                        font: {
                            size: window.innerWidth < 640 ? 10 : 12
                        },
                        color: '#fff'
                    }
                }
            }
        },
        polar: {
            ...options,
            maintainAspectRatio: false,
            scales: {
                r: {
                    min: 0,
                    max: 100,
                    ticks: {
                        color: '#fff',
                        backdropColor: 'transparent',
                        font: {
                            size: window.innerWidth < 640 ? 10 : 12
                        }
                    }
                }
            }
        }
    };

    const renderChart = () => {
        if (!chartData || !showChart) return null;

        const selectedType = analysisTypes.find(type => type.id === selectedAnalysis);
        let modifiedData = { ...chartData };

        switch (selectedType?.chartType) {
            case 'line':
                return <Line options={chartOptions.line} data={modifiedData} />;

            case 'bar':
                modifiedData = {
                    labels: chartData.labels,
                    datasets: [{
                        label: 'Chỉ số hiệu suất',
                        data: chartData.datasets.map(ds => ds.data[0]),
                        backgroundColor: [
                            'rgba(59, 130, 246, 0.7)',
                            'rgba(239, 68, 68, 0.7)',
                            'rgba(245, 158, 11, 0.7)',
                            'rgba(16, 185, 129, 0.7)'
                        ],
                        borderColor: [
                            '#3B82F6',
                            '#EF4444',
                            '#F59E0B',
                            '#10B981'
                        ],
                        borderWidth: 1
                    }] as ChartDataset[]
                };
                return <Bar options={chartOptions.bar} data={modifiedData} />;

            case 'radar':
                modifiedData = {
                    labels: chartData.labels,
                    datasets: chartData.datasets.map(ds => ({
                        ...ds,
                        fill: true,
                        pointBackgroundColor: typeof ds.borderColor === 'string' ? ds.borderColor : ds.borderColor[0],
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: typeof ds.borderColor === 'string' ? ds.borderColor : ds.borderColor[0]
                    })) as ChartDataset[]
                };
                return <Radar options={chartOptions.radar} data={modifiedData} />;

            case 'polar':
                modifiedData = {
                    labels: chartData.labels,
                    datasets: [{
                        label: 'Phân phối hiệu suất',
                        data: chartData.datasets.reduce((acc, ds, index, array) => {
                            if (index === 0) {
                                return ds.data;
                            }
                            return acc.map((val, idx) => {
                                const sum = val + ds.data[idx];
                                const average = sum / array.length;
                                return Math.min(Math.max(Math.round(average * 2), 40), 100);
                            });
                        }, [] as number[]),
                        backgroundColor: [
                            'rgba(59, 130, 246, 0.7)',
                            'rgba(239, 68, 68, 0.7)',
                            'rgba(245, 158, 11, 0.7)',
                            'rgba(16, 185, 129, 0.7)'
                        ],
                        borderColor: [
                            '#3B82F6',
                            '#EF4444',
                            '#F59E0B',
                            '#10B981'
                        ],
                        borderWidth: 1
                    }] as ChartDataset[]
                };
                const polarOptions = {
                    ...chartOptions.polar,
                    scales: {
                        r: {
                            min: 0,
                            max: 100,
                            ticks: {
                                stepSize: 20,
                                color: '#fff',
                                backdropColor: 'transparent'
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)',
                                circular: true
                            },
                            angleLines: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            beginAtZero: true
                        }
                    },
                    animation: {
                        duration: 2000
                    }
                };
                return <PolarArea options={polarOptions} data={modifiedData} />;

            default:
                return <Line options={chartOptions.line} data={modifiedData} />;
        }
    };

    const handleAnalysisChange = (analysisId: string) => {
        if (isLoading) return;
        setSelectedAnalysis(analysisId);
    };

    return (
        <div className="mt-4 sm:mt-8 bg-gray-800 rounded-xl p-3 sm:p-6">
            <h3 className="text-lg sm:text-2xl font-bold text-blue-300 mb-3 sm:mb-4 flex items-center">
                <FaChartLine className="mr-2" />
                Phân tích dữ liệu AI
            </h3>

            <div className="mb-3 sm:mb-4 grid grid-cols-1 sm:grid-cols-4 gap-2">
                {analysisTypes.map((type) => (
                    <button
                        key={type.id}
                        onClick={() => handleAnalysisChange(type.id)}
                        disabled={isLoading}
                        className={`p-2 rounded-lg text-xs sm:text-sm ${selectedAnalysis === type.id
                            ? 'bg-[#3E52E8] text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {type.name}
                    </button>
                ))}
            </div>

            <button
                onClick={generateChartData}
                disabled={isLoading}
                className={`bg-[#3E52E8] text-white px-3 sm:px-4 py-2 rounded w-full text-sm sm:text-base hover:bg-[#2A3BAF] transition-colors duration-300 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
            >
                {isLoading ? 'Đang phân tích...' : 'Phân tích dữ liệu'}
            </button>

            {analysisText && (
                <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-[#1E293B] rounded border border-[#3E52E8] text-white markdown-body text-sm sm:text-base">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                    >
                        {analysisText.slice(0, typingIndex)}
                    </ReactMarkdown>
                    <div className="mt-2 flex flex-wrap gap-2">
                        <button
                            onClick={handlePauseResume}
                            className="flex items-center text-xs sm:text-sm..."
                        >
                            {isPaused ? (
                                <>
                                    <FaPlay className="mr-1" />
                                    <span>Tiếp tục</span>
                                </>
                            ) : (
                                <>
                                    <FaPause className="mr-1" />
                                    <span>Tạm dừng</span>
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleShowAll}
                            className="flex items-center text-xs sm:text-sm..."
                        >
                            <FaEye className="mr-1" />
                            <span>Hiển thị tất cả</span>
                        </button>
                    </div>
                </div>
            )}

            {showChart && chartData && (
                <div className="mt-3 sm:mt-4 w-full h-[300px] sm:h-[400px] relative">
                    <div className="absolute inset-0">
                        {renderChart()}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIChart;
