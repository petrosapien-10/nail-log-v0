'use client';

import { useState, useCallback } from 'react';
import { useCreateTicketMutation } from '@/app/store/publicApiSlice';
import { TicketData } from '@/types/ticket';

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

export function useTicketManager(): UseTicketManagerResult {
  const [createTicketMutation, { isLoading: isCreating }] = useCreateTicketMutation();
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  const openTicketModal = useCallback(() => setIsTicketModalOpen(true), []);
  const closeTicketModal = useCallback(() => setIsTicketModalOpen(false), []);

  const handleCreateTicket = useCallback(
    async (
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

        closeTicketModal();

        return { success: true };
      } catch {
        return { success: false };
      }
    },
    [createTicketMutation, closeTicketModal]
  );

  return {
    isTicketModalOpen,
    openTicketModal,
    closeTicketModal,
    isCreating,
    handleCreateTicket,
  };
}
