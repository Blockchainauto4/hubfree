import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface FooterProps {
  onOpenHowItWorks: () => void;
  onOpenCreateTask: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenHowItWorks, onOpenCreateTask }) => {
  return (
    <footer className="border-t border-white/10 bg-slate-950 py-8 sm:py-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-10">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#00e575] flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-slate-950 fill-current">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-lg font-extrabold text-white font-display">
                Freela<span className="text-[#00e575]">Hub</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Plataforma brasileira de postagens freelancer diárias para gravação de tarefas em primeira pessoa (POV) com bônus em vídeo e saques via PIX.
            </p>
          </div>

          {/* Links Freelancers */}
          <div className="space-y-2">
            <div className="font-bold text-white uppercase tracking-wider text-[11px]">
              Para Freelancers
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#vagas" className="hover:text-[#00e575] transition-colors">
                  Vagas Diárias Abertas
                </a>
              </li>
              <li>
                <a href="#bonus-video" className="hover:text-[#00e575] transition-colors">
                  Regras do Bônus em Vídeo
                </a>
              </li>
              <li>
                <a href="#starter-kit" className="hover:text-[#00e575] transition-colors">
                  Starter Kit Head-Mount
                </a>
              </li>
              <li>
                <a href="#calculadora" className="hover:text-[#00e575] transition-colors">
                  Simulador de Ganhos
                </a>
              </li>
            </ul>
          </div>

          {/* Links Empresas */}
          <div className="space-y-2">
            <div className="font-bold text-white uppercase tracking-wider text-[11px]">
              Para Empresas & IA
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={onOpenCreateTask}
                  className="hover:text-[#00e575] transition-colors cursor-pointer text-left"
                >
                  Publicar Tarefa Diária
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenHowItWorks}
                  className="hover:text-[#00e575] transition-colors cursor-pointer text-left"
                >
                  Como Funciona a Auditoria
                </button>
              </li>
              <li>
                <a href="#faq" className="hover:text-[#00e575] transition-colors">
                  Qualidade de Dados & Resolução
                </a>
              </li>
            </ul>
          </div>

          {/* Pagamentos & Segurança */}
          <div className="space-y-2">
            <div className="font-bold text-white uppercase tracking-wider text-[11px]">
              Pagamentos Seguros
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Processamento instantâneo via Banco Central (PIX) diretamente na sua chave cadastrada.
            </p>
            <div className="flex items-center gap-1.5 text-emerald-400 pt-1">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span className="font-semibold text-[11px]">Auditoria Humana & Confiável</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 text-center sm:text-left">
          <div>
            © {new Date().getFullYear()} FreelaHub. Todos os direitos reservados.
          </div>
          <div className="flex items-center gap-3">
            <span>Privacidade</span>
            <span aria-hidden="true">·</span>
            <span>Termos de Uso</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400">Deploy Vercel Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
