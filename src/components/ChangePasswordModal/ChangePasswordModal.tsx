'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import {
  validatePassword,
  validatePasswordMatch,
} from '@/utils/authValidation';
import styles from './ChangePasswordModal.module.css';

type ChangePasswordModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    oldPassword: string;
    password: string;
  }) => Promise<void>;
};

function ChangePasswordModalContent({
  onClose,
  onSubmit,
}: Omit<ChangePasswordModalProps, 'isOpen'>) {
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
            <h2 className={styles.title}>Пароль успешно изменён</h2>
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
              const oldPassword = String(formData.get('oldPassword') || '');
              const password = String(formData.get('password') || '');
              const passwordRepeat = String(
                formData.get('passwordRepeat') || '',
              );

              if (!oldPassword) {
                setError('Введите старый пароль');
                return;
              }
              const passwordError = validatePassword(password);
              if (passwordError) {
                setError(passwordError);
                return;
              }
              const matchError = validatePasswordMatch(
                password,
                passwordRepeat,
              );
              if (matchError) {
                setError(matchError);
                return;
              }

              try {
                setError(null);
                setIsSubmitting(true);
                await onSubmit({ oldPassword, password });
                setIsSuccess(true);
              } catch (submitError) {
                setError(
                  submitError instanceof Error
                    ? submitError.message
                    : 'Не удалось изменить пароль',
                );
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            <h2 className={styles.title}>Новый пароль</h2>
            <input
              className={`${styles.input} ${error ? styles.inputError : ''}`}
              type="password"
              name="oldPassword"
              placeholder="Старый пароль"
              autoComplete="current-password"
            />
            <input
              className={`${styles.input} ${error ? styles.inputError : ''}`}
              type="password"
              name="password"
              placeholder="Новый пароль"
              autoComplete="new-password"
            />
            <input
              className={`${styles.input} ${error ? styles.inputError : ''}`}
              type="password"
              name="passwordRepeat"
              placeholder="Повторите пароль"
              autoComplete="new-password"
            />
            {error ? <p className={styles.errorMessage}>{error}</p> : null}
            <button
              className={styles.primaryButton}
              type="submit"
              disabled={isSubmitting}
            >
              Подтвердить
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ChangePasswordModal({
  isOpen,
  onClose,
  onSubmit,
}: ChangePasswordModalProps) {
  if (!isOpen) return null;
  return <ChangePasswordModalContent onClose={onClose} onSubmit={onSubmit} />;
}
