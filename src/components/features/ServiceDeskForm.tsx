import React, { useState } from 'react';
import { Box, Typography, TextField, Button, MenuItem, Alert, CircularProgress, Paper, InputLabel, Select, FormControl } from '@mui/material';
import { useSendPublicServiceDeskRequest } from '../../services/serviceDeskPublicService';

const REQUEST_TYPES = [
  { id: 'hardware_issue', name: 'Awaria sprzętu' },
  { id: 'replacement', name: 'Wymiana sprzętu' },
  { id: 'technical_problem', name: 'Problem techniczny' },
  { id: 'other', name: 'Inne' },
];

const PRIORITIES = [
  { id: 'high', name: 'Wysoki' },
  { id: 'medium', name: 'Średni' },
  { id: 'low', name: 'Niski' },
];

interface ServiceDeskFormProps {
  title?: string;
  subtitle?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
  hidePriority?: boolean;
}

const ServiceDeskForm: React.FC<ServiceDeskFormProps> = ({
  title = 'Zgłoś problem',
  subtitle,
  onSuccess,
  onError,
  className,
  hidePriority = false
}) => {
  const { send } = useSendPublicServiceDeskRequest();
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: '',
    priority: hidePriority ? 'high' : '',
    location: '',
    created_by: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const isValid =
    form.title.length > 3 &&
    form.type &&
    (hidePriority || form.priority) &&
    form.location.length > 2 &&
    (!hidePriority || form.created_by.trim().length > 1);

  return (
    <Paper
      elevation={3}
      sx={{
        width: '100%',
        p: { xs: 2, sm: 4 },
        borderRadius: { xs: 2, sm: 3 },
        textAlign: 'center',
        boxShadow: { xs: 2, sm: 6 },
        bgcolor: { xs: 'rgba(40,40,50,0.98)', sm: 'background.paper' },
        maxWidth: '100vw',
      }}
      className={className}
    >
      <Box sx={{ mb: { xs: 0, sm: 2 } }}>
        <Typography variant="h5" fontWeight={700} color="primary.main">{title}</Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{subtitle}</Typography>
        )}
      </Box>
      <form onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);
        try {
          const data = hidePriority
            ? {
                ...form,
                description: form.description.trim() ? form.description : 'brak opisu',
                priority: 'high',
                created_by: form.created_by.trim(),
              }
            : {
                ...form,
                description: form.description.trim() ? form.description : 'brak opisu',
              };
          await send(data);
          setSuccess(true);
          setForm({ title: '', description: '', type: '', priority: hidePriority ? 'high' : '', location: '', created_by: '' });
          onSuccess?.();
        } catch (e: any) {
          const errorMessage = e.message || 'Wystąpił błąd';
          setError(errorMessage);
          onError?.(errorMessage);
        } finally {
          setLoading(false);
        }
      }}>
        {hidePriority && (
          <TextField
            label="Kto zgłasza? (Imię, ksywka)"
            name="created_by"
            value={form.created_by}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            inputProps={{ maxLength: 60 }}
            helperText={form.created_by && form.created_by.length < 2 ? 'Podaj co najmniej 2 znaki' : 'Podaj swoje imię lub ksywkę, żebyśmy mogli Cię znaleźć'}
            error={!!form.created_by && form.created_by.length < 2}
            sx={{ mb: { xs: 1.5, sm: 2 } }}
          />
        )}
        <TextField
          label="Co się stało?"
          name="title"
          value={form.title}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
          inputProps={{ maxLength: 80 }}
          sx={{ mb: { xs: 1.5, sm: 2 } }}
        />
        <TextField
          label="Opis problemu (opcjonalnie)"
          name="description"
          value={form.description}
          onChange={handleChange}
          fullWidth
          margin="normal"
          multiline
          minRows={3}
          inputProps={{ maxLength: 500 }}
          placeholder="np. co dokładnie nie działa, dodatkowe szczegóły..."
          sx={{ mb: { xs: 1.5, sm: 2 } }}
        />
        <FormControl fullWidth margin="normal" required sx={{ mb: { xs: 1.5, sm: 2 } }}>
          <InputLabel id="type-label">Typ zgłoszenia</InputLabel>
          <Select
            labelId="type-label"
            name="type"
            value={form.type}
            label="Typ zgłoszenia"
            onChange={handleChange}
          >
            {REQUEST_TYPES.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
          </Select>
        </FormControl>
        {!hidePriority && (
          <FormControl fullWidth margin="normal" required sx={{ mb: { xs: 1.5, sm: 2 } }}>
            <InputLabel id="priority-label">Priorytet</InputLabel>
            <Select
              labelId="priority-label"
              name="priority"
              value={form.priority}
              label="Priorytet"
              onChange={handleChange}
            >
              {PRIORITIES.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
            </Select>
          </FormControl>
        )}
        <TextField
          label="Lokalizacja (np. sala, pawilon, miejsce)"
          name="location"
          value={form.location}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
          inputProps={{ maxLength: 60 }}
          sx={{ mb: { xs: 2, sm: 2.5 } }}
        />
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2 }}>Zgłoszenie zostało wysłane!</Alert>}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2, py: 1.4, fontWeight: 600, fontSize: { xs: '1.1rem', sm: '1rem' }, borderRadius: 2 }}
          disabled={!isValid || loading}
          endIcon={loading ? <CircularProgress size={20} /> : null}
        >
          Wyślij zgłoszenie
        </Button>
      </form>
    </Paper>
  );
};

export default ServiceDeskForm; 