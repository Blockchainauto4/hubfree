import React, { useState } from 'react';
import { X, UserCheck, ShieldCheck, CheckCircle2, Sparkles, Building2, Smartphone } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'register' | 'login';
  onUserLoggedIn?: (user: { name: string; email: string; role: 'freelancer' | 'empresa'; pixKey?: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'register',
  onUserLoggedIn,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'register' | 'login'>(initialMode);
  const [role, setRole] = useState<'freelancer' | 'empresa'>('freelancer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [specialty, setSpecialty] = useState('Mecânica & Elétrica');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || (mode === 'register' && !name.trim())) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const userData = {
      name: name.trim() || 'Usuário FreelaHub',
      email: email.trim(),
      role,
      pixKey: pixKey.trim(),
    };

    localStorage.setItem('freelahub_user', JSON.stringify(userData));
    if (onUserLoggedIn) {
      onUserLoggedIn(userData);
    }

    setIsSuccess(true);
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#00e575', '#ffffff', '#00c860'],
    });

    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md my-auto sm:my-8 bg-slate-900 border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[92dvh] sm:max-h-[88vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-white/10 flex items-center justify-between bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#00e575] flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-slate-950 fill-current">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white font-display">
              {mode === 'register' ? 'Criar Conta FreelaHub' : 'Entrar na FreelaHub'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {isSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-[#00e575]/20 text-[#00e575] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-white font-display">
                {mode === 'register' ? 'Cadastro Realizado com Sucesso!' : 'Login Efetuado!'}
              </h4>
              <p className="text-xs text-slate-300">
                Seja bem-vindo(a) à FreelaHub. Você já pode gravar tarefas e garantir seus bônus diários.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role selector if register */}
              {mode === 'register' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Eu quero:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('freelancer')}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        role === 'freelancer'
                          ? 'bg-[#00e575] text-slate-950 border-[#00e575]'
                          : 'bg-slate-950 text-slate-400 border-white/10'
                      }`}
                    >
                      Gravar Tarefas (Freelancer)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('empresa')}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        role === 'empresa'
                          ? 'bg-[#00e575] text-slate-950 border-[#00e575]'
                          : 'bg-slate-950 text-slate-400 border-white/10'
                      }`}
                    >
                      Contratar Vídeos (Empresa)
                    </button>
                  </div>
                </div>
              )}

              {mode === 'register' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Carlos Ferreira"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-base sm:text-xs text-white focus:outline-none focus:border-[#00e575]"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">E-mail</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-base sm:text-xs text-white focus:outline-none focus:border-[#00e575]"
                />
              </div>

              {mode === 'register' && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">WhatsApp para Notificação de Tarefas</label>
                    <input
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="(11) 98765-4321"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-base sm:text-xs text-white focus:outline-none focus:border-[#00e575]"
                    />
                  </div>

                  {role === 'freelancer' && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Chave PIX (Para Recebimentos)</label>
                      <input
                        type="text"
                        value={pixKey}
                        onChange={(e) => setPixKey(e.target.value)}
                        placeholder="CPF, e-mail ou celular"
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-base sm:text-xs text-white focus:outline-none focus:border-[#00e575]"
                      />
                    </div>
                  )}
                </>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-[#00e575] hover:bg-[#00ff87] text-slate-950 font-bold text-xs transition-all shadow-md shadow-[#00e575]/25 cursor-pointer mt-2"
              >
                {mode === 'register' ? 'Criar Conta & Começar' : 'Acessar Conta'}
              </button>

              <div className="text-center text-xs text-slate-400 pt-2">
                {mode === 'register' ? (
                  <span>
                    Já possui conta?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-[#00e575] font-semibold hover:underline cursor-pointer"
                    >
                      Entrar
                    </button>
                  </span>
                ) : (
                  <span>
                    Não tem conta ainda?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('register')}
                      className="text-[#00e575] font-semibold hover:underline cursor-pointer"
                    >
                      Cadastre-se grátis
                    </button>
                  </span>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
