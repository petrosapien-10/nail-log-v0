'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslate } from '@/locales/hooks/useTranslate';

interface Props {
  setSuccessMessage: (msg: string) => void;
  setErrorMessage: (msg: string) => void;
}

export default function LogoutStatusHandler({ setSuccessMessage, setErrorMessage }: Props) {
  const { t } = useTranslate();
  const searchParams = useSearchParams();
  const router = useRouter();
  const logoutStatus = searchParams.get('logout');

  useEffect(() => {
    if (logoutStatus === 'success') {
      setSuccessMessage(t('signed_out_successfully'));
    } else if (logoutStatus === 'fail') {
      setErrorMessage(t('failed_to_sign_out'));
    }

    if (logoutStatus) {
      router.replace(window.location.pathname);
    }
  }, [logoutStatus, t, router, setSuccessMessage, setErrorMessage]);

  return null;
}
