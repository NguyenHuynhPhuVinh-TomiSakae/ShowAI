'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useFirebase } from '@/components/FirebaseConfig'
import { useFirestoreOperations } from '@/utils/firestore'
import AdminUI from './AdminUI'

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
}

export default function Admin() {
    const [isAuthorized, setIsAuthorized] = useState(false)
    const { auth } = useFirebase()
    const { getUserFromFirestore } = useFirestoreOperations()
    const router = useRouter()
    const [data, setData] = useState<DataItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [formData, setFormData] = useState<Partial<DataItem>>({})
    const [isEditing, setIsEditing] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedTag, setSelectedTag] = useState('')
    const [viewMode, setViewMode] = useState<'full' | 'compact'>('full')
    const [dataFetched, setDataFetched] = useState(false)

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

    if (!isAuthorized) {
        return <div className="text-center mt-8">Đang kiểm tra quyền truy cập...</div>
    }

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
            keyFeatures: [],
            heart: 0,
            star: 0,
            view: 0
        })
        setIsEditing(false)
        setIsFormOpen(true)
    }

    const handleEdit = (item: DataItem) => {
        setFormData({ ...item, keyFeatures: item.keyFeatures || [] })
        setIsEditing(true)
        setIsFormOpen(true)
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const url = '/api/showai'
            const method = isEditing ? 'PUT' : 'POST'
            const body = isEditing
                ? { _id: formData._id, ...formData }
                : formData;

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            })
            if (!response.ok) {
                throw new Error(`Failed to ${isEditing ? 'update' : 'add'} item`)
            }
            fetchData()
            setIsFormOpen(false)
        } catch (error) {
            console.error(`Error ${isEditing ? 'updating' : 'adding'} item:`, error)
            setError(`An error occurred while ${isEditing ? 'updating' : 'adding'} the item`)
        }
    }

    if (isLoading) return <div className="text-center mt-8">Loading...</div>
    if (error) return <div className="text-center mt-8 text-red-500">{error}</div>

    const filteredData = filterData()

    return (
        <AdminUI
            filteredData={filteredData}
            viewMode={viewMode}
            searchTerm={searchTerm}
            selectedTag={selectedTag}
            isFormOpen={isFormOpen}
            isEditing={isEditing}
            formData={formData}
            handleAdd={handleAdd}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            handleSubmit={handleSubmit}
            setSearchTerm={setSearchTerm}
            setSelectedTag={setSelectedTag}
            setViewMode={setViewMode}
            setIsFormOpen={setIsFormOpen}
            setFormData={setFormData}
        />
    )
}
