'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { validateEmail } from '@/utils/authValidation';
import styles from './ChangeEmailModal.module.css';

type ChangeEmailModalProps = {
  isOpen: boolean;
  currentEmail?: string;
  onClose: () => void;
  onSubmit: (data: { email: string; password: string }) => Promise<void>;
};

function ChangeEmailModalContent({
  currentEmail = '',
  onClose,
  onSubmit,
}: Omit<ChangeEmailModalProps, 'isOpen'>) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    document.body.classList.add('noScroll');
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('noScroll');
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={styles.modal}
        onClick={(event) => event.stopPropagation()}
      >
        <Image
          src="/logo.svg"
          alt="SkyFitnessPro"
          width={220}
          height={35}
          className={styles.logo}
        />

        {isSuccess ? (
          <div className={styles.success}>
            <h2 className={styles.title}>Логин успешно изменён</h2>
            <button
              className={styles.primaryButton}
              type="button"
              onClick={onClose}
            >
              Закрыть
            </button>
          </div>
        ) : (
          <form
            className={styles.form}
            onSubmit={async (event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const email = String(formData.get('email') || '').trim();
              const password = String(formData.get('password') || '');

              const emailError = validateEmail(email);
              if (emailError) {
                setError(emailError);
                return;
              }
              if (!password) {
                setError('Введите пароль для подтверждения');
                return;
              }

              try {
                setError(null);
                setIsSubmitting(true);
                await onSubmit({ email, password });
                setIsSuccess(true);
              } catch (submitError) {
                setError(
                  submitError instanceof Error
                    ? submitError.message
                    : 'Не удалось изменить логин',
                );
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            <h2 className={styles.title}>Новый логин</h2>
            <input
              className={`${styles.input} ${error ? styles.inputError : ''}`}
              type="email"
              name="email"
              placeholder="Логин"
              defaultValue={currentEmail}
              autoComplete="username"
            />
            <input
              className={`${styles.input} ${error ? styles.inputError : ''}`}
              type="password"
              name="password"
              placeholder="Пароль для подтверждения"
              autoComplete="current-password"
            />
            {error ? <p className={styles.errorMessage}>{error}</p> : null}
            <button
              className={styles.primaryButton}
              type="submit"
              disabled={isSubmitting}
            >
              Сохранить
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ChangeEmailModal({
  isOpen,
  currentEmail,
  onClose,
  onSubmit,
}: ChangeEmailModalProps) {
  if (!isOpen) return null;
  return (
    <ChangeEmailModalContent
      currentEmail={currentEmail}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
}
