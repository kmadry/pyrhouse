import { useState, useCallback, useEffect } from 'react';
import { getApiUrl } from '../config/api';

export interface JiraTicket {
  issueId: string;
  issueKey: string;
  summary: string;
  requestTypeId: string;
  serviceDeskId: string;
  createdDate: {
    iso8601: string;
    jira: string;
    friendly: string;
  };
  reporter: {
    accountId: string;
    emailAddress: string;
    displayName: string;
    active: boolean;
    timeZone: string;
    _links: {
      jiraRest: string;
      avatarUrls: {
        '16x16': string;
        '32x32': string;
      };
    };
  };
  requestFieldValues: Array<{
    fieldId: string;
    label: string;
    value: string | null | any[];
  }>;
  currentStatus: {
    status: string;
    statusCategory: string;
    statusDate: {
      iso8601: string;
      jira: string;
      friendly: string;
    };
  };
  _links: {
    web: string;
  };
}

export type TicketStatus = 'oczekiwanie na wsparcie' | 'w trakcie' | 'zakończone' | 'zamknięte';

export const useJiraTickets = () => {
  const [tickets, setTickets] = useState<JiraTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  const [newTickets, setNewTickets] = useState<Set<string>>(new Set());

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('/jira/tasks'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Nie udało się pobrać ticketów');
      }
      
      const data = await response.json();
      
      // Sprawdź nowe tickety
      const currentTicketIds = new Set(tickets.map(t => t.issueId));
      const newTicketIds = data
        .filter((t: JiraTicket) => !currentTicketIds.has(t.issueId))
        .map((t: JiraTicket) => t.issueId);
      
      if (newTicketIds.length > 0) {
        setNewTickets(new Set(newTicketIds));
        // Automatycznie usuń oznaczenie nowych ticketów po 5 sekundach
        setTimeout(() => {
          setNewTickets(prev => {
            const updated = new Set(prev);
            newTicketIds.forEach((id: string) => updated.delete(id));
            return updated;
          });
        }, 5000);
      }
      
      setTickets(data);
      setLastUpdateTime(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił nieoczekiwany błąd');
    } finally {
      setLoading(false);
    }
  }, [tickets]);

  // Automatyczne odświeżanie co 30 sekund
  useEffect(() => {
    const interval = setInterval(fetchTickets, 30000);
    return () => clearInterval(interval);
  }, [fetchTickets]);

  const groupTicketsByStatus = useCallback(() => {
    const grouped = tickets.reduce((acc, ticket) => {
      const status = ticket.currentStatus.status.toLowerCase() as TicketStatus;
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(ticket);
      return acc;
    }, {} as Record<TicketStatus, JiraTicket[]>);

    return {
      'oczekiwanie na wsparcie': grouped['oczekiwanie na wsparcie'] || [],
      'w trakcie': grouped['w trakcie'] || [],
      'zakończone': grouped['zakończone'] || [],
      'zamknięte': grouped['zamknięte'] || [],
    };
  }, [tickets]);

  return { 
    tickets, 
    loading, 
    error, 
    refreshTickets: fetchTickets,
    lastUpdateTime,
    newTickets,
    groupTicketsByStatus
  };
}; 