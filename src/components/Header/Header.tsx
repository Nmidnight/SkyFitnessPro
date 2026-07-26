'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import AuthModal from '@/components/AuthModal/AuthModal';
import RegisterModal from '@/components/RegisterModal/RegisterModal';
import { useAuth } from '@/context/AuthContext';
import {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
} from '@/utils/authValidation';
import styles from './Header.module.css';

export default function Header() {
  const { user, isAuthenticated, login, register, logout } = useAuth();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [isRegisterSubmitting, setIsRegisterSubmitting] = useState(false);

  const userName = user?.email ? user.email.split('@')[0] || '' : '';

  const openAuth = useCallback(() => {
    setIsRegisterOpen(false);
    setRegisterError(null);
    setAuthError(null);
    setIsAuthOpen(true);
  }, []);

  const openRegister = useCallback(() => {
    setIsAuthOpen(false);
    setAuthError(null);
    setRegisterError(null);
    setIsRegisterOpen(true);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  useEffect(() => {
    const handleOpenAuth = () => openAuth();
    window.addEventListener('open-auth', handleOpenAuth);

    const params = new URLSearchParams(window.location.search);
    if (params.get('auth') === '1') {
      const timer = window.setTimeout(() => {
        openAuth();
        router.replace('/');
      }, 0);
      return () => {
        window.clearTimeout(timer);
        window.removeEventListener('open-auth', handleOpenAuth);
      };
    }

    return () => window.removeEventListener('open-auth', handleOpenAuth);
  }, [openAuth, router]);

  const handleLogin = useCallback(
    async (data: { email: string; password: string }) => {
      try {
        setAuthError(null);
        setIsAuthSubmitting(true);
        await login(data);
        setIsAuthOpen(false);
      } catch {
        setAuthError('Пароль введен неверно,\nпопробуйте еще раз.');
      } finally {
        setIsAuthSubmitting(false);
      }
    },
    [login],
  );

  const handleRegister = useCallback(
    async (data: {
      email: string;
      password: string;
      passwordRepeat: string;
    }) => {
      const emailError = validateEmail(data.email);
      if (emailError) {
        setRegisterError(emailError);
        return;
      }
      const passwordError = validatePassword(data.password);
      if (passwordError) {
        setRegisterError(passwordError);
        return;
      }
      const matchError = validatePasswordMatch(
        data.password,
        data.passwordRepeat,
      );
      if (matchError) {
        setRegisterError(matchError);
        return;
      }

      try {
        setRegisterError(null);
        setIsRegisterSubmitting(true);
        await register({ email: data.email, password: data.password });
        setIsRegisterOpen(false);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Данная почта уже используется.\nПопробуйте войти.';
        setRegisterError(message);
      } finally {
        setIsRegisterSubmitting(false);
      }
    },
    [register],
  );

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.logoSection}>
            <Link href="/" className={styles.logoLink}>
              <Image
                src="/logo.svg"
                alt="SkyFitnessPro"
                width={220}
                height={35}
                className={styles.logo}
                priority
              />
            </Link>
            <p className={styles.tagline}>
              Онлайн-тренировки для занятий дома
            </p>
          </div>

          {!isAuthenticated ? (
            <button
              className={styles.loginButton}
              type="button"
              onClick={openAuth}
            >
              Войти
            </button>
          ) : (
            <div className={styles.userMenuWrapper} ref={menuRef}>
              <button
                className={styles.userButton}
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                aria-expanded={isMenuOpen}
                aria-haspopup="menu"
              >
                <Image
                  src="/icons/profile.svg"
                  alt=""
                  width={24}
                  height={24}
                  className={styles.userIcon}
                />
                <span className={styles.userName}>
                  {userName || 'Пользователь'}
                </span>
                <Image
                  src="/icons/down.svg"
                  alt=""
                  width={12}
                  height={8}
                  className={styles.userArrow}
                />
              </button>

              {isMenuOpen && (
                <div className={styles.userMenu} role="menu">
                  <p className={styles.userMenuName}>
                    {userName || 'Пользователь'}
                  </p>
                  {user?.email ? (
                    <p className={styles.userMenuEmail}>{user.email}</p>
                  ) : null}
                  <button
                    className={styles.userMenuPrimary}
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      router.push('/profile');
                    }}
                  >
                    Профиль
                  </button>
                  <button
                    className={styles.userMenuSecondary}
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      logout();
                    }}
                  >
                    Выйти
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onRegisterClick={openRegister}
        showError={!!authError}
        errorMessage={authError ?? undefined}
        isSubmitting={isAuthSubmitting}
        onSubmit={handleLogin}
      />
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onLoginClick={openAuth}
        showError={!!registerError}
        errorMessage={registerError ?? undefined}
        isSubmitting={isRegisterSubmitting}
        onSubmit={handleRegister}
      />
    </>
  );
}
