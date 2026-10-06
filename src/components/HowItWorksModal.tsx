import React from 'react';
import { X, Smartphone, Video, Send, CheckCircle2, Zap, ArrowRight, ShieldCheck } from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExploreTasks: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({
  isOpen,
  onClose,
  onExploreTasks,
}) => {
  if (!isOpen) return null;

  const steps = [
    {
      num: '01',
      title: 'Escolha uma tarefa no feed diário',
      desc: 'Navegue pelas postagens do dia. Você pode escolher tarefas no trabalho (oficina, obra, solda, elétrica) ou em casa (culinária, digitação de código, montagens).',
      badge: 'Vagas atualizadas às 07h',
    },
    {
      num: '02',
      title: 'Fixe o celular no suporte de cabeça',
      desc: 'Use um suporte elástico simples para a testa ou clipe de peito. Suas mãos devem ficar livres para você trabalhar normalmente sem alterar seu ritmo de trabalho.',
      badge: 'Gravação em 1ª Pessoa (POV)',
    },
    {
      num: '03',
      title: 'Execute seu serviço normalmente',
      desc: 'Inicie a gravação em 1080p a 60fps. Não precisa falar ou narrar (a menos que a tarefa peça). O foco é mostrar a precisão das suas mãos e ferramentas.',
      badge: 'Trabalho Real de Verdade',
    },
    {
      num: '04',
      title: 'Receba o valor base + bônus via PIX',
      desc: 'Faça o upload do vídeo gravado. Nossa auditoria aprova e valida os critérios do bônus em vídeo no mesmo dia. O dinheiro cai direto na sua conta bancária via PIX.',
      badge: 'PIX Imediato sem taxas',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-slate-900 border border-white/15 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-950/70">
          <div>
            <span className="text-xs font-bold text-[#00e575] uppercase tracking-wider">
              Guia Completo
            </span>
            <h3 className="text-xl font-bold text-white font-display">
              Como funciona o Filmou Ganhou da FreelasHub?
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

        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {steps.map((step) => (
              <div
                key={step.num}
                className="p-5 rounded-xl bg-slate-950/70 border border-white/5 space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-[#00e575] font-mono">
                    {step.num}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                    {step.badge}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white font-display">
                  {step.title}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 to-slate-950 border border-[#00e575]/30 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#00e575] flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-current" />
                Dica para faturar mais:
              </span>
              <p className="text-xs text-slate-300">
                Mantenha a lente limpa e envie no mesmo dia da postagem para garantir o <strong>Bônus em Vídeo integral</strong> em cada clipe enviado!
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
            >
              Fechar
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onExploreTasks();
              }}
              className="px-6 py-2.5 text-xs font-bold text-slate-950 bg-[#00e575] hover:bg-[#00ff87] rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Ver Vagas Abertas Agora</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
