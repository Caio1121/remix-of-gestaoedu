import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const ASAAS_API_KEY = Deno.env.get('ASAAS_API_KEY')
const ASAAS_URL = 'https://sandbox.asaas.com/api/v3' // Use https://api.asaas.com para produção

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Tratar preflight CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { amount, description, studentId, studentEmail, studentName, studentCpf } = await req.json()

        if (!ASAAS_API_KEY) {
            throw new Error('ASAAS_API_KEY não configurada no Supabase')
        }

        // 1. Criar ou Buscar Cliente no Asaas
        const customerResponse = await fetch(`${ASAAS_URL}/customers?email=${studentEmail}`, {
            headers: { 'access_token': ASAAS_API_KEY }
        })
        const customers = await customerResponse.json()

        let customerId
        if (customers.data.length > 0) {
            customerId = customers.data[0].id
        } else {
            const newCustomer = await fetch(`${ASAAS_URL}/customers`, {
                method: 'POST',
                headers: {
                    'access_token': ASAAS_API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: studentName,
                    email: studentEmail,
                    cpfCnpj: studentCpf
                })
            })
            const customerData = await newCustomer.json()
            customerId = customerData.id
        }

        // 2. Criar Cobrança (Pix/Boleto)
        const paymentResponse = await fetch(`${ASAAS_URL}/payments`, {
            method: 'POST',
            headers: {
                'access_token': ASAAS_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                customer: customerId,
                billingType: 'UNDEFINED', // Permite que o cliente escolha no checkout do Asaas ou você fixa aqui
                value: amount,
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 dias
                description: description,
                externalReference: studentId
            })
        })

        const paymentData = await paymentResponse.json()

        return new Response(
            JSON.stringify(paymentData),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: (error as Error).message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400
            }
        )
    }
})
