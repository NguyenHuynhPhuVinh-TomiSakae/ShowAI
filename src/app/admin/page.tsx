'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useFirebase } from '@/components/FirebaseConfig'
import { useFirestoreOperations } from '@/utils/firestore'
import AdminUI from './AdminUI'
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage'
import { FirebaseStorage } from 'firebase/storage'
import SkeletonLoader from './SkeletonLoader' // Giả sử bạn đã tạo file này
import { getAuth, sendPasswordResetEmail } from 'firebase/auth'

interface DataItem {
    _id: string;
    id: string;
    name: string;
    description: string[];
    tags: string[];
    link: string;
    keyFeatures: string[];
    heart: number;
    star: number;
    view: number;
    image?: string;
    comments: any[];
    shortComments: any[];
    ratings: any[];
}

export default function Admin() {
    const [, setIsAuthorized] = useState(false)
    const { isInitialized, auth, app } = useFirebase()
    const { getUserFromFirestore } = useFirestoreOperations()
    const router = useRouter()
    const [data, setData] = useState<DataItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [formData, setFormData] = useState<Partial<DataItem>>({})
    const [searchTerm] = useState('')
    const [selectedTag, setSelectedTag] = useState('')
    const [dataFetched, setDataFetched] = useState(false)
    const [storage, setStorage] = useState<FirebaseStorage | null>(null)

    useEffect(() => {
        if (isInitialized) {
            setStorage(getStorage(app))
        }
    }, [isInitialized, app])

    const fetchData = useCallback(async () => {
        if (dataFetched) return; // Prevent refetching if data has already been fetched
        setIsLoading(true)
        try {
            const response = await fetch('/api/showai')
            if (!response.ok) {
                throw new Error('Failed to fetch data')
            }
            const result = await response.json()
            setData(result.data)
            setDataFetched(true) // Mark data as fetched
        } catch (error) {
            console.error('Error fetching data:', error)
            setError('An error occurred while fetching data')
        } finally {
            setIsLoading(false)
        }
    }, [dataFetched])

    useEffect(() => {
        const checkAuthorization = async () => {
            if (auth) {
                const unsubscribe = auth.onAuthStateChanged(async (user) => {
                    if (user) {
                        const userData = await getUserFromFirestore(user.uid)
                        if (userData && userData.admin === 1) {
                            setIsAuthorized(true)
                            fetchData() // Call fetchData here after authorization
                        } else {
                            router.push('/')
                        }
                    } else {
                        router.push('/login')
                    }
                })
                return () => unsubscribe()
            }
        }

        checkAuthorization()
    }, [auth, getUserFromFirestore, router, fetchData])

    const filterData = () => {
        let filtered = data
        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description.some(desc => desc.toLowerCase().includes(searchTerm.toLowerCase()))
            )
        }
        if (selectedTag) {
            filtered = filtered.filter(item =>
                item.tags.some(tag => tag.toLowerCase() === selectedTag.toLowerCase())
            )
        }
        return filtered
    }

    const handleAdd = () => {
        const maxId = Math.max(...data.map(item => parseInt(item.id)), 0);
        setFormData({
            id: (maxId + 1).toString(),
            name: '',
            description: [],
            tags: [],
            link: '',
            keyFeatures: [],
            heart: 0,
            star: 0,
            view: 0,
            image: ''
        })
    }

    const handleEdit = (item: DataItem) => {
        setFormData({ ...item, keyFeatures: item.keyFeatures || [] })
    }

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa "${name}"?`)) {
            try {
                const response = await fetch('/api/showai', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id }),
                })
                if (!response.ok) {
                    throw new Error('Failed to delete item')
                }
                fetchData()
            } catch (error) {
                console.error('Error deleting item:', error)
                setError('An error occurred while deleting the item')
            }
        }
    }

    const uploadImage = async (imageData: string, id: string): Promise<string> => {
        if (!storage) {
            throw new Error('Storage chưa được khởi tạo')
        }
        const imageName = `website_images/${id}.jpg`
        const storageRef = ref(storage, imageName)

        try {
            // Tải lên ảnh dưới dạng base64
            await uploadString(storageRef, imageData, 'data_url')
            // Lấy URL tải xuống
            const downloadURL = await getDownloadURL(storageRef)
            return downloadURL
        } catch (error) {
            console.error('Lỗi khi tải lên ảnh:', error)
            throw error
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            let imageUrl = formData.image

            // Nếu có ảnh mới được tải lên (dạng base64), tải nó lên Firebase Storage
            if (formData.image && formData.image.startsWith('data:image')) {
                const id = formData.id || (Math.max(...data.map(item => parseInt(item.id)), 0) + 1).toString()
                imageUrl = await uploadImage(formData.image, id)
            }

            const url = '/api/showai'
            const method = formData._id ? 'PUT' : 'POST'
            const body = formData._id
                ? { _id: formData._id, ...formData, image: imageUrl }
                : { ...formData, image: imageUrl };

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            })
            if (!response.ok) {
                throw new Error(`Không thể ${formData._id ? 'cập nhật' : 'thêm'} mục`)
            }
            if (!formData._id) {
                // Nếu đây là một AI mới (không có _id), gửi thông báo
                await sendNotificationForNewAI(formData.name || '');
            }
            fetchData()
            setFormData({}) // Đặt lại form sau khi gửi thành công
        } catch (error) {
            console.error(`Lỗi ${formData._id ? 'cập nhật' : 'thêm'} mục:`, error)
            setError(`Đã xảy ra lỗi khi ${formData._id ? 'cập nhật' : 'thêm'} mục`)
        }
    }

    const sendNotificationForNewAI = async (aiName: string) => {
        try {
            // Lấy danh sách email
            const emailResponse = await fetch('/api/getEmail');
            if (!emailResponse.ok) {
                throw new Error('Không thể lấy danh sách email');
            }
            const emails = await emailResponse.json();

            // Gửi email thông báo cho từng địa chỉ
            const auth = getAuth(app);
            for (const email of emails) {
                try {
                    await sendPasswordResetEmail(auth, email, {
                        url: `${window.location.origin}/ai/${aiName}`,
                        handleCodeInApp: true,
                    });
                    console.log(`Đã gửi thông báo đến ${email}`);
                } catch (error) {
                    console.error(`Lỗi khi gửi email đến ${email}:`, error);
                }
            }
        } catch (error) {
            console.error('Lỗi khi gửi thông báo:', error);
        }
    }

    if (isLoading) return <SkeletonLoader />
    if (error) return <div className="text-center mt-8 text-red-500">{error}</div>

    const filteredData = filterData()

    return (
        <AdminUI
            filteredData={filteredData}
            formData={formData}
            handleAdd={handleAdd}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            handleSubmit={handleSubmit}
            setSelectedTag={setSelectedTag}
            setFormData={setFormData}
        />
    )
}
