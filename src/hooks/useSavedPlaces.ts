import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { toast } from '@/lib/toast';

export interface SavedPlace {
  id: number;
  name: string;
  address?: string | null;
  latitude: number;
  longitude: number;
  type: 'HOME' | 'WORK' | 'SCHOOL' | 'GYM' | 'OTHER';
  icon?: string | null;
  color?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SavedPlaceInput {
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  type: SavedPlace['type'];
  icon?: string;
  color?: string;
}

const QK = ['saved-places'] as const;

export function useGetSavedPlaces() {
  return useQuery({
    queryKey: QK,
    queryFn: async () => {
      const { data } = await api.get('/saved-places');
      return data.data as SavedPlace[];
    },
  });
}

export function useCreateSavedPlace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: SavedPlaceInput) => {
      const { data } = await api.post('/saved-places', payload);
      return data.data as SavedPlace;
    },
    onSuccess: () => {
      toast.success('Place saved!');
      qc.invalidateQueries({ queryKey: QK });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Failed to save place');
    },
  });
}

export function useUpdateSavedPlace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<SavedPlaceInput> & { id: number }) => {
      const { data } = await api.patch(`/saved-places/${id}`, payload);
      return data.data as SavedPlace;
    },
    onSuccess: () => {
      toast.success('Place updated');
      qc.invalidateQueries({ queryKey: QK });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Failed to update place');
    },
  });
}

export function useDeleteSavedPlace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/saved-places/${id}`);
      return id;
    },
    onSuccess: () => {
      toast.success('Place deleted');
      qc.invalidateQueries({ queryKey: QK });
    },
    onError: () => toast.error('Failed to delete place'),
  });
}
