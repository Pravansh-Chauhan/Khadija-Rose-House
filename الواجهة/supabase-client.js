(function () {
    const config = window.KRH_SUPABASE_CONFIG;
    const hasUrl = typeof config?.url === 'string' && config.url.trim();
    const hasKey = typeof config?.anonKey === 'string' && config.anonKey.trim();

    if (!hasUrl && !hasKey) {
        window.krhSupabase = null;
        return;
    }

    if (!hasUrl || !hasKey || !window.supabase?.createClient) {
        console.error('Supabase configuration is incomplete or the Supabase library failed to load.');
        window.krhSupabase = null;
        return;
    }

    window.krhSupabase = window.supabase.createClient(config.url.trim(), config.anonKey.trim(), {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    });
})();
