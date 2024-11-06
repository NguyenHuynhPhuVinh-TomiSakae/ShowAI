import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export const useSupabase = () => {
    const [supabase, setSupabase] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initSupabase = async () => {
            try {
                const response = await fetch('/api/supabase-key');
                const { url, key } = await response.json();

                if (!url || !key) {
                    throw new Error('Không thể lấy thông tin xác thực Supabase');
                }

                const supabaseClient = createClient(url, key);
                setSupabase(supabaseClient);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Lỗi khi khởi tạo Supabase');
            } finally {
                setLoading(false);
            }
        };

        initSupabase();
    }, []);

    return { supabase, loading, error };
};
