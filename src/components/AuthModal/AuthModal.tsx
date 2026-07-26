'use client';

import Image from 'next/image';
import { useEffect } from 'react';
import styles from './AuthModal.module.css';

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onRegisterClick?: () => void;
  showError?: boolean;
  errorMessage?: string;
  isSubmitting?: boolean;
  onSubmit?: (data: { email: string; password: string }) => void;
};

export default function AuthModal({
  isOpen,
  onClose,
  onRegisterClick,
  showError = false,
  errorMessage,
  isSubmitting = false,
  onSubmit,
}: AuthModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    document.body.classList.add('noScroll');

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.classList.remove('noScroll');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalClassName = `${styles.modal} ${showError ? styles.modalError : ''}`.trim();
  const passwordInputClassName =
    `${styles.input} ${showError ? styles.inputError : ''}`.trim();
  const primaryButtonClassName =
    `${styles.primaryButton} ${showError ? '' : styles.primaryButtonSpacing}`.trim();

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={modalClassName}
        onClick={(event) => event.stopPropagation()}
      >
        <Image
          src="/logo.svg"
          alt="SkyFitnessPro"
          width={220}
          height={35}
          className={styles.logo}
          priority
        />
        <form
          className={styles.form}
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const email = String(formData.get('login') || '').trim();
            const password = String(formData.get('password') || '');
            onSubmit?.({ email, password });
          }}
        >
          <input
            className={styles.input}
            type="text"
            name="login"
            placeholder="Логин"
            autoComplete="username"
          />
          <input
            className={passwordInputClassName}
            type="password"
            name="password"
            placeholder="Пароль"
            autoComplete="current-password"
          />
          {showError && (
            <p className={styles.errorMessage}>
              {errorMessage
                ? errorMessage.split('\n').map((line, index, arr) => (
                    <span key={`${line}-${index}`}>
                      {line}
                      {index < arr.length - 1 && <br />}
                    </span>
                  ))
                : (
                    <>
                      Пароль введен неверно,
                      <br />
                      попробуйте еще раз.
                    </>
                  )}
            </p>
          )}
          <button
            className={primaryButtonClassName}
            type="submit"
            disabled={isSubmitting}
          >
            Войти
          </button>
          <button
            className={styles.secondaryButton}
            type="button"
            onClick={onRegisterClick}
          >
            Зарегистрироваться
          </button>
        </form>
      </div>
    </div>
  );
}
