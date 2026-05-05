import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { supabase } from '@/integrations/supabase/client'

export const useChatMessages = (receiverid: string | null) => {
  const queryClient = useQueryClient()
  const userIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!receiverid) return
    let activeChannel: any = null

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      userIdRef.current = user.id

      activeChannel = supabase
        .channel(`chat-${receiverid}`)
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'chat_messages' },
          (payload: any) => {
            const msg = payload.new
            const isRelevant =
              (msg.senderid === userIdRef.current && msg.receiverid === receiverid) ||
              (msg.senderid === receiverid && msg.receiverid === userIdRef.current)
            
            if (isRelevant) {
              queryClient.invalidateQueries({ queryKey: ['chat', receiverid] })
            }
          }
        )
        .subscribe()
    })

    return () => { 
      if (activeChannel) {
        supabase.removeChannel(activeChannel) 
      }
    }
  }, [receiverid, queryClient])

  return useQuery({
    queryKey: ['chat', receiverid],
    queryFn: async () => {
      if (!receiverid) return []
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .or(
          `and(senderid.eq.${user.id},receiverid.eq.${receiverid}),` +
          `and(senderid.eq.${receiverid},receiverid.eq.${user.id})`
        )
        .order('createdat', { ascending: true })
      if (error) throw error
      return data ?? []
    },
    enabled: !!receiverid,
  })
}

export const useSendMessage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (message: { receiverid: string; content: string }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          senderid: user.id,
          receiverid: message.receiverid,
          content: message.content,
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chat', variables.receiverid] })
    },
  })
}
