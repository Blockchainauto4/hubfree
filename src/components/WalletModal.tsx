import React, { useState } from 'react';
import { X, Wallet, ArrowDownRight, ShieldCheck, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { VideoSubmission } from '../types';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  bonusAccumulated: number;
  submissions: VideoSubmission[];
  onWithdraw: (amount: number, pixKey: string) => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  balance,
  bonusAccumulated,
  submissions,
  onWithdraw,
}) => {
  if (!isOpen) return null;

  const [withdrawKey, setWithdrawKey] = useState('');
  const [withdrawKeyType, setWithdrawKeyType] = useState('cpf');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const handleWithdrawClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (balance <= 0) {
      alert('Você ainda não possui saldo disponível para saque.');
      return;
    }
    if (!withdrawKey.trim()) {
      alert('Insira uma chave PIX válida.');
      return;
    }

    setIsWithdrawing(true);
    setTimeout(() => {
      const amountWithdrawn = balance;
      onWithdraw(amountWithdrawn, withdrawKey.trim());
      setIsWithdrawing(false);
      setWithdrawSuccess(true);

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#00e575', '#ffffff', '#00c860', '#6ee7b7'],
      });
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl my-auto sm:my-8 bg-slate-900 border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[92dvh] sm:max-h-[88vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-white/10 flex items-center justify-between bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#00e575] shrink-0" />
            <h3 className="text-base sm:text-lg font-bold text-white font-display">
              Minha Carteira & Pagamentos PIX
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

        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6 flex-1">
          {/* Balance Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="p-4 sm:p-5 rounded-xl bg-slate-950 border border-white/10 space-y-1">
              <span className="text-xs font-semibold text-slate-400">
                Saldo Disponível para Saque
              </span>
              <div className="text-2xl sm:text-3xl font-black text-[#00e575] font-mono">
                R$ {balance.toFixed(2)}
              </div>
              <p className="text-[11px] text-slate-400">
                Liberado para transferência instantânea via PIX
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-slate-950 border border-[#00e575]/25 space-y-1">
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>Bônus em Vídeo Acumulados</span>
              </span>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                R$ {bonusAccumulated.toFixed(2)}
              </div>
              <p className="text-[11px] text-slate-400">
                Ganhos extras conquistados por qualidade e agilidade
              </p>
            </div>
          </div>

          {/* Withdraw Form or Success */}
          {withdrawSuccess ? (
            <div className="p-5 rounded-xl bg-emerald-950/40 border border-[#00e575]/30 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#00e575]/20 text-[#00e575] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-white">
                Ordem de Saque PIX Enviada com Sucesso!
              </h4>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                A transferência está sendo processada para a chave informada ({withdrawKey}). O comprovante será enviado no seu e-mail cadastrado.
              </p>
              <button
                type="button"
                onClick={() => setWithdrawSuccess(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/10 rounded-lg cursor-pointer"
              >
                Voltar
              </button>
            </div>
          ) : (
            <form onSubmit={handleWithdrawClick} className="p-5 rounded-xl bg-slate-950/70 border border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ArrowDownRight className="w-4 h-4 text-[#00e575]" />
                  Solicitar Saque PIX Imediato
                </h4>
                <span className="text-[11px] text-slate-400">Sem taxa de saque</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Tipo de Chave</label>
                  <select
                    value={withdrawKeyType}
                    onChange={(e) => setWithdrawKeyType(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-base sm:text-xs text-white focus:outline-none focus:border-[#00e575]"
                  >
                    <option value="cpf">CPF</option>
                    <option value="email">E-mail</option>
                    <option value="telefone">Celular</option>
                    <option value="aleatoria">Chave Aleatória</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] text-slate-400 block mb-1">Chave PIX de Destino</label>
                  <input
                    type="text"
                    required
                    value={withdrawKey}
                    onChange={(e) => setWithdrawKey(e.target.value)}
                    placeholder="Digite sua chave PIX..."
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-base sm:text-xs text-white focus:outline-none focus:border-[#00e575]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={balance <= 0 || isWithdrawing}
                className="w-full py-2.5 text-xs font-bold text-slate-950 bg-[#00e575] hover:bg-[#00ff87] disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-all shadow-md shadow-[#00e575]/20 cursor-pointer"
              >
                {isWithdrawing ? 'Processando PIX...' : `Transferir R$ ${balance.toFixed(2)} via PIX`}
              </button>
            </form>
          )}

          {/* History of submissions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Histórico Recente de Gravações Aprovadas
            </h4>

            {submissions.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500 border border-white/5 rounded-xl">
                Você ainda não gravou nenhuma tarefa hoje. Escolha uma vaga no feed para faturar!
              </div>
            ) : (
              <div className="space-y-2">
                {submissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-3.5 rounded-xl bg-slate-950/80 border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-semibold text-white">{sub.taskTitle}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>{sub.submittedAt}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#00e575] font-medium">1080p 60fps</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-300">Base: R$ {sub.baseEarned} + Bônus: R$ {sub.bonusEarned}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-bold text-[#00e575]">
                        + R$ {sub.totalEarned.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-emerald-400 font-semibold">
                        Aprovado & Pago
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
