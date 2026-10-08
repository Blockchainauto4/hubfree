/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { ArrowLeft, ShieldCheck, Lock, FileText } from 'lucide-react';
import { applySeoMetadata } from '../services/seoService';

interface LegalPageProps {
  type: 'privacidade' | 'termos';
  onBack: () => void;
}

export const LegalPage: React.FC<LegalPageProps> = ({ type, onBack }) => {
  const isPrivacy = type === 'privacidade';
  const title = isPrivacy ? 'Política de Privacidade & LGPD' : 'Termos de Uso da Plataforma';
  const canonicalUrl = typeof window !== 'undefined' ? `${window.location.origin}/${type}` : `https://freelahub.com.br/${type}`;

  useEffect(() => {
    applySeoMetadata({
      title: `${title} | FreelaHub`,
      description: isPrivacy
        ? 'Conheça como a FreelaHub trata os dados pessoais dos usuários em conformidade com a LGPD (Lei Geral de Proteção de Dados).'
        : 'Termos e condições de uso da plataforma FreelaHub para freelancers e contratantes.',
      canonicalUrl,
    });
  }, [type, isPrivacy, title, canonicalUrl]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-20">
      <nav className="bg-white border-b border-slate-200/80 px-4 py-3 sticky top-0 z-30 shadow-xs">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-[#00a859] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao FreelaHub</span>
          </button>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 pt-8 space-y-6">
        <header className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#00a859] flex items-center justify-center">
            {isPrivacy ? <Lock className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
          <p className="text-xs text-slate-500">Última atualização: Outubro de 2026 · Versão 1.2</p>
        </header>

        <article className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 text-sm text-slate-700 leading-relaxed">
          {isPrivacy ? (
            <>
              <section className="space-y-2">
                <h2 className="text-base font-bold text-slate-900">1. Compromisso com a Privacidade e LGPD</h2>
                <p>
                  O FreelaHub respeita a privacidade de freelancers e empresas. Coletamos apenas as informações estritamente
                  necessárias para a operação da plataforma, contato de suporte e processamento de pagamentos via PIX.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-slate-900">2. Dados Coletados</h2>
                <p>
                  - Dados de Cadastro: Nome, e-mail e chave PIX cadastrada para recebimento.<br />
                  - Geolocalização: Solicitada exclusivamente quando você clica em "Buscar perto de mim" para calcular distâncias. Não armazenamos histórico contínuo de rastreamento.<br />
                  - Contatos de Contratantes: Disponibilizados diretamente para que freelancers possam negociar tarefas sem intermediações abusivas.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-slate-900">3. Direitos do Titular</h2>
                <p>
                  Em conformidade com o Art. 18 da LGPD, você pode a qualquer momento solicitar a visualização,
                  correção ou exclusão definitiva de seus dados pelo nosso canal de suporte no WhatsApp +55 (11) 99127-1914.
                </p>
              </section>
            </>
          ) : (
            <>
              <section className="space-y-2">
                <h2 className="text-base font-bold text-slate-900">1. Objeto da Plataforma</h2>
                <p>
                  O FreelaHub é um hub de conexões profissionais e postagens diárias de tarefas especializadas para freelancers,
                  com remuneração por hora ou tarefa e bônus de gravação em vídeo.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-slate-900">2. Responsabilidades do Freelancer</h2>
                <p>
                  O freelancer se compromete a realizar o serviço com segurança, utilizando os equipamentos de proteção individual (EPIs)
                  adequados quando aplicável, e cumprindo os requisitos acordados com o contratante.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-slate-900">3. Pagamentos e Saques PIX</h2>
                <p>
                  Os valores das tarefas aprovadas e bônus acumulados são transferidos diretamente via PIX para a chave cadastrada pelo usuário.
                </p>
              </section>
            </>
          )}
        </article>
      </main>
    </div>
  );
};
