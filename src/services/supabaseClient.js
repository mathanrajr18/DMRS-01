/**
 * DMRS-01 Supabase Client
 * 
 * Configured using Vite environment variables:
 * - VITE_SUPABASE_URL
 * - VITE_SUPABASE_PUBLISHABLE_KEY
 * 
 * SECURITY NOTICE:
 * Uses ONLY the public / anon publishable key.
 * The Supabase secret (service_role) key is NEVER used or exposed.
 */

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const SUPABASE_KEY = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

/**
 * Checks whether valid Supabase credentials have been configured
 */
export const isSupabaseConfigured = () => {
  if (!SUPABASE_URL || !SUPABASE_KEY) return false;
  if (SUPABASE_URL.includes('your-project') || SUPABASE_KEY.includes('your-supabase')) return false;
  try {
    new URL(SUPABASE_URL);
    return true;
  } catch {
    return false;
  }
};

/**
 * Lightweight, robust PostgREST query client compatible with the Supabase API:
 * supabase.from('telemetry').select('*').order('created_at', { ascending: false }).limit(20)
 */
export const createClient = (url, key) => {
  const cleanUrl = (url || '').replace(/\/+$/, '');

  return {
    from: (table) => {
      let selectFields = '*';
      let orderCol = null;
      let ascending = true;
      let limitCount = null;

      const builder = {
        select: (fields = '*') => {
          selectFields = fields;
          return builder;
        },
        order: (col, opts = {}) => {
          orderCol = col;
          ascending = opts.ascending ?? true;
          return builder;
        },
        limit: (count) => {
          limitCount = count;
          return builder;
        },
        // Allows awaiting the builder directly: const { data, error } = await supabase.from(...)
        then: (onfulfilled, onrejected) => {
          return executeQuery().then(onfulfilled, onrejected);
        },
      };

      const executeQuery = async () => {
        if (!isSupabaseConfigured()) {
          return {
            data: null,
            error: { message: 'Supabase credentials not configured in VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY' },
          };
        }

        try {
          const params = new URLSearchParams();
          if (selectFields) params.append('select', selectFields);
          if (orderCol) params.append('order', `${orderCol}.${ascending ? 'asc' : 'desc'}`);
          if (limitCount !== null && limitCount !== undefined) params.append('limit', String(limitCount));

          const endpoint = `${cleanUrl}/rest/v1/${table}?${params.toString()}`;
          const res = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'apikey': key,
              'Authorization': `Bearer ${key}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          });

          if (!res.ok) {
            const errText = await res.text();
            let parsedErr;
            try {
              parsedErr = JSON.parse(errText);
            } catch {
              parsedErr = { message: errText || `HTTP ${res.status} ${res.statusText}` };
            }
            return { data: null, error: parsedErr };
          }

          const data = await res.json();
          return { data, error: null };
        } catch (networkErr) {
          return {
            data: null,
            error: { message: networkErr.message || 'Network request to Supabase failed' },
          };
        }
      };

      return builder;
    },
  };
};

// Singleton Supabase Client instance
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Fetch the latest single telemetry row from public.telemetry (created_at descending)
 */
export async function fetchLatestTelemetryRow() {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: 'Supabase not configured' } };
  }

  const { data, error } = await supabase
    .from('telemetry')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) {
    return { data: null, error };
  }

  return { data: data[0], error: null };
}

/**
 * Fetch historical telemetry rows for charting (ordered chronologically: oldest -> newest)
 */
export async function fetchTelemetryHistoryRows(limit = 16) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: 'Supabase not configured' } };
  }

  const { data, error } = await supabase
    .from('telemetry')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data || data.length === 0) {
    return { data: null, error };
  }

  // Reverse to chronological order (oldest -> newest) for plotting on graphs
  const chronological = [...data].reverse();
  return { data: chronological, error: null };
}
