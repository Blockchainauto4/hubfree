import React from 'react';
import { ShieldCheck, Video, HelpCircle, Check, Smartphone, Sparkles, Award } from 'lucide-react';

export const StarterKitSection: React.FC = () => {
  const kitItems = [
    {
      title: 'Suporte de Celular de Cabeça (Head-Mount)',
      tag: 'Recomendado Oficial',
      description: 'Elástico confortável ajustável com suporte giratório 90° e trava de rosca de 1/4". Mantém as duas mãos 100% livres e a linha de visão idêntica aos seus olhos.',
      badge: 'Garante o Bônus de Ângulo POV',
    },
    {
      title: 'Suporte Magnético de Peito (Chest Mount)',
      tag: 'Alternativa Robusta',
      description: 'Ideal para trabalhos que exigem capacete de proteção ou para quem prefere apoio peitoral estável durante soldagem, mecânica e marcenaria pesada.',
      badge: 'Excelente Estabilidade',
    },
    {
      title: 'Mini Microfone de Lapela Anti-Ruído',
      tag: 'Qualidade de Áudio',
      description: 'Capta com clareza o som do ferramental, encaixe das peças e instruções sem que o eco da oficina atrapalhe a aprovação do vídeo.',
      badge: 'Áudio Cristalino',
    },
    {
      title: 'Guia de Enquadramento & Resolução 1080p',
      tag: 'Tutorial Gratuito',
      description: 'Passo a passo em PDF e vídeo demonstrativo: como travar o foco do smartphone, configurar 60 quadros por segundo e receber PIX diário sem revisões.',
      badge: '100% de Aprovação',
    },
  ];

  return (
    <section id="starter-kit" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10">
        <div>
          <span className="text-xs font-bold text-[#00e575] uppercase tracking-wider flex items-center gap-1.5 pb-1">
            <Award className="w-3.5 h-3.5" />
            Equipamento & Boas Práticas
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
            Starter Kit & Dicas de Gravação POV
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 pt-1 max-w-2xl">
            Você só precisa do seu smartphone e um suporte simples de cabeça para começar. Veja como gravar do jeito certo para liberar todos os bônus em vídeo disponíveis.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-300 bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl">
          <Smartphone className="w-4 h-4 text-[#00e575]" />
          <span>Compatível com Android & iPhone</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 pt-8">
        {kitItems.map((item, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-[#00e575]/40 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-400">{item.tag}</span>
                <span className="text-[#00e575] font-bold bg-[#00e575]/10 px-2 py-0.5 rounded text-[10px]">
                  {item.badge}
                </span>
              </div>
              <h3 className="text-base font-bold text-white font-display leading-snug">
                {item.title}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#00e575]" />
              <span>Aprovado pelos auditores FreelasHub</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bonus Guidelines card */}
      <div id="bonus-video" className="mt-10 p-6 sm:p-8 rounded-2xl bg-slate-900/80 border border-[#00e575]/30 flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-left">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#00e575] uppercase">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>Como Funciona o Bônus em Vídeo?</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white font-display">
            Entregou no prazo em Full HD? O bônus cai no mesmo PIX.
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Cada postagem no feed diário tem um valor base (ex: R$ 50/h) mais um <strong>Bônus em Vídeo (até +R$ 35)</strong>. 
            Ele é liberado automaticamente quando você entrega o arquivo com gravação contínua em 1080p a 60fps dentro da janela do mesmo dia.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <div className="text-right">
            <div className="text-[11px] text-slate-400">Exemplo prático:</div>
            <div className="text-xs font-mono text-white">R$ 50 base + R$ 30 bônus</div>
            <div className="text-lg font-mono font-bold text-[#00e575]">Total: R$ 80,00 via PIX</div>
          </div>
        </div>
      </div>
    </section>
  );
};
