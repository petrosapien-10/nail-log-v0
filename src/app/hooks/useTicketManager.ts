'use client';

import { useState } from 'react';
import { useCreateTicketMutation } from '@/app/store/publicApiSlice';
import { TicketData } from '@/types/ticket';

interface TicketManagerOptions {
  refetch: () => void;
}

interface UseTicketManagerResult {
  isTicketModalOpen: boolean;
  openTicketModal: () => void;
  closeTicketModal: () => void;
  isCreating: boolean;
  handleCreateTicket: (
    userId: string,
    sessionId: string,
    ticketData: TicketData
  ) => Promise<{ success: boolean }>;
}

export function useTicketManager({ refetch }: TicketManagerOptions): UseTicketManagerResult {
  const [createTicketMutation, { isLoading: isCreating }] = useCreateTicketMutation();
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  const openTicketModal = () => setIsTicketModalOpen(true);
  const closeTicketModal = () => setIsTicketModalOpen(false);

  const handleCreateTicket = async (
    userId: string,
    sessionId: string,
    ticketData: TicketData
  ): Promise<{ success: boolean }> => {
    try {
      await createTicketMutation({
        userId,
        sessionId,
        data: ticketData,
      }).unwrap();

      refetch();
      closeTicketModal();

      return { success: true };
    } catch {
      return { success: false };
    }
  };

  return {
    isTicketModalOpen,
    openTicketModal,
    closeTicketModal,
    isCreating,
    handleCreateTicket,
  };
}
