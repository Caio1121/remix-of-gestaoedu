import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Mock do hook useAuth
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('ProtectedRoute', () => {
  it('deve redirecionar para home se o usuário não estiver logado', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      profile: null,
      loading: false,
      mfaLevel: null,
      signOut: async () => {},
    });

    render(
      <MemoryRouter initialEntries={['/admin']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<div>Home</div>} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="gestor">
                <div>Admin Page</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Home')).toBeDefined();
    expect(screen.queryByText('Admin Page')).toBeNull();
  });

  it('deve redirecionar se o role for incorreto', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: '123' } as any,
      profile: { id: '123', role: 'aluno', fullname: 'Lucas', studentcardid: null, cpf: null },
      loading: false,
      mfaLevel: 'aal1',
      signOut: async () => {},
    });

    render(
      <MemoryRouter initialEntries={['/admin']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<div>Home</div>} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="gestor">
                <div>Admin Page</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Home')).toBeDefined();
  });

  it('deve redirecionar gestor sem MFA para mfa-challenge', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: '123' } as any,
      profile: { id: '123', role: 'gestor', fullname: 'Carlos', studentcardid: null, cpf: null },
      loading: false,
      mfaLevel: 'aal1',
      signOut: async () => {},
    });

    render(
      <MemoryRouter initialEntries={['/admin']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/mfa-challenge" element={<div>MFA Challenge</div>} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="gestor">
                <div>Admin Page</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('MFA Challenge')).toBeDefined();
  });

  it('deve permitir acesso se role e MFA estiverem corretos', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: '123' } as any,
      profile: { id: '123', role: 'gestor', fullname: 'Carlos', studentcardid: null, cpf: null },
      loading: false,
      mfaLevel: 'aal2',
      signOut: async () => {},
    });

    render(
      <MemoryRouter initialEntries={['/admin']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="gestor">
                <div>Admin Page</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Admin Page')).toBeDefined();
  });
});
