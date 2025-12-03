"use client";

import { useState } from "react";
import { Menu, X, Scissors, User, LogOut, Calendar, HelpCircle } from "lucide-react";
import Link from "next/link";
import { useAuthContext } from "@/app/contexts/AuthContext";

function AuthButtons() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isLoading, logout } = useAuthContext();

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  if (isLoading) {
    return (
      <div className="h-8 w-24 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
    );
  }

  if (user) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white transition-colors bg-zinc-100 dark:bg-zinc-800 rounded-full"
        >
          <User className="h-4 w-4" />
          <span>{user.name.split(" ")[0]}</span>
        </button>

        {isUserMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-800 py-1">
            <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-800">
              <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                {user.name}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                {user.email}
              </p>
            </div>
            <Link
              href="/citas"
              onClick={() => setIsUserMenuOpen(false)}
              className="w-full px-4 py-2 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Mis Citas
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <Link
        href="/login"
        className="px-4 py-2 text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white transition-colors"
      >
        Iniciar Sesión
      </Link>
      <Link
        href="/registro"
        className="px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-full hover:bg-amber-600 transition-colors"
      >
        Registrarse
      </Link>
    </>
  );
}

interface MobileAuthSectionProps {
  readonly onClose: () => void;
}

function MobileAuthSection({ onClose }: MobileAuthSectionProps) {
  const { user, logout } = useAuthContext();

  const handleLogout = () => {
    logout();
    onClose();
  };

  if (user) {
    return (
      <>
        <div className="px-4 py-2">
          <p className="text-sm font-medium text-zinc-900 dark:text-white">
            {user.name}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {user.email}
          </p>
        </div>
        <Link
          href="/citas"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-left text-zinc-700 dark:text-zinc-300 flex items-center gap-2"
        >
          <Calendar className="h-4 w-4" />
          Mis Citas
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="px-4 py-2 text-sm font-medium text-left text-red-600 flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </>
    );
  }

  return (
    <>
      <Link
        href="/login"
        className="px-4 py-2 text-sm font-medium text-center text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white transition-colors"
      >
        Iniciar Sesión
      </Link>
      <Link
        href="/registro"
        className="px-4 py-2 text-sm font-medium text-center text-white bg-amber-500 rounded-full hover:bg-amber-600 transition-colors"
      >
        Registrarse
      </Link>
    </>
  );
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: "/#servicios", label: "Servicios" },
    { href: "/#nosotros", label: "Nosotros" },
    { href: "/#barberos", label: "Barberos" },
    { href: "/#testimonios", label: "Testimonios" },
    { href: "/#contacto", label: "Contacto" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200 dark:bg-zinc-950/80 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Scissors className="h-8 w-8 text-amber-500" />
            <span className="text-xl font-bold text-zinc-900 dark:text-white">
              Edge Timer
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center gap-3">
            <AuthButtons />
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden p-2 text-zinc-600 dark:text-zinc-400"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <MobileAuthSection onClose={() => setIsMenuOpen(false)} />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
