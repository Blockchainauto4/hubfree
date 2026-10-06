import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'O que é a FreelasHub e o programa "Filmou Ganhou"?',
      a: 'A FreelasHub é uma plataforma de microtarefas profissionais diárias. Empresas e centros de pesquisa em IA e robótica precisam de gravações reais em primeira pessoa (POV) de tarefas especializadas (elétrica, mecânica, culinária, código, marcenaria) para alimentar algoritmos. Você grava sua rotina com o celular e recebe pagamento por hora mais bônus em vídeo direto via PIX.',
    },
    {
      q: 'Como funciona o Bônus em Vídeo Disponível?',
      a: 'Cada tarefa possui um valor base fixo (por exemplo, R$ 50/h) e um Bônus em Vídeo (de R$ 15 a R$ 35). Para liberar o bônus, basta entregar o arquivo na mesma data com resolução de 1080p a 60fps, boa iluminação e visão clara das suas mãos trabalhando.',
    },
    {
      q: 'Preciso de equipamento profissional caro para gravar?',
      a: 'Não! Qualquer smartphone atual com câmera Full HD (1080p) serve. Você só precisa de um suporte elástico de cabeça ou suporte peitoral (head-mount / chest-mount) para que suas mãos fiquem livres durante a atividade.',
    },
    {
      q: 'Como e quando recebo o dinheiro?',
      a: 'Os pagamentos são efetuados via PIX instantâneo na chave cadastrada (CPF, e-mail, celular ou chave aleatória). A auditoria dos clipes ocorre em até 24 horas e você pode solicitar o saque direto na sua carteira.',
    },
    {
      q: 'Minha empresa ou oficina permite gravar?',
      a: 'Sim, desde que a gravação não exponha marcas de clientes protegidas por sigilo ou dados confidenciais de terceiros. A tarefa foca exclusivamente nos gestos técnicos das mãos e no manuseio de ferramentas.',
    },
    {
      q: 'Sou uma empresa e preciso de vídeos para treinar IA. Como publico?',
      a: 'Basta clicar no botão "Publicar Vaga" no topo da página. Você define a quantidade de gravações diárias que precisa, o valor base e a taxa de bônus em vídeo para os freelancers.',
    },
  ];

  return (
    <section id="faq" className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center space-y-3 mb-10">
        <span className="text-xs font-bold text-[#00e575] uppercase tracking-wider flex items-center justify-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5" />
          Perguntas Frequentes
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
          Dúvidas sobre o Filmou Ganhou
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Tudo o que você precisa saber para começar a faturar com seu smartphone hoje.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="rounded-xl border border-white/10 bg-slate-900/60 overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-white/5 transition-colors"
              >
                <span className="text-sm font-bold text-white font-display">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-[#00e575] shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/5">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
