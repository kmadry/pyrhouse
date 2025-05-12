import React, { useState } from 'react';
import { Box, Typography, MenuItem, Alert, CircularProgress, InputLabel, FormControl } from '@mui/material';
import { useSendPublicServiceDeskRequest } from '../../services/serviceDeskPublicService';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { StyledPaper, StyledTextField, StyledSelect, StyledButton } from './ServiceDeskForm.styles';

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
    form.location.length > 1 &&
    (!hidePriority || form.created_by.trim().length > 1);

  return (
    <>
      {success && hidePriority ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320, py: 4 }}>
          <Box sx={{
            bgcolor: 'rgba(255,255,255,0.98)',
            borderRadius: 4,
            px: { xs: 2, sm: 4 },
            py: { xs: 3, sm: 4 },
            boxShadow: 6,
            maxWidth: 360,
            width: '100%',
            textAlign: 'center',
            mb: 2,
          }}>
            <CheckCircleOutlineIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h5" fontWeight={700} color="success.main" gutterBottom>
              Dziękujemy za zgłoszenie!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 320, mx: 'auto' }}>
              Twoje zgłoszenie zostało przesłane do zespołu technicznego.
            </Typography>
            <StyledButton isPublic onClick={() => window.location.reload()}>
              Wyślij kolejne zgłoszenie
            </StyledButton>
          </Box>
        </Box>
      ) : (
        <StyledPaper isPublic={hidePriority} className={className}>
          <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
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
              <StyledTextField
                isPublic
                label="Kto zgłasza? (Imię, ksywka)"
                name="created_by"
                value={form.created_by}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
                inputProps={{ maxLength: 60, minLength: 2 }}
                error={!!form.created_by && form.created_by.length < 2}
              />
            )}
            <StyledTextField
              isPublic={hidePriority}
              label="Co się stało?"
              name="title"
              value={form.title}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              inputProps={{ maxLength: 80 }}
            />
            <StyledTextField
              isPublic={hidePriority}
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
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="type-label">{'Typ zgłoszenia'}</InputLabel>
              <StyledSelect
                isPublic={hidePriority}
                labelId="type-label"
                name="type"
                value={form.type}
                label="Typ zgłoszenia"
                onChange={handleChange}
              >
                {REQUEST_TYPES.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
              </StyledSelect>
            </FormControl>
            {!hidePriority && (
              <FormControl fullWidth margin="normal" required>
                <InputLabel id="priority-label">Priorytet</InputLabel>
                <StyledSelect
                  isPublic={false}
                  labelId="priority-label"
                  name="priority"
                  value={form.priority}
                  label="Priorytet"
                  onChange={handleChange}
                >
                  {PRIORITIES.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                </StyledSelect>
              </FormControl>
            )}
            <StyledTextField
              isPublic={hidePriority}
              label="Lokalizacja (np. sala, pawilon, miejsce)"
              name="location"
              value={form.location}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              inputProps={{ maxLength: 60, minLength: 2 }}
            />
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            {!hidePriority && success && <Alert severity="success" sx={{ mt: 2 }}>Zgłoszenie zostało wysłane!</Alert>}
            <StyledButton
              isPublic={hidePriority}
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={!isValid || loading}
              endIcon={loading ? <CircularProgress size={20} /> : null}
            >
              Wyślij zgłoszenie
            </StyledButton>
          </form>
        </StyledPaper>
      )}
    </>
  );
};

export default ServiceDeskForm; 