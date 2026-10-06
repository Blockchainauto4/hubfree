import React, { useState } from 'react';
import { X, Plus, Sparkles, Check, Building2, Clock, DollarSign } from 'lucide-react';
import { Task } from '../types';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: (newTask: Task) => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onTaskCreated,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [locationType, setLocationType] = useState<'workplace' | 'home'>('workplace');
  const [category, setCategory] = useState<Task['category']>('Mecânica');
  const [basePay, setBasePay] = useState<number>(55);
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [hasActiveBonus, setHasActiveBonus] = useState(true);
  const [videoBonus, setVideoBonus] = useState<number>(25);
  const [bonusCondition, setBonusCondition] = useState('Gravação contínua em 1080p60fps sem cortes nas mãos e envio em até 12h');
  const [slotsTotal, setSlotsTotal] = useState<number>(10);
  const [description, setDescription] = useState('');
  const [req1, setReq1] = useState('Celular fixado na cabeça ou peito para visão em primeira pessoa (POV)');
  const [req2, setReq2] = useState('Boa iluminação no local sem reflexos excessivos');
  const [req3, setReq3] = useState('Áudio ambiente real sem ruídos de música externa');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !company.trim() || !description.trim()) {
      alert('Por favor, preencha os campos obrigatórios.');
      return;
    }

    const newTask: Task = {
      id: 'task-' + Date.now(),
      title: title.trim(),
      company: company.trim(),
      locationType,
      category,
      basePay: Number(basePay),
      payType: 'hora',
      videoBonus: hasActiveBonus ? Number(videoBonus) : 0,
      bonusCondition: hasActiveBonus ? bonusCondition : 'Sem bônus adicional configurado',
      hasActiveBonus,
      slotsTotal: Number(slotsTotal),
      slotsFilled: 0,
      durationMinutes: Number(durationMinutes),
      image: locationType === 'workplace' 
        ? '/src/assets/images/video_task_workshop_pov_1791299034671.jpg'
        : '/src/assets/images/video_task_home_desk_pov_1791299045141.jpg',
      description: description.trim(),
      requirements: [req1, req2, req3].filter((r) => r.trim().length > 0),
      equipmentNeeded: ['Suporte de celular para cabeça ou peitoral', 'Smartphone com câmera 1080p'],
      postedDate: 'Hoje agora mesmo',
      isUrgent: true,
    };

    onTaskCreated(newTask);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 bg-slate-900 border border-white/15 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#00e575]" />
            <h3 className="text-lg font-bold text-white font-display">
              Publicar Postagem Freelancer Diária
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
        <form onSubmit={handleSubmit} className="p-6 max-h-[78vh] overflow-y-auto space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Título da Tarefa Profissional *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Gravação de Diagnóstico com Scanner Automotivo OBD2"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00e575]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Nome da Empresa / Laboratório *
              </label>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Ex: VisionAI Brasil, AutoData Labs"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00e575]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Ambiente de Execução *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLocationType('workplace')}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                    locationType === 'workplace'
                      ? 'bg-[#00e575] text-slate-950 border-[#00e575]'
                      : 'bg-slate-950 text-slate-400 border-white/10'
                  }`}
                >
                  👷 No Trabalho
                </button>
                <button
                  type="button"
                  onClick={() => setLocationType('home')}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                    locationType === 'home'
                      ? 'bg-[#00e575] text-slate-950 border-[#00e575]'
                      : 'bg-slate-950 text-slate-400 border-white/10'
                  }`}
                >
                  🛋️ Em Casa
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Categoria da Especialidade *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00e575]"
              >
                <option value="Mecânica">Mecânica</option>
                <option value="Elétrica">Elétrica</option>
                <option value="Culinária">Culinária</option>
                <option value="Tecnologia">Tecnologia</option>
                <option value="Construção">Construção</option>
                <option value="Artesanato">Artesanato</option>
                <option value="Serviços">Serviços</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Valor Base por Gravação (R$) *
              </label>
              <input
                type="number"
                min="30"
                max="500"
                required
                value={basePay}
                onChange={(e) => setBasePay(Number(e.target.value))}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#00e575]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Duração Média Estimada (Minutos)
              </label>
              <input
                type="number"
                min="10"
                max="240"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#00e575]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Quantidade de Vagas Diárias
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={slotsTotal}
                onChange={(e) => setSlotsTotal(Number(e.target.value))}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#00e575]"
              />
            </div>
          </div>

          {/* Video Bonus Configuration Section */}
          <div className="p-4 rounded-xl bg-slate-950 border border-[#00e575]/30 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-white">
                <input
                  type="checkbox"
                  checked={hasActiveBonus}
                  onChange={(e) => setHasActiveBonus(e.target.checked)}
                  className="w-4 h-4 rounded text-[#00e575] accent-[#00e575] focus:ring-0 cursor-pointer"
                />
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#00e575]" />
                  Oferecer Bônus em Vídeo para Entregas Rápidas / HD
                </span>
              </label>
              {hasActiveBonus && (
                <span className="text-xs font-mono font-bold text-[#00e575]">
                  +R$ {Number(videoBonus).toFixed(2)}
                </span>
              )}
            </div>

            {hasActiveBonus && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Valor do Bônus (R$)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={videoBonus}
                    onChange={(e) => setVideoBonus(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#00e575]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Critério para Liberar o Bônus
                  </label>
                  <input
                    type="text"
                    value={bonusCondition}
                    onChange={(e) => setBonusCondition(e.target.value)}
                    placeholder="Ex: Gravação 1080p60fps entregue em até 12h"
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00e575]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Descrição Detalhada do Procedimento *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explique exatamente o que o profissional deve executar diante da câmera..."
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00e575]"
            />
          </div>

          {/* Requirements */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">
              Requisitos Obrigatórios para o Freelancer
            </label>
            <input
              type="text"
              value={req1}
              onChange={(e) => setReq1(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00e575]"
            />
            <input
              type="text"
              value={req2}
              onChange={(e) => setReq2(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00e575]"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold text-slate-950 bg-[#00e575] hover:bg-[#00ff87] rounded-xl transition-all shadow-md shadow-[#00e575]/25 cursor-pointer"
            >
              Publicar no Feed Diário
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
