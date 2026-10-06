import React, { useState } from 'react';
import { Calculator, Sparkles, Zap, ArrowRight, ShieldCheck } from 'lucide-react';

interface EarningsCalculatorProps {
  onExploreTasks: () => void;
}

export const EarningsCalculator: React.FC<EarningsCalculatorProps> = ({ onExploreTasks }) => {
  const [hoursPerDay, setHoursPerDay] = useState<number>(2);
  const [daysPerWeek, setDaysPerWeek] = useState<number>(5);
  const [bonusRate, setBonusRate] = useState<number>(80); // percentage of videos achieving video bonus

  // Base rate R$ 50/h + average bonus R$ 25/task
  const baseRatePerHour = 50;
  const avgBonusPerVideo = 25;

  const dailyBase = hoursPerDay * baseRatePerHour;
  const dailyBonus = hoursPerDay * (avgBonusPerVideo * (bonusRate / 100));
  const dailyTotal = dailyBase + dailyBonus;

  const weeklyTotal = dailyTotal * daysPerWeek;
  const monthlyTotal = weeklyTotal * 4.2;

  return (
    <section id="calculadora" className="py-10 sm:py-14 border-t border-white/5 bg-slate-950/60 relative">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-2.5 sm:space-y-3 mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#00e575] uppercase tracking-wider bg-[#00e575]/10 px-3 py-1 rounded-full border border-[#00e575]/20">
            <Calculator className="w-3.5 h-3.5" />
            <span>Simulador de Renda Extra</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white font-display">
            Quanto você pode faturar filmando seu dia a dia?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Seja na oficina mecânica, na bancada da sua casa ou na obra: ajuste o tempo disponível e veja sua projeção de PIX diário com o bônus em vídeo.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center max-w-5xl mx-auto">
          {/* Controls */}
          <div className="lg:col-span-6 p-4 sm:p-6 md:p-8 rounded-2xl bg-slate-900/80 border border-white/10 space-y-5 sm:space-y-6">
            {/* Slider 1: Hours per day */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-300">Tempo de gravação por dia:</span>
                <span className="text-[#00e575] font-mono font-bold text-sm">
                  {hoursPerDay} {hoursPerDay === 1 ? 'hora' : 'horas'} / dia
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="6"
                step="1"
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(Number(e.target.value))}
                className="w-full accent-[#00e575] bg-slate-800 h-2.5 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>1h (Casual)</span>
                <span>3h (Meio período)</span>
                <span>6h (Intensivo)</span>
              </div>
            </div>

            {/* Slider 2: Days per week */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-300">Dias trabalhados na semana:</span>
                <span className="text-[#00e575] font-mono font-bold text-sm">
                  {daysPerWeek} dias / semana
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="7"
                step="1"
                value={daysPerWeek}
                onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                className="w-full accent-[#00e575] bg-slate-800 h-2.5 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>1 dia</span>
                <span>4 dias</span>
                <span>7 dias (Todos)</span>
              </div>
            </div>

            {/* Slider 3: Bonus hit rate */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#00e575] shrink-0" />
                  <span>Aproveitamento do Bônus:</span>
                </span>
                <span className="text-[#00e575] font-mono font-bold text-sm">
                  {bonusRate}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="10"
                value={bonusRate}
                onChange={(e) => setBonusRate(Number(e.target.value))}
                className="w-full accent-[#00e575] bg-slate-800 h-2.5 rounded-lg cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 leading-normal">
                Quanto mais rápido você envia em boa resolução (1080p), maior o bônus adicionado no seu pagamento diário.
              </p>
            </div>
          </div>

          {/* Results Projection Card */}
          <div className="lg:col-span-6 p-4 sm:p-6 md:p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-[#00e575]/40 shadow-xl space-y-5 sm:space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00e575]/10 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Projeção Estimada
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-5xl font-extrabold text-[#00e575] font-mono">
                  R$ {monthlyTotal.toFixed(0)}
                </span>
                <span className="text-xs sm:text-sm text-slate-300 font-medium">/ mês</span>
              </div>
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-1">
              <div className="p-3 sm:p-3.5 rounded-xl bg-slate-950/70 border border-white/5 space-y-1">
                <div className="text-[10px] sm:text-[11px] text-slate-400">Ganhos por Dia</div>
                <div className="text-base sm:text-lg font-bold text-white font-mono">
                  R$ {dailyTotal.toFixed(2)}
                </div>
                <div className="text-[10px] text-emerald-400 font-medium truncate">
                  +R$ {dailyBonus.toFixed(0)} em bônus
                </div>
              </div>

              <div className="p-3 sm:p-3.5 rounded-xl bg-slate-950/70 border border-white/5 space-y-1">
                <div className="text-[10px] sm:text-[11px] text-slate-400">Ganhos por Semana</div>
                <div className="text-base sm:text-lg font-bold text-white font-mono">
                  R$ {weeklyTotal.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-400">
                  {daysPerWeek} dias gravados
                </div>
              </div>
            </div>

            <div className="pt-1 text-[11px] sm:text-xs text-slate-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00e575] shrink-0" />
              <span>Saques liberados via PIX em até 24h sem taxa de transferência.</span>
            </div>

            <button
              type="button"
              onClick={onExploreTasks}
              className="w-full py-3.5 px-4 text-xs sm:text-sm font-bold text-slate-950 bg-[#00e575] hover:bg-[#00ff87] rounded-xl transition-all shadow-md shadow-[#00e575]/30 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>Começar a Gravar Tarefas Hoje</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
