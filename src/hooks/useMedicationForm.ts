/**
 * src/hooks/useMedicationForm.ts
 *
 * Shared form state, branchId resolution, validation, and submit handler
 * for the Add Medication pages across pharmacy, branch, and staff portals.
 *
 * The three portals differ only in HOW they resolve the branchId:
 *   pharmacy     → fetches GET /branches/my-branches → shows a <select> of branches
 *   branch       → infers from JWT context via GET /attendance/summary (no select needed)
 *   staff        → fetches GET /staff/profile/me which returns branch info directly
 *
 * The hook returns state + a submit handler. JSX stays in the page component.
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { FDA_CATEGORIES } from '@/lib/constants';

export type MedicationFormRole = 'pharmacy' | 'branch' | 'staff';

export interface MedicationFormState {
  name: string;
  category: string;
  chemicalName: string;
  description: string;
  price: string;
  quantity: string;
  lowStockThreshold: string;
  requiresPrescription: boolean;
  // pharmacy only — ignored for branch/staff
  branchId: string;
}

export interface UseMedicationFormReturn {
  /** Current form field values */
  form: MedicationFormState;
  /** Setter — update any field */
  setForm: React.Dispatch<React.SetStateAction<MedicationFormState>>;
  /** True while the POST /medications call is in flight */
  loading: boolean;
  /** True while branch/profile data is loading on mount */
  contextLoading: boolean;
  /** pharmacy: list of branches for the <select>; empty for other roles */
  branches: { id: string; name: string }[];
  /** branch/staff: display name of the resolved branch (read-only field) */
  branchName: string;
  /** branch: true if the backend returned 403 (Role not yet permitted) */
  backendPending: boolean;
  /** Call this from the form's onSubmit */
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

const INITIAL_FORM: MedicationFormState = {
  name: '',
  category: FDA_CATEGORIES[0],
  chemicalName: '',
  description: '',
  price: '',
  quantity: '',
  lowStockThreshold: '10',
  requiresPrescription: false,
  branchId: '',
};

const REDIRECT: Record<MedicationFormRole, string> = {
  pharmacy: '/pharmacy/inventory',
  branch:   '/branch/inventory',
  staff:    '/staff/inventory',
};

export function useMedicationForm(role: MedicationFormRole): UseMedicationFormReturn {
  const { t }  = useTranslation();
  const router = useRouter();

  const [form, setForm]               = useState<MedicationFormState>(INITIAL_FORM);
  const [loading, setLoading]         = useState(false);
  const [contextLoading, setCtxLoad]  = useState(true);
  const [branches, setBranches]       = useState<{ id: string; name: string }[]>([]);
  const [branchId, setBranchId]       = useState('');
  const [branchName, setBranchName]   = useState('');
  const [backendPending, setBackendPending] = useState(false);

  // ── Mount: resolve branchId according to role ──────────────────────────
  useEffect(() => {
    if (role === 'pharmacy') {
      api.get('/branches/my-branches')
        .then(res => {
          const list: { id: string; name: string }[] =
            res.data?.data ?? res.data ?? [];
          setBranches(list);
          // Auto-select when there is exactly one branch
          if (list.length === 1) {
            setForm(f => ({ ...f, branchId: list[0].id }));
          }
        })
        .catch(() => toast.error(t('errors.failedToLoadBranches')))
        .finally(() => setCtxLoad(false));

    } else if (role === 'branch') {
      // Branch manager: branchId is resolved server-side from JWT.
      // We try the localStorage cache first, then fall back to attendance summary
      // which at least gives us the branch name for display.
      const cached = localStorage.getItem('branchId') ?? sessionStorage.getItem('branchId');
      if (cached) {
        setBranchId(cached);
        setCtxLoad(false);
      } else {
        api.get('/attendance/summary')
          .then(res => {
            if (res.data?.branchName) setBranchName(res.data.branchName);
            // branchId resolved server-side — no need to store it here
          })
          .catch(() => { /* non-fatal — submit will still work via JWT */ })
          .finally(() => setCtxLoad(false));
      }

    } else {
      // staff: GET /staff/profile/me returns branchId and branch.name
      api.get('/staff/profile/me')
        .then(res => {
          setBranchName(res.data?.branch?.name ?? '');
          setBranchId(res.data?.branchId ?? res.data?.branch?.id ?? '');
        })
        .catch(() => toast.error(t('errors.failedLoadBranchInfo')))
        .finally(() => setCtxLoad(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  // ── Submit handler ─────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // pharmacy must have a branch selected
    if (role === 'pharmacy' && !form.branchId) {
      toast.error(t('form.selectBranch'));
      return;
    }

    // staff must have resolved a branchId
    if (role === 'staff' && !branchId) {
      toast.error(t('errors.branchNotFound'));
      return;
    }

    setLoading(true);
    try {
      await api.post('/medications', {
        // pharmacy sends the selected branchId from the form;
        // branch/staff send the resolved one (backend also reads it from JWT)
        branchId: role === 'pharmacy' ? form.branchId : branchId || undefined,
        name:                   form.name,
        chemicalName:           form.chemicalName   || undefined,
        description:            form.description    || undefined,
        category:               form.category,
        price:                  parseFloat(form.price),
        quantity:               parseInt(form.quantity),
        lowStockThreshold:      parseInt(form.lowStockThreshold),
        requiresPrescription:   form.requiresPrescription,
      });

      toast.success(t('success.medicationAdded'));
      router.push(REDIRECT[role]);

    } catch (err: any) {
      if (err?.response?.status === 403) {
        // Backend hasn't granted this role access to POST /medications yet
        setBackendPending(true);
        toast.error(t('errors.backendNotEnabled'));
      } else {
        toast.error(err?.response?.data?.message || t('errors.failedToLoad'));
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    setForm,
    loading,
    contextLoading,
    branches,
    branchName,
    backendPending,
    handleSubmit,
  };
}
