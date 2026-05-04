import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { supabase } from '@/integrations/supabase/client'

export const useChatMessages = (receiverId: string | null) => {
  const queryClient = useQueryClient()
  const userIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!receiverId) return
    let activeChannel: any = null

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      userIdRef.current = user.id

      activeChannel = supabase
        .channel(`chat-${receiverId}`)
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'chat_messages' },
          (payload: any) => {
            const msg = payload.new
            const isRelevant =
              (msg.sender_id === userIdRef.current && msg.receiver_id === receiverId) ||
              (msg.sender_id === receiverId && msg.receiver_id === userIdRef.current)
            
            if (isRelevant) {
              queryClient.invalidateQueries({ queryKey: ['chat', receiverId] })
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
  }, [receiverId, queryClient])

  return useQuery({
    queryKey: ['chat', receiverId],
    queryFn: async () => {
      if (!receiverId) return []
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),` +
          `and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`
        )
        .order('created_at', { ascending: true })
      if (error) throw error
      return data ?? []
    },
    enabled: !!receiverId,
  })
}

export const useSendMessage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (message: { receiver_id: string; content: string }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          sender_id: user.id,
          receiver_id: message.receiver_id,
          content: message.content,
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chat', variables.receiver_id] })
    },
  })
}
