import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Rate limiter - 10 requests per minute per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 10;       // máximo de requisições
const RATE_LIMIT_WINDOW = 60000; // janela em ms (60 segundos)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Rate limiting
  const clientIp =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('cf-connecting-ip') ??
    'unknown';

  const now = Date.now();
  const record = rateLimitMap.get(clientIp);

  if (record && now < record.resetAt) {
    record.count += 1;
    if (record.count > RATE_LIMIT_MAX) {
      return new Response(
        JSON.stringify({ error: 'Too Many Requests' }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Retry-After': String(Math.ceil((record.resetAt - now) / 1000)),
          },
        }
      );
    }
  } else {
    rateLimitMap.set(clientIp, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
  }

  try {
    const { amount, description, studentId } = await req.json()

    // Mock implementation of Asaas API call
    console.log(`Creating Asaas charge for student ${studentId}: R$ ${amount} - ${description}`)

    return new Response(JSON.stringify({ success: true, chargeId: 'mock_charge_id' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
