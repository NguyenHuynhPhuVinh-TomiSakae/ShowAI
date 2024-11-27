/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import Editor from '@monaco-editor/react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { toast } from 'react-hot-toast';
import TextareaAutosize from 'react-textarea-autosize';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Wand2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { IoCopy, IoCheckmark } from "react-icons/io5";
import 'github-markdown-css/github-markdown-light.css';

export default function CodeChallenge() {
    const [code, setCode] = useState('');
    const [result, setResult] = useState<string>('');
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [description, setDescription] = useState('');
    const [language, setLanguage] = useState('javascript');
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentChallenge, setCurrentChallenge] = useState<{
        question: string;
        initialCode: string;
        testCases: string[];
        explanation?: string;
    } | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [runResult, setRunResult] = useState<string>('');

    const handleGenerate = async () => {
        setResult('');
        setCode('');
        setCurrentChallenge(null);
        setIsGenerating(true);

        try {
            const apiKeyResponse = await fetch('/api/Gemini9');
            const apiKeyData = await apiKeyResponse.json();

            if (!apiKeyData.success) {
                throw new Error('Không lấy được API key');
            }

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

            const chatSession = model.startChat({
                generationConfig,
                history: [],
            });

            const prompt = `Tạo một bài tập lập trình ${language} dựa trên mô tả sau:
            ${description}
            
            Trả về kết quả theo định dạng JSON:
            {
                "question": "Đề bài chi tiết",
                "initialCode": "Code mẫu để bắt đầu",
                "testCases": ["Test case 1", "Test case 2", "Test case 3"],
                "explanation": "Giải thích ngắn gọn về bài toán"
            }
            Chỉ trả về JSON hợp lệ, không kèm theo bất kỳ text hoặc markdown nào khác.`;

            const result = await chatSession.sendMessage(prompt);
            const response = result.response.text();

            try {
                const questionData = JSON.parse(response);
                setCurrentChallenge(questionData);
                setCode(questionData.initialCode);
                toast.success('Đã tạo bài tập thành công!');
            } catch (jsonError) {
                const jsonMatch = response.match(/\{[\s\S]*\}/);
                if (!jsonMatch) {
                    throw new Error('Không tìm thấy JSON hợp lệ trong response');
                }
                const questionData = JSON.parse(jsonMatch[0]);
                setCurrentChallenge(questionData);
                setCode(questionData.initialCode);
                toast.success('Đã tạo bài tập thành công!');
            }
        } catch (error) {
            console.error('Lỗi khi tạo bài tập:', error);
            toast.error('Có lỗi xảy ra khi tạo bài tập');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleEvaluate = async () => {
        setIsEvaluating(true);
        try {
            const apiKeyResponse = await fetch('/api/Gemini10');
            const apiKeyData = await apiKeyResponse.json();

            const genAI = new GoogleGenerativeAI(apiKeyData.apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-exp-1121" });

            const prompt = `Đánh giá code sau với các test case đã cho:
            
            Câu hỏi: ${currentChallenge?.question}
            
            Code của học viên:
            ${code}
            
            Test cases:
            ${currentChallenge?.testCases.join('\n')}
            
            Hãy phân tích:
            1. Code có chạy đúng với tất cả test cases không?
            2. Code có tuân thủ các quy tắc clean code không?
            3. Có cách nào để tối ưu code không?
            4. Cho điểm từ 1-10.
            
            Trả lời ngắn gọn, súc tích.`;

            const result = await model.generateContent(prompt);
            const response = result.response.text();
            setResult(response);
        } catch (error) {
            toast.error('Có lỗi xảy ra khi đánh giá code');
        } finally {
            setIsEvaluating(false);
        }
    };

    const handleRunCode = async () => {
        setIsRunning(true);
        setRunResult('');

        try {
            const response = await fetch('/api/e2b-run', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: code,
                    language: language,
                    testCases: currentChallenge?.testCases || []
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Có lỗi xảy ra khi chạy code');
            }

            setRunResult(data.output);
            toast.success('Đã chạy code thành công!');
        } catch (error) {
            console.error('Lỗi khi chạy code:', error);
            toast.error('Có lỗi xảy ra khi chạy code');
        } finally {
            setIsRunning(false);
        }
    };

    const copyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    };

    return (
        <div className="space-y-6">
            {/* Phần tạo bài tập mới */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm text-gray-400">Mô tả chi tiết về bài tập cần tạo:</label>
                    <TextareaAutosize
                        className="w-full bg-[#1E293B] rounded-lg p-3 min-h-[100px] resize-none border border-[#2A3284] focus:outline-none focus:ring-2 focus:ring-[#3E52E8]"
                        placeholder="VD: Tạo bài tập về sắp xếp mảng sử dụng thuật toán bubble sort..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <div className="flex gap-4">
                    <Select
                        value={language}
                        onValueChange={setLanguage}
                    >
                        <SelectTrigger className="w-full sm:w-[200px] bg-[#1E293B] border-[#2A3284]">
                            <SelectValue placeholder="Chọn ngôn ngữ" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="python">Python</SelectItem>
                            <SelectItem value="javascript">JavaScript</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !description.trim()}
                    className="w-full bg-[#3E52E8] hover:bg-[#2A3284] transition-colors"
                >
                    <Wand2 className="w-5 h-5 mr-2" />
                    {isGenerating ? 'Đang tạo...' : 'Tạo bài tập'}
                </Button>
            </div>

            {/* Phần hiển thị bài tập và code editor - chỉ hiện khi có currentChallenge */}
            {currentChallenge && (
                <div className="space-y-4">
                    <div className="bg-[#1E293B] rounded-lg p-4">
                        <h3 className="font-semibold mb-4">{currentChallenge.question}</h3>
                        {currentChallenge.explanation && (
                            <p className="mb-4 text-gray-400">{currentChallenge.explanation}</p>
                        )}
                        <div className="mb-4">
                            <h4 className="font-medium mb-2">Test Cases:</h4>
                            <ul className="list-disc list-inside space-y-1 text-gray-400">
                                {currentChallenge.testCases.map((testCase, index) => (
                                    <li key={index}>{testCase}</li>
                                ))}
                            </ul>
                        </div>
                        <Editor
                            height="300px"
                            defaultLanguage={language}
                            theme="vs-dark"
                            value={code}
                            onChange={(value) => setCode(value || '')}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                            }}
                        />
                    </div>

                    <div className="flex gap-4">
                        <Button
                            onClick={handleRunCode}
                            disabled={isRunning || !code.trim()}
                            className="w-1/2 bg-[#3E52E8] hover:bg-[#2A3284]"
                        >
                            {isRunning ? 'Đang chạy...' : 'Chạy Code'}
                        </Button>

                        <Button
                            onClick={handleEvaluate}
                            disabled={isEvaluating}
                            className="w-1/2 bg-[#3E52E8] hover:bg-[#2A3284]"
                        >
                            {isEvaluating ? 'Đang đánh giá...' : 'Đánh giá code'}
                        </Button>
                    </div>

                    {result && (
                        <div className="bg-[#1E293B] rounded-lg p-4">
                            <h4 className="font-semibold mb-2">Kết quả đánh giá:</h4>
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    code({ inline, className, children, ...props }: {
                                        inline?: boolean;
                                        className?: string;
                                        children?: React.ReactNode;
                                    }) {
                                        const match = /language-(\w+)/.exec(className || '')
                                        return !inline && match ? (
                                            <div className="relative">
                                                <SyntaxHighlighter
                                                    style={vscDarkPlus}
                                                    language={match[1]}
                                                    PreTag="div"
                                                    className="rounded-xl shadow-lg !bg-[#1A1A1A] !p-4 my-4"
                                                    {...props}
                                                >
                                                    {String(children).replace(/\n$/, '')}
                                                </SyntaxHighlighter>
                                                <button
                                                    onClick={() => copyToClipboard(String(children), 0)}
                                                    className="absolute top-2 right-2 p-1.5 rounded-lg 
                                                             bg-gray-700/50 hover:bg-gray-700 text-white/70 
                                                             hover:text-white transition-all duration-200"
                                                >
                                                    {copiedIndex === 0 ? (
                                                        <IoCheckmark className="h-4 w-4" />
                                                    ) : (
                                                        <IoCopy className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                        ) : (
                                            <code className={className} {...props}>
                                                {children}
                                            </code>
                                        )
                                    }
                                }}
                                className="markdown-body dark"
                            >
                                {result}
                            </ReactMarkdown>
                        </div>
                    )}

                    {runResult && (
                        <div className="bg-[#1E293B] rounded-lg p-4">
                            <h4 className="font-semibold mb-2">Kết quả chạy code:</h4>
                            <pre className="whitespace-pre-wrap text-sm text-gray-300 bg-[#0F172A] p-4 rounded-lg">
                                {runResult}
                            </pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
