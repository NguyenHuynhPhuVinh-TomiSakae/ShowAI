import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextStyle from '@tiptap/extension-text-style'
import ModalPortal from './ModalPortal'
import { TypeAnimation } from 'react-type-animation'
import GeminiChat from './GeminiChat'
import { IoHelpCircle } from 'react-icons/io5'
import { motion, AnimatePresence } from 'framer-motion'
// Thêm import cho các biểu tượng mới
import { IoExpandOutline, IoContractOutline } from 'react-icons/io5'
// Thêm import cho biểu tượng loading
import { IoReloadOutline } from 'react-icons/io5'

interface TipTapEditorProps {
    content: string
}

const TipTapEditor: React.FC<TipTapEditorProps> = ({ content }) => {
    const [showModal, setShowModal] = useState(false)
    const [selectedText, setSelectedText] = useState('')
    const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 })
    const [isTypingComplete, setIsTypingComplete] = useState(false)
    const [showGeminiChat, setShowGeminiChat] = useState(false)
    const [expandedText, setExpandedText] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isTypingResponse, setIsTypingResponse] = useState(false)
    const modalRef = useRef<HTMLDivElement>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const editor = useEditor({
        extensions: [StarterKit, TextStyle],
        content: '',
        editable: false,
        onSelectionUpdate: ({ editor }) => {
            const { from, to } = editor.state.selection
            const text = editor.state.doc.textBetween(from, to, ' ')

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }

            if (text.trim()) {
                timeoutRef.current = setTimeout(() => {
                    setSelectedText(text)
                    updateModalPosition()
                    setShowModal(true)
                }, 200)
            } else {
                setShowModal(false)
            }
        },
    })

    const updateModalPosition = () => {
        const selection = window.getSelection()
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0)
            const rect = range.getBoundingClientRect()
            const isMobile = window.innerWidth <= 768
            setModalPosition({
                x: rect.left + window.scrollX,
                y: isMobile ? rect.top + window.scrollY - 120 : rect.top + window.scrollY - 60
            })
        }
    }

    const closeModal = useCallback(() => {
        setShowModal(false)
        setSelectedText('')
    }, [])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                closeModal()
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [closeModal])

    const handleOpenGeminiChat = () => {
        setShowGeminiChat(true);
        setShowModal(false);
    };

    const handleExpand = async () => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/ai', {
                method: 'POST',
                body: JSON.stringify({ messages: [{ role: 'user', content: `Giải thích chi tiết đoạn văn bản sau: "${selectedText}" không dùng markdown và chỉ ghi trên 1 dòng với số lượng từ nhiều trong khoảng 400-500 từ!` }] }),
            })
            const data = await response.text()
            setExpandedText(data)
            setIsTypingResponse(true)
            editor?.commands.setTextSelection({ from: editor.state.selection.from, to: editor.state.selection.to })
        } catch (error) {
            console.error('Lỗi khi gọi API:', error)
            setExpandedText('Đã xảy ra lỗi khi xử lý yêu cầu.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSummarize = async () => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/ai', {
                method: 'POST',
                body: JSON.stringify({ messages: [{ role: 'user', content: `Tóm tắt ngắn gọn đoạn văn bản sau: "${selectedText}" không dùng markdown và chỉ ghi trên 1 dòng với số lượng từ ít!` }] }),
            })
            const data = await response.text()
            setExpandedText(data)
            setIsTypingResponse(true)
            editor?.commands.setTextSelection({ from: editor.state.selection.from, to: editor.state.selection.to })
        } catch (error) {
            console.error('Lỗi khi gọi API:', error)
            setExpandedText('Đã xảy ra lỗi khi xử lý yêu cầu.')
        } finally {
            setIsLoading(false)
        }
    }

    if (!editor) {
        return null
    }

    return (
        <div className="relative">
            {isTypingComplete && !isTypingResponse && (
                <EditorContent
                    editor={editor}
                    className="text-gray-300 mb-6 sm:mb-8 whitespace-pre-wrap leading-relaxed text-base sm:text-lg"
                />
            )}
            {!isTypingComplete && (
                <TypeAnimation
                    sequence={[
                        content,
                        () => {
                            editor?.commands.setContent(content)
                            setIsTypingComplete(true)
                        },
                    ]}
                    wrapper="p"
                    speed={99}
                    className="text-gray-300 mb-6 sm:mb-8 whitespace-pre-wrap leading-relaxed text-base sm:text-lg"
                    cursor={false}
                />
            )}
            {isTypingResponse && (
                <TypeAnimation
                    sequence={[
                        expandedText,
                        () => {
                            editor?.commands.setContent(expandedText)
                            setIsTypingResponse(false)
                        },
                    ]}
                    wrapper="p"
                    speed={99}
                    className="text-gray-300 mb-6 sm:mb-8 whitespace-pre-wrap leading-relaxed text-base sm:text-lg"
                    cursor={false}
                />
            )}
            <ModalPortal>
                <AnimatePresence>
                    {showModal && (
                        <motion.div
                            ref={modalRef}
                            style={{
                                position: 'absolute',
                                left: `${modalPosition.x}px`,
                                top: `${modalPosition.y}px`,
                                zIndex: 1000,
                            }}
                            className="bg-[#0F172A] p-2 rounded-lg shadow-lg border border-[#2A3284]"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="flex space-x-2">
                                <button
                                    onClick={handleOpenGeminiChat}
                                    className="flex items-center justify-center bg-[#3B82F6] text-white px-3 py-1 rounded-md hover:bg-[#4B5EFF] transition-colors duration-300"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <IoReloadOutline className="mr-2 text-[#93C5FD] animate-spin" />
                                    ) : (
                                        <IoHelpCircle className="mr-2 text-[#93C5FD]" />
                                    )}
                                    <span className="text-white font-medium">Hỏi AI</span>
                                </button>
                                <button
                                    onClick={handleExpand}
                                    className="flex items-center justify-center bg-[#3B82F6] text-white px-3 py-1 rounded-md hover:bg-[#4B5EFF] transition-colors duration-300"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <IoReloadOutline className="mr-2 text-[#93C5FD] animate-spin" />
                                    ) : (
                                        <IoExpandOutline className="mr-2 text-[#93C5FD]" />
                                    )}
                                    <span className="text-white font-medium">Chi Tiết</span>
                                </button>
                                <button
                                    onClick={handleSummarize}
                                    className="flex items-center justify-center bg-[#3B82F6] text-white px-3 py-1 rounded-md hover:bg-[#4B5EFF] transition-colors duration-300"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <IoReloadOutline className="mr-2 text-[#93C5FD] animate-spin" />
                                    ) : (
                                        <IoContractOutline className="mr-2 text-[#93C5FD]" />
                                    )}
                                    <span className="text-white font-medium">Tóm Tắt</span>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <GeminiChat
                    isOpen={showGeminiChat}
                    onClose={() => setShowGeminiChat(false)}
                    initialInput={selectedText}
                />
            </ModalPortal>
        </div>
    )
}

export default TipTapEditor
