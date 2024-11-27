/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import React, { useState } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Wand2 } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { toast } from 'react-hot-toast';
import CodeChallenge from '@/components/CodeChallenge';

// Danh sách loại câu hỏi
const questionTypes = [
    { id: 'multiple_choice', name: 'Trắc nghiệm' },
    { id: 'fill_blank', name: 'Điền từ' },
    { id: 'true_false', name: 'Đúng/Sai' },
    { id: 'matching', name: 'Nối từ' },
];

// Danh sách chủ đề
const topics = [
    { id: 'history', name: 'Lịch sử' },
    { id: 'programming', name: 'Lập trình' },
    { id: 'science', name: 'Khoa học' },
    { id: 'math', name: 'Toán học' },
    { id: 'literature', name: 'Văn học' },
    { id: 'english', name: 'Tiếng Anh' },
];

// Thêm interface cho cấu trúc câu hỏi
interface MatchingPair {
    left: string;
    right: string;
}

interface Question {
    question: string;
    options?: string[];
    correctAnswer: string | string[] | MatchingPair[];
    explanation?: string;
    type: string;
    topic: string;
    matchingPairs?: MatchingPair[];
}

export default function StudyPage() {
    const [selectedType, setSelectedType] = useState(questionTypes[0]);
    const [selectedTopic, setSelectedTopic] = useState(topics[0]);
    const [description, setDescription] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [userAnswer, setUserAnswer] = useState<string>('');
    const [showResult, setShowResult] = useState(false);
    const [matchingAnswers, setMatchingAnswers] = useState<{ [key: string]: string }>({});
    const [mode, setMode] = useState<'quiz' | 'code'>('quiz');

    const handleGenerate = async () => {
        setIsGenerating(true);
        setCurrentQuestion(null);
        setUserAnswer('');
        setShowResult(false);
        setMatchingAnswers({});

        try {
            const apiKeyResponse = await fetch('/api/Gemini8');
            const apiKeyData = await apiKeyResponse.json();

            if (!apiKeyData.success) {
                throw new Error('Không lấy được API key');
            }

            // Khởi tạo Gemini với cấu hình mới
            const genAI = new GoogleGenerativeAI(apiKeyData.apiKey);
            const model = genAI.getGenerativeModel({
                model: "gemini-exp-1121",
            });

            const generationConfig = {
                temperature: 1,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 8192,
                responseMimeType: "application/json",
            };

            // Tạo chat session
            const chatSession = model.startChat({
                generationConfig,
                history: [],
            });

            let promptTemplate = '';

            // Tạo prompt theo từng loại câu hỏi
            switch (selectedType.id) {
                case 'multiple_choice':
                    promptTemplate = `Tạo một câu hỏi trắc nghiệm về ${selectedTopic.name} với format JSON:
                    {
                        "question": "Câu hỏi",
                        "options": ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
                        "correctAnswer": "Đáp án đúng (phải là một trong các lựa chọn)",
                        "explanation": "Giải thích đáp án",
                        "type": "multiple_choice",
                        "topic": "${selectedTopic.id}"
                    }`;
                    break;

                case 'true_false':
                    promptTemplate = `Tạo một câu hỏi đúng/sai về ${selectedTopic.name} với format JSON:
                    {
                        "question": "Câu hỏi",
                        "correctAnswer": "true hoặc false",
                        "explanation": "Giải thích đáp án",
                        "type": "true_false",
                        "topic": "${selectedTopic.id}"
                    }`;
                    break;

                case 'fill_blank':
                    promptTemplate = `Tạo một câu hỏi điền từ về ${selectedTopic.name} với format JSON:
                    {
                        "question": "Câu hỏi có chỗ trống (...)",
                        "correctAnswer": "Từ cần điền vào chỗ trống",
                        "explanation": "Giải thích đáp án",
                        "type": "fill_blank",
                        "topic": "${selectedTopic.id}"
                    }`;
                    break;

                case 'matching':
                    promptTemplate = `Tạo một câu hỏi nối từ về ${selectedTopic.name} với format JSON:
                    {
                        "question": "Hãy nối các cặp từ tương ứng sau:",
                        "matchingPairs": [
                            {"left": "Từ bên trái 1", "right": "Từ bên phải 1"},
                            {"left": "Từ bên trái 2", "right": "Từ bên phải 2"},
                            {"left": "Từ bên trái 3", "right": "Từ bên phải 3"},
                            {"left": "Từ bên trái 4", "right": "Từ bên phải 4"}
                        ],
                        "explanation": "Giải thích các cặp từ",
                        "type": "matching",
                        "topic": "${selectedTopic.id}"
                    }`;
                    break;
            }

            const prompt = `${promptTemplate}
            Mô tả yêu cầu: ${description}
            Chỉ trả về JSON hợp lệ, không kèm theo bất kỳ text hoặc markdown nào khác.`;

            const result = await chatSession.sendMessage(prompt);
            const response = result.response.text();

            try {
                const questionData: Question = JSON.parse(response);
                validateQuestionFormat(questionData);
                setCurrentQuestion(questionData);
                toast.success('Đã tạo câu hỏi thành công!');
            } catch (jsonError) {
                const jsonMatch = response.match(/\{[\s\S]*\}/);
                if (!jsonMatch) {
                    throw new Error('Không tìm thấy JSON hợp lệ trong response');
                }
                const questionData: Question = JSON.parse(jsonMatch[0]);
                validateQuestionFormat(questionData);
                setCurrentQuestion(questionData);
                toast.success('Đã tạo câu hỏi thành công!');
            }

        } catch (error) {
            console.error('Lỗi khi tạo câu hỏi:', error);
            toast.error('Có lỗi xảy ra khi tạo câu hỏi');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmitAnswer = () => {
        if (!currentQuestion) return;
        setShowResult(true);
    };

    // Thêm phần render câu hỏi cho người dùng làm
    const renderQuestionUI = () => {
        if (!currentQuestion) return null;

        return (
            <div className="mt-6 space-y-4 bg-[#1E293B] border border-[#2A3284] rounded-lg p-4">
                <h3 className="font-semibold">{currentQuestion.question}</h3>

                {currentQuestion.type === 'multiple_choice' && (
                    <div className="space-y-2">
                        {currentQuestion.options?.map((option, index) => (
                            <div key={index} className="flex items-center">
                                <input
                                    type="radio"
                                    name="answer"
                                    value={option}
                                    onChange={(e) => setUserAnswer(e.target.value)}
                                    className="mr-2"
                                />
                                <label>{option}</label>
                            </div>
                        ))}
                    </div>
                )}

                {currentQuestion.type === 'true_false' && (
                    <div className="flex flex-col gap-3">
                        <div className="flex gap-4">
                            <button
                                onClick={() => setUserAnswer('true')}
                                className={`flex-1 px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-all
                                    ${userAnswer === 'true'
                                        ? 'bg-[#3E52E8] text-white'
                                        : 'bg-[#2A3284] hover:bg-[#2A3284]/80'}`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Đúng
                            </button>
                            <button
                                onClick={() => setUserAnswer('false')}
                                className={`flex-1 px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-all
                                    ${userAnswer === 'false'
                                        ? 'bg-[#3E52E8] text-white'
                                        : 'bg-[#2A3284] hover:bg-[#2A3284]/80'}`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Sai
                            </button>
                        </div>
                    </div>
                )}

                {currentQuestion.type === 'matching' && currentQuestion.matchingPairs && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                {currentQuestion.matchingPairs.map((pair, index) => (
                                    <div key={`left-${index}`} className="p-3 bg-[#2A3284] rounded-lg">
                                        {pair.left}
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-2">
                                {currentQuestion.matchingPairs.map((pair, index) => (
                                    <select
                                        key={`right-${index}`}
                                        value={matchingAnswers[pair.left] || ''}
                                        onChange={(e) => {
                                            setMatchingAnswers(prev => ({
                                                ...prev,
                                                [pair.left]: e.target.value
                                            }));
                                        }}
                                        className="w-full p-3 bg-[#2A3284] rounded-lg border border-[#3E52E8] focus:outline-none focus:ring-2 focus:ring-[#3E52E8]"
                                    >
                                        <option value="">Chọn đáp án</option>
                                        {currentQuestion?.matchingPairs?.map((p, i) => (
                                            <option key={i} value={p.right}>
                                                {p.right}
                                            </option>
                                        ))}
                                    </select>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {currentQuestion.type === 'fill_blank' && (
                    <div className="space-y-4">
                        <div className="p-4 bg-[#2A3284] rounded-lg">
                            <input
                                type="text"
                                value={userAnswer}
                                onChange={(e) => setUserAnswer(e.target.value)}
                                className="w-full bg-[#1E293B] rounded-lg p-3 border border-[#3E52E8] focus:outline-none focus:ring-2 focus:ring-[#3E52E8]"
                                placeholder="Điền câu trả lời của bạn..."
                            />
                        </div>
                    </div>
                )}

                <Button
                    onClick={handleSubmitAnswer}
                    disabled={!isAnswerValid()}
                    className="mt-4 w-full bg-[#3E52E8] hover:bg-[#2A3284]"
                >
                    Kiểm tra
                </Button>

                {showResult && (
                    <div className="mt-4 p-4 rounded-lg bg-[#2A3284]">
                        <p className="font-semibold text-lg mb-2">
                            {isCorrectAnswer() ?
                                '🎉 Chính xác!' :
                                '😢 Chưa chính xác'}
                        </p>
                        <div className="mt-2">
                            <p className="font-medium">Đáp án đúng:</p>
                            {currentQuestion.type === 'matching' ?
                                currentQuestion.matchingPairs?.map((pair, index) => (
                                    <p key={index} className="mt-1">
                                        {pair.left} ↔️ {pair.right}
                                    </p>
                                ))
                                :
                                <p>{currentQuestion.correctAnswer.toString()}</p>
                            }
                        </div>
                        {currentQuestion.explanation && (
                            <div className="mt-3 pt-3 border-t border-[#3E52E8]">
                                <p className="font-medium">Giải thích:</p>
                                <p>{currentQuestion.explanation}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const isAnswerValid = () => {
        if (!currentQuestion) return false;

        if (currentQuestion.type === 'matching') {
            return currentQuestion.matchingPairs?.every(pair => matchingAnswers[pair.left]);
        }

        return !!userAnswer;
    };

    const isCorrectAnswer = () => {
        if (!currentQuestion) return false;

        if (currentQuestion.type === 'matching') {
            return currentQuestion.matchingPairs?.every(pair =>
                matchingAnswers[pair.left] === pair.right
            );
        }

        return userAnswer === currentQuestion.correctAnswer;
    };

    // Thêm hàm validate format câu hỏi
    const validateQuestionFormat = (question: Question) => {
        switch (question.type) {
            case 'multiple_choice':
                if (!Array.isArray(question.options) || question.options.length < 2) {
                    throw new Error('Câu hỏi trắc nghiệm phải có ít nhất 2 lựa chọn');
                }
                if (!question.options.includes(question.correctAnswer as string)) {
                    throw new Error('Đáp án đúng phải là một trong các lựa chọn');
                }
                break;

            case 'true_false':
                if (question.correctAnswer !== 'true' && question.correctAnswer !== 'false') {
                    throw new Error('Đáp án đúng/sai phải là "true" hoặc "false"');
                }
                break;

            case 'fill_blank':
                if (typeof question.correctAnswer !== 'string' || !question.correctAnswer) {
                    throw new Error('Câu hỏi điền từ phải có đáp án là một từ');
                }
                break;

            case 'matching':
                if (!Array.isArray(question.matchingPairs) || question.matchingPairs.length < 2) {
                    throw new Error('Câu hỏi nối từ phải có ít nhất 2 cặp từ');
                }
                question.matchingPairs.forEach(pair => {
                    if (!pair.left || !pair.right) {
                        throw new Error('Mỗi cặp từ phải có đủ từ bên trái và phải');
                    }
                });
                break;
        }
    };

    return (
        <>
            <div className="bg-[#2A3284] text-center py-8 px-4">
                <h1 className="text-2xl sm:text-3xl font-bold mb-4">Học tập</h1>
                <p className="text-base sm:text-lg max-w-3xl mx-auto">
                    Tạo câu hỏi học tập với AI
                </p>
            </div>

            <div className="flex justify-center gap-4 py-4 bg-[#0F172A]">
                <Button
                    onClick={() => setMode('quiz')}
                    className={`${mode === 'quiz' ? 'bg-[#3E52E8]' : 'bg-[#2A3284]'}`}
                >
                    Câu hỏi
                </Button>
                <Button
                    onClick={() => setMode('code')}
                    className={`${mode === 'code' ? 'bg-[#3E52E8]' : 'bg-[#2A3284]'}`}
                >
                    Lập trình
                </Button>
            </div>

            <main className="flex min-h-screen bg-[#0F172A] text-white">
                <div className="w-full max-w-4xl mx-auto px-4 py-8">
                    {mode === 'quiz' ? (
                        <div className="space-y-6">
                            {/* Phần chọn loại câu hỏi và chủ đề */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Select
                                    value={selectedType.id}
                                    onValueChange={(value) => {
                                        setSelectedType(questionTypes.find(t => t.id === value) || questionTypes[0]);
                                    }}
                                >
                                    <SelectTrigger className="w-full sm:w-[200px] bg-[#1E293B] border-[#2A3284]">
                                        <SelectValue placeholder="Chọn loại câu hỏi" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {questionTypes.map((type) => (
                                            <SelectItem key={type.id} value={type.id}>
                                                {type.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={selectedTopic.id}
                                    onValueChange={(value) => {
                                        setSelectedTopic(topics.find(t => t.id === value) || topics[0]);
                                    }}
                                >
                                    <SelectTrigger className="w-full sm:w-[200px] bg-[#1E293B] border-[#2A3284]">
                                        <SelectValue placeholder="Chọn chủ đề" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {topics.map((topic) => (
                                            <SelectItem key={topic.id} value={topic.id}>
                                                {topic.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Phần nhập mô tả */}
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Mô tả chi tiết về câu hỏi cần tạo:</label>
                                <TextareaAutosize
                                    className="w-full bg-[#1E293B] rounded-lg p-3 min-h-[100px] resize-none border border-[#2A3284] focus:outline-none focus:ring-2 focus:ring-[#3E52E8]"
                                    placeholder="VD: Tạo câu hỏi về vòng lặp for trong JavaScript, độ khó trung bình..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            {/* Nút tạo câu hỏi */}
                            <Button
                                onClick={handleGenerate}
                                disabled={isGenerating || !description.trim()}
                                className="w-full bg-[#3E52E8] hover:bg-[#2A3284] transition-colors"
                            >
                                <Wand2 className="w-5 h-5 mr-2" />
                                {isGenerating ? 'Đang tạo...' : 'Tạo câu hỏi'}
                            </Button>

                            {/* Chỉ hiển thị phần làm bài */}
                            {currentQuestion && renderQuestionUI()}
                        </div>
                    ) : (
                        <CodeChallenge />
                    )}
                </div>
            </main>
        </>
    );
}
