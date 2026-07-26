'use client';

import Image from 'next/image';
import { useEffect } from 'react';
import styles from './RegisterModal.module.css';

type RegisterModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick?: () => void;
  showError?: boolean;
  errorMessage?: string;
  isSubmitting?: boolean;
  onSubmit?: (data: {
    email: string;
    password: string;
    passwordRepeat: string;
  }) => void;
};

export default function RegisterModal({
  isOpen,
  onClose,
  onLoginClick,
  showError = false,
  errorMessage,
  isSubmitting = false,
  onSubmit,
}: RegisterModalProps) {
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
  const emailInputClassName =
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
            const email = String(formData.get('email') || '').trim();
            const password = String(formData.get('password') || '');
            const passwordRepeat = String(
              formData.get('passwordRepeat') || '',
            );
            onSubmit?.({ email, password, passwordRepeat });
          }}
        >
          <input
            className={emailInputClassName}
            type="email"
            name="email"
            placeholder="Эл. почта"
            autoComplete="email"
          />
          <input
            className={styles.input}
            type="password"
            name="password"
            placeholder="Пароль"
            autoComplete="new-password"
          />
          <input
            className={styles.input}
            type="password"
            name="passwordRepeat"
            placeholder="Повторите пароль"
            autoComplete="new-password"
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
                      Данная почта уже используется.
                      <br />
                      Попробуйте войти.
                    </>
                  )}
            </p>
          )}
          <button
            className={primaryButtonClassName}
            type="submit"
            disabled={isSubmitting}
          >
            Зарегистрироваться
          </button>
          <button
            className={styles.secondaryButton}
            type="button"
            onClick={onLoginClick}
          >
            Войти
          </button>
        </form>
      </div>
    </div>
  );
}
