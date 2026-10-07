import React, { useState, useRef } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Video,
  Upload,
  Camera,
  Play,
  RotateCcw,
  Zap,
  ArrowRight,
  ShieldCheck,
  FileVideo,
  Clock,
  Layers,
  Phone,
  PhoneCall,
  Copy,
  Check,
  ExternalLink,
  User
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Task, VideoSubmission } from '../types';

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
  onSubmitSuccess: (submission: VideoSubmission) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  onClose,
  onSubmitSuccess,
}) => {
  if (!task) return null;

  const [activeTab, setActiveTab] = useState<'instructions' | 'submit'>('instructions');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [freelancerName, setFreelancerName] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [pixType, setPixType] = useState<'cpf' | 'email' | 'telefone' | 'aleatoria'>('cpf');
  const [meetsBonusCriteria, setMeetsBonusCriteria] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [isPhoneCopied, setIsPhoneCopied] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const totalCalculated = task.basePay + (meetsBonusCriteria && task.hasActiveBonus ? task.videoBonus : 0);

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setVideoPreviewUrl(URL.createObjectURL(file));
      setCameraActive(false);
    }
  };

  // Toggle live camera test
  const handleToggleCamera = async () => {
    if (cameraActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
      setCameraActive(false);
      return;
    }

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setCameraActive(true);
        setSelectedFile(null);
        setVideoPreviewUrl(null);
      } else {
        alert('Câmera não suportada neste navegador.');
      }
    } catch (err) {
      console.warn('Camera access was not granted or available in this sandbox:', err);
      // Fallback state
      setCameraActive(true);
    }
  };

  // Handle final submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!freelancerName.trim() || !pixKey.trim()) {
      alert('Por favor, preencha seu nome e sua chave PIX.');
      return;
    }

    if (!selectedFile && !cameraActive) {
      alert('Por favor, anexe seu vídeo gravado ou faça o teste de gravação.');
      return;
    }

    setIsSubmitting(true);

    // Simulate review & approval pipeline
    setTimeout(() => {
      const submission: VideoSubmission = {
        id: 'sub-' + Date.now(),
        taskId: task.id,
        taskTitle: task.title,
        freelancerName: freelancerName.trim(),
        pixKey: pixKey.trim(),
        pixType: pixType,
        submittedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        status: 'approved',
        baseEarned: task.basePay,
        bonusEarned: meetsBonusCriteria && task.hasActiveBonus ? task.videoBonus : 0,
        totalEarned: totalCalculated,
        videoFileName: selectedFile ? selectedFile.name : 'gravacao_pov_camera_hd.mp4',
        resolution: '1080p',
        fps: 60,
      };

      setIsSubmitting(false);
      setIsSuccess(true);

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00e575', '#ffffff', '#00c860', '#34d399']
      });

      onSubmitSuccess(submission);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl my-auto sm:my-8 bg-slate-900 border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[92dvh] sm:max-h-[88vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-white/10 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-white/10 text-slate-200">
              {task.locationType === 'workplace' ? '👷 No Trabalho' : '🛋️ Em Casa'}
            </span>
            <span className="text-xs text-slate-400 font-medium truncate max-w-[140px] sm:max-w-none">{task.company}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-slate-950/30 px-3 sm:px-6 pt-2.5 sm:pt-3 gap-2 sm:gap-6 overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('instructions')}
            className={`pb-2.5 sm:pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'instructions'
                ? 'border-[#00e575] text-[#00e575]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Instruções & Requisitos
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('submit')}
            className={`pb-2.5 sm:pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'submit'
                ? 'border-[#00e575] text-[#00e575]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Video className="w-4 h-4 shrink-0" />
            <span>2. Gravar & Receber PIX</span>
            {task.hasActiveBonus && (
              <span className="bg-[#00e575] text-slate-950 text-[10px] font-extrabold px-1.5 py-0.2 rounded shrink-0">
                +R${task.videoBonus}
              </span>
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6 flex-1">
          {isSuccess ? (
            <div className="py-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#00e575]/20 text-[#00e575] flex items-center justify-center mx-auto shadow-lg shadow-[#00e575]/30">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-extrabold text-white font-display">
                Gravação Aprovada com Sucesso!
              </h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto">
                Parabéns, {freelancerName}! Seu vídeo foi auditado e os critérios de qualidade e resolução foram 100% validados.
              </p>

              {/* Earnings receipt */}
              <div className="max-w-md mx-auto p-4 rounded-xl bg-slate-950 border border-white/10 text-left space-y-2.5">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Valor Base da Tarefa:</span>
                  <span className="text-white font-mono">R$ {task.basePay.toFixed(2)}</span>
                </div>
                {meetsBonusCriteria && task.hasActiveBonus && (
                  <div className="flex justify-between text-xs text-[#00e575] font-semibold">
                    <span>⚡ Bônus em Vídeo (1080p60 + Pontualidade):</span>
                    <span className="font-mono">+ R$ {task.videoBonus.toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-bold text-white">
                  <span>Total Depositado na Carteira:</span>
                  <span className="text-[#00e575] font-mono text-base">
                    R$ {totalCalculated.toFixed(2)}
                  </span>
                </div>
                <div className="pt-2 border-t border-white/10 text-[11px] text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00e575]" />
                  <span>Chave PIX registrada: {pixKey} ({pixType.toUpperCase()})</span>
                </div>
              </div>

              <div className="pt-4 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 text-xs font-bold text-slate-950 bg-[#00e575] hover:bg-[#00ff87] rounded-xl transition-all cursor-pointer"
                >
                  Concluir & Ver Minha Carteira
                </button>
              </div>
            </div>
          ) : activeTab === 'instructions' ? (
            /* TAB 1: Instructions */
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-white font-display">
                  {task.title}
                </h3>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  {task.description}
                </p>
              </div>

              {/* Bonus Highlight Card */}
              {task.hasActiveBonus && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-[#00e575]/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#00e575] font-bold text-sm">
                      <Sparkles className="w-4 h-4 fill-current" />
                      <span>BÔNUS EM VÍDEO DISPONÍVEL: +R$ {task.videoBonus},00</span>
                    </div>
                    <span className="text-xs font-mono text-slate-400">
                      Total c/ Bônus: R$ {totalCalculated.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    <strong className="text-white">Condição de ativação do bônus:</strong>{' '}
                    {task.bonusCondition}
                  </p>
                </div>
              )}

              {/* Checklist de Gravação */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Requisitos de Gravação POV
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {task.requirements.map((req, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-slate-950/70 border border-white/5 flex items-start gap-2.5 text-xs text-slate-300"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#00e575] shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Equipamentos necessários */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Equipamento Recomendado
                </h4>
                <div className="flex flex-wrap gap-2">
                  {task.equipmentNeeded.map((eq, i) => (
                    <span
                      key={i}
                      className="text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-slate-200"
                    >
                      {eq}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contractor Contact Card (24h Daily Mission) */}
              {task.contractorPhone && (
                <div className="p-4 rounded-xl bg-slate-950 border border-[#00e575]/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#00e575]/15 border border-[#00e575]/30 flex items-center justify-center text-[#00e575]">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#00e575] tracking-wider block">
                          Contratante Oficial da Vaga (Prazo 24h)
                        </span>
                        <h5 className="text-xs sm:text-sm font-bold text-white">
                          {task.contractorContactName || task.company}
                        </h5>
                      </div>
                    </div>
                    {task.expiresInHours && (
                      <span className="text-[11px] font-mono font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                        Expira em ~{task.expiresInHours}h
                      </span>
                    )}
                  </div>

                  {task.contractorRole && (
                    <p className="text-xs text-slate-400">
                      {task.contractorRole} • {task.company}
                    </p>
                  )}

                  {/* Phone & Instant Actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    <div className="sm:col-span-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-[#00e575]" />
                        <span className="font-mono text-xs font-bold text-white truncate">
                          {task.contractorPhone}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (task.contractorPhone) {
                            navigator.clipboard.writeText(task.contractorPhone);
                            setIsPhoneCopied(true);
                            setTimeout(() => setIsPhoneCopied(false), 2000);
                          }
                        }}
                        className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
                        title="Copiar Telefone"
                      >
                        {isPhoneCopied ? (
                          <Check className="w-3.5 h-3.5 text-[#00e575]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <a
                      href={`https://wa.me/${(task.contractorWhatsapp || task.contractorPhone).replace(/\D/g, '')}?text=${encodeURIComponent(
                        `Olá! Vi sua vaga no FreelaHub ("${task.title}"). Gostaria de tirar dúvidas e confirmar minha gravação com você!`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 rounded-xl text-xs font-bold bg-[#00e575] hover:bg-[#00ff87] text-slate-950 flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-[#00e575]/20"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>WhatsApp Direto</span>
                    </a>

                    <a
                      href={`tel:${task.contractorPhone.replace(/\s+/g, '')}`}
                      className="py-2 px-3 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-white flex items-center justify-center gap-1.5 transition-colors border border-white/10"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-[#00e575]" />
                      <span>Ligar Agora</span>
                    </a>
                  </div>
                </div>
              )}

              {/* CTA forward */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex sm:flex-col justify-between items-center sm:items-start">
                  <span className="text-xs text-slate-400">Remuneração estimada:</span>
                  <div className="text-lg font-bold text-white font-mono">
                    R$ {totalCalculated.toFixed(2)}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('submit')}
                  className="w-full sm:w-auto px-5 py-3 sm:py-2.5 text-xs font-bold text-slate-950 bg-[#00e575] hover:bg-[#00ff87] rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#00e575]/25 active:scale-98"
                >
                  <span>Gravar ou Enviar Vídeo Agora</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* TAB 2: Video Submission & PIX */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Video Upload / Record Area */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Vídeo da Tarefa (Grave com celular ou anexe arquivo)
                </label>

                {/* Upload or Camera Toggle */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (fileInputRef.current) fileInputRef.current.click();
                    }}
                    className="flex-1 py-3 px-4 rounded-xl border border-dashed border-white/20 bg-slate-950/60 hover:bg-slate-950 hover:border-[#00e575] transition-all flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-[#00e575]" />
                    <span>
                      {selectedFile ? selectedFile.name : 'Anexar Gravação do Celular (MP4 / MOV)'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleCamera}
                    className={`py-3 px-4 rounded-xl border transition-all flex items-center gap-2 text-xs font-semibold cursor-pointer ${
                      cameraActive
                        ? 'border-red-500 bg-red-950/30 text-red-300'
                        : 'border-white/15 bg-slate-950/60 hover:bg-slate-950 text-slate-300'
                    }`}
                  >
                    <Camera className="w-4 h-4" />
                    <span>{cameraActive ? 'Fechar Câmera' : 'Testar Câmera POV'}</span>
                  </button>
                </div>

                {/* Hidden native input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Video Preview or Live Feed Container */}
                {(videoPreviewUrl || cameraActive) && (
                  <div className="relative rounded-xl overflow-hidden aspect-[16/9] bg-black border border-white/20">
                    {cameraActive ? (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        src={videoPreviewUrl || undefined}
                        controls
                        className="w-full h-full object-cover"
                      />
                    )}

                    {/* POV Guide Grid Overlay */}
                    <div className="absolute inset-0 pointer-events-none border border-[#00e575]/20 flex flex-col justify-between p-4">
                      <div className="flex justify-between items-center text-[10px] font-mono text-white/80 bg-black/60 px-2 py-1 rounded w-fit backdrop-blur-sm">
                        <span>POV SENSOR GUIDE</span>
                        <span className="mx-2">|</span>
                        <span className="text-[#00e575]">ALINHAMENTO CENTRAL OK</span>
                      </div>
                      <div className="w-16 h-16 border-2 border-dashed border-[#00e575]/40 rounded-full mx-auto self-center" />
                      <div className="text-[10px] text-right font-mono text-slate-300 bg-black/60 px-2 py-1 rounded w-fit self-end backdrop-blur-sm">
                        1080P · 60 FPS
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bonus Criteria Toggle Checkbox */}
              {task.hasActiveBonus && (
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-white">
                      <input
                        type="checkbox"
                        checked={meetsBonusCriteria}
                        onChange={(e) => setMeetsBonusCriteria(e.target.checked)}
                        className="w-4 h-4 rounded text-[#00e575] accent-[#00e575] focus:ring-0 cursor-pointer"
                      />
                      <span>Garantir Bônus em Vídeo (+R$ {task.videoBonus.toFixed(2)})</span>
                    </label>
                    <span className="text-xs font-mono font-bold text-[#00e575]">
                      +R$ {task.videoBonus.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 pl-6">
                    Declaro que gravei em primeira pessoa (POV) com ângulo correto, sem cortes indevidos e iluminação adequada conforme as regras do bônus.
                  </p>
                </div>
              )}

              {/* Freelancer Info & PIX Key */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Seu Nome Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={freelancerName}
                    onChange={(e) => setFreelancerName(e.target.value)}
                    placeholder="Ex: Carlos Silva"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-base sm:text-xs text-white focus:outline-none focus:border-[#00e575]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Tipo de Chave PIX
                  </label>
                  <select
                    value={pixType}
                    onChange={(e) => setPixType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-base sm:text-xs text-white focus:outline-none focus:border-[#00e575]"
                  >
                    <option value="cpf">CPF</option>
                    <option value="email">E-mail</option>
                    <option value="telefone">Celular</option>
                    <option value="aleatoria">Chave Aleatória (EVP)</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Chave PIX para Recebimento Imediato
                  </label>
                  <input
                    type="text"
                    required
                    value={pixKey}
                    onChange={(e) => setPixKey(e.target.value)}
                    placeholder="Digite seu CPF, e-mail ou chave PIX..."
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-base sm:text-xs text-white focus:outline-none focus:border-[#00e575]"
                  />
                </div>
              </div>

              {/* Summary & Submit Button */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex sm:flex-col justify-between items-center sm:items-start">
                  <div className="text-[11px] text-slate-400">Total a ser creditado:</div>
                  <div className="text-xl font-mono font-extrabold text-[#00e575]">
                    R$ {totalCalculated.toFixed(2)}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-3.5 sm:py-3 text-xs font-bold text-slate-950 bg-[#00e575] hover:bg-[#00ff87] disabled:opacity-50 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#00e575]/25 active:scale-98"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Auditando & Processando Vídeo...</span>
                    </>
                  ) : (
                    <>
                      <span>Enviar Vídeo & Receber via PIX</span>
                      <Zap className="w-4 h-4 fill-current shrink-0" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
