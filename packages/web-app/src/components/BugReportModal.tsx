import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../stores/useGameStore.js';
import { historyDb, type StoredBugReport } from '../db/historyDb.js';
import {
  Bug,
  X,
  Upload,
  CheckCircle2,
  Info,
  Copy,
  Download,
  Trash2,
  RefreshCw,
  Send,
  Eye,
  Camera,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'nomenclatura', label: '🧪 Nomenclatura IUPAC', hint: 'Erro no nome aceito, sufixo, infixo, cadeia principal ou radicais' },
  { id: 'estrutura', label: '🔬 Desenho da Molécula', hint: 'Estrutura 2D cortada, átomos sobrepostos, ligação incorreta' },
  { id: 'jogabilidade', label: '🎮 Jogabilidade & Pontuação', hint: 'Cálculo de XP, sequência/combos, multiplicador, cronômetro' },
  { id: 'interface', label: '💻 Botão ou Interface Travada', hint: 'Botão não clica, tela travada, erro visual, responsividade' },
  { id: 'audio', label: '🔊 Áudio & Sons', hint: 'Efeito sonoro ausente, chiado ou volume irregular' },
  { id: 'outro', label: '❓ Outro Problema', hint: 'Qualquer outra dúvida, sugestão ou bug' },
] as const;

type BugCategory = typeof CATEGORIES[number]['id'];

export const BugReportModal: React.FC = () => {
  const { isBugReportModalOpen, closeBugReportModal, bugReportContext, currentMolecule, activeTab } = useGameStore();

  const [activeView, setActiveView] = useState<'form' | 'history'>('form');
  const [category, setCategory] = useState<BugCategory>('nomenclatura');
  const [description, setDescription] = useState('');
  const [expectedBehavior, setExpectedBehavior] = useState('');
  const [screenshotBase64, setScreenshotBase64] = useState<string | null>(null);
  const [screenshotFileName, setScreenshotFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [showTechDetails, setShowTechDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<{ id: string; filePath?: string } | null>(null);
  const [historyReports, setHistoryReports] = useState<StoredBugReport[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const modalContainerRef = useRef<HTMLDivElement | null>(null);

  // Auto-focus description on open
  const descriptionInputRef = useRef<HTMLTextAreaElement | null>(null);

  // Load history when modal opens or history tab selected
  const loadHistory = useCallback(async () => {
    try {
      const reports = await historyDb.getBugReports();
      setHistoryReports(reports);
    } catch (e) {
      console.warn('Erro ao carregar histórico de relatórios:', e);
    }
  }, []);

  useEffect(() => {
    if (isBugReportModalOpen) {
      loadHistory();
      setSubmitSuccess(null);
      setDescription('');
      setExpectedBehavior('');
      setScreenshotBase64(null);
      setScreenshotFileName('');
      setActiveView('form');

      // Pre-select category based on context
      if (bugReportContext?.iupacName) {
        setCategory('nomenclatura');
      }

      setTimeout(() => {
        descriptionInputRef.current?.focus();
      }, 100);
    }
  }, [isBugReportModalOpen, bugReportContext, loadHistory]);

  // Global Esc key to close
  useEffect(() => {
    if (!isBugReportModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeBugReportModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBugReportModalOpen, closeBugReportModal]);

  // Support Ctrl+V paste of images directly anywhere inside the modal
  const handlePaste = useCallback((e: React.ClipboardEvent | ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          processImageFile(file, `print-clipboard-${Date.now()}.png`);
        }
        break;
      }
    }
  }, []);

  // Process and optimize image file to base64
  const processImageFile = (file: File, defaultName?: string) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (.png, .jpg, .webp).');
      return;
    }

    // Limit to 10MB raw file
    if (file.size > 10 * 1024 * 1024) {
      alert('A imagem é muito grande. Escolha uma imagem de até 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        // Compress/resize if very large using canvas
        compressImage(result, (compressedDataUrl) => {
          setScreenshotBase64(compressedDataUrl);
          setScreenshotFileName(file.name || defaultName || 'print-captura.png');
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Optional client-side image downscaler to max 1920x1080 to keep reports fast & lean
  const compressImage = (base64Str: string, callback: (compressed: string) => void) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const maxWidth = 1920;
      const maxHeight = 1080;
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        callback(canvas.toDataURL('image/png', 0.88));
      } else {
        callback(base64Str);
      }
    };
    img.onerror = () => {
      callback(base64Str);
    };
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  // Collect technical context
  const technicalContext = {
    activeTab: bugReportContext?.activeTab || activeTab,
    moleculeId: bugReportContext?.moleculeId || currentMolecule?.id,
    smiles: bugReportContext?.smiles || currentMolecule?.smiles,
    iupacName: bugReportContext?.iupacName || currentMolecule?.iupacName,
    formula: bugReportContext?.formula || currentMolecule?.formula,
    userInput: bugReportContext?.userInput,
    difficulty: bugReportContext?.difficulty || currentMolecule?.difficulty,
    score: bugReportContext?.score,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Desconhecido',
    screenResolution:
      typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight} (pixelRatio: ${window.devicePixelRatio || 1})` : 'N/A',
    url: typeof window !== 'undefined' ? window.location.href : '',
  };

  // Build markdown export text
  const generateFormattedMarkdown = (reportId: string, dateFormatted: string) => {
    return `# Relatório de Erro: [${category.toUpperCase()}] ${description.slice(0, 60)}

- **ID do Relatório:** \`${reportId}\`
- **Data:** ${dateFormatted}
- **Categoria:** \`${category}\`

## 1. O que aconteceu de errado?
${description}

## 2. O que era esperado acontecer?
${expectedBehavior.trim() ? expectedBehavior : '*Não informado pelo usuário.*'}

## 3. Print / Imagem Anexada
${screenshotBase64 ? `*(Print anexado no relatório: ${screenshotFileName})*` : '*Nenhum print anexado.*'}

## 4. Diagnóstico Técnico Autocapturado
- **Aba:** \`${technicalContext.activeTab}\`
- **ID da Molécula:** \`${technicalContext.moleculeId || 'N/A'}\`
- **Nome IUPAC Esperado:** \`${technicalContext.iupacName || 'N/A'}\`
- **Fórmula:** \`${technicalContext.formula || 'N/A'}\`
- **SMILES:** \`${technicalContext.smiles || 'N/A'}\`
- **Entrada Digitada:** \`${technicalContext.userInput || 'N/A'}\`
- **Resolução:** \`${technicalContext.screenResolution}\`
- **Navegador:** \`${technicalContext.userAgent}\`
`;
  };

  // Submit report
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (description.trim().length < 8) {
      alert('Por favor, descreva o que aconteceu com pelo menos algumas palavras para podermos entender o problema.');
      return;
    }

    setIsSubmitting(true);

    const now = Date.now();
    const dateObj = new Date(now);
    const dateFormatted = dateObj.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    const dateIso = dateObj.toISOString();
    const reportId = `bug-${dateObj.getFullYear()}${String(dateObj.getMonth() + 1).padStart(2, '0')}${String(
      dateObj.getDate()
    ).padStart(2, '0')}-${String(dateObj.getHours()).padStart(2, '0')}${String(dateObj.getMinutes()).padStart(2, '0')}${String(
      dateObj.getSeconds()
    ).padStart(2, '0')}-${Math.random().toString(36).substring(2, 6)}`;

    const title = description.trim().split('\n')[0].slice(0, 80);

    const payload = {
      id: reportId,
      timestamp: now,
      dateIso,
      dateFormatted,
      category,
      title,
      description: description.trim(),
      expectedBehavior: expectedBehavior.trim() || undefined,
      screenshotBase64: screenshotBase64 || undefined,
      context: technicalContext,
    };

    let syncedToFile = false;
    let filePathResult: string | undefined = undefined;

    // 1. Try sending to local dev server endpoint
    try {
      const response = await fetch('/api/bug-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const json = await response.json();
        syncedToFile = true;
        filePathResult = json.filePath;
      }
    } catch {
      // Offline or static preview mode — will save to Dexie IndexedDB
      syncedToFile = false;
    }

    // 2. Always persist locally in Dexie database
    const storedRecord: StoredBugReport = {
      ...payload,
      syncedToFile,
      filePath: filePathResult,
    };

    await historyDb.recordBugReport(storedRecord);
    await loadHistory();

    setIsSubmitting(false);
    setSubmitSuccess({
      id: reportId,
      filePath: filePathResult,
    });
  };

  const handleCopyReport = async (reportText: string, id: string) => {
    try {
      await navigator.clipboard.writeText(reportText);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      alert('Não foi possível copiar automaticamente para a área de transferência.');
    }
  };

  const handleDownloadReportJson = (report: StoredBugReport) => {
    const jsonStr = JSON.stringify(report, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteReport = async (id: string) => {
    if (confirm('Deseja excluir este relatório do histórico do navegador?')) {
      await historyDb.deleteBugReport(id);
      await loadHistory();
    }
  };

  if (!isBugReportModalOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="bug-report-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
      onClick={closeBugReportModal}
      onPaste={handlePaste}
    >
      <div
        ref={modalContainerRef}
        className="w-full max-w-2xl max-h-[94vh] flex flex-col rounded-3xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xl overflow-hidden text-[var(--md-sys-color-on-surface)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]">
              <Bug className="w-5 h-5 text-[var(--md-sys-color-error)]" />
            </div>
            <div>
              <h2 id="bug-report-title" className="text-base sm:text-lg font-bold tracking-tight text-[var(--md-sys-color-on-surface)] flex items-center gap-2">
                <span>Reportar Erro ou Bug</span>
                <span className="m3-chip text-[10px] py-0.5 px-2 font-mono bg-[var(--md-sys-color-surface-container-high)]">
                  Suporte Direto
                </span>
              </h2>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                Relate inconsistências para a IA e desenvolvedores resolverem rapidamente.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeBugReportModal}
            className="p-2.5 rounded-full hover:bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)] transition-all cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Fechar janela"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex border-b border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] px-4">
          <button
            type="button"
            onClick={() => {
              setActiveView('form');
              setSubmitSuccess(null);
            }}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeView === 'form'
                ? 'border-[var(--md-sys-color-primary)] text-[var(--md-sys-color-primary)]'
                : 'border-transparent text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
            }`}
          >
            Novo Relatório
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveView('history');
              loadHistory();
            }}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeView === 'history'
                ? 'border-[var(--md-sys-color-primary)] text-[var(--md-sys-color-primary)]'
                : 'border-transparent text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
            }`}
          >
            <span>Histórico ({historyReports.length})</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {activeView === 'history' ? (
            /* History View */
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-[var(--md-sys-color-on-surface-variant)]">
                <span>Relatórios registrados neste navegador ou salvos na pasta <code className="font-mono text-[var(--md-sys-color-primary)]">reports/</code></span>
                <button
                  type="button"
                  onClick={loadHistory}
                  className="flex items-center gap-1 hover:text-[var(--md-sys-color-primary)] cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Atualizar</span>
                </button>
              </div>

              {historyReports.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface-variant)]">
                  <Bug className="w-8 h-8 mx-auto mb-2 opacity-40 text-[var(--md-sys-color-primary)]" />
                  <p className="text-sm font-semibold">Nenhum relatório enviado ainda.</p>
                  <p className="text-xs mt-1">Quando você encontrar um bug ou erro e reportar, ele aparecerá aqui com os dados e prints salvos.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {historyReports.map((report) => (
                    <div
                      key={report.id}
                      className="p-4 rounded-2xl bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] flex flex-col gap-3 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[var(--md-sys-color-on-surface)]">
                              {report.id}
                            </span>
                            <span className="m3-chip text-[10px] py-0 px-2 font-semibold">
                              {report.category}
                            </span>
                            {report.syncedToFile ? (
                              <span className="text-[10px] text-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)] px-2 py-0.5 rounded-full font-bold">
                                Salvo em reports/
                              </span>
                            ) : (
                              <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] bg-[var(--md-sys-color-surface-container-highest)] px-2 py-0.5 rounded-full">
                                Salvo no navegador
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] mt-0.5 block">
                            {report.dateFormatted}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              handleCopyReport(
                                generateFormattedMarkdown(report.id, report.dateFormatted),
                                report.id
                              )
                            }
                            className="p-1.5 rounded-lg hover:bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)] transition-colors cursor-pointer"
                            title="Copiar texto formatado em Markdown"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownloadReportJson(report)}
                            className="p-1.5 rounded-lg hover:bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)] transition-colors cursor-pointer"
                            title="Baixar arquivo JSON completo"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteReport(report.id)}
                            className="p-1.5 rounded-lg hover:bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-error)] transition-colors cursor-pointer"
                            title="Excluir do histórico do navegador"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface)] leading-relaxed">
                        <strong className="text-[var(--md-sys-color-primary)]">Relato: </strong>
                        {report.description}
                      </div>

                      {report.expectedBehavior && (
                        <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                          <strong>Esperado: </strong> {report.expectedBehavior}
                        </div>
                      )}

                      {/* Molecule info if present */}
                      {report.context.iupacName && (
                        <div className="flex flex-wrap gap-2 pt-1 border-t border-[var(--md-sys-color-outline-variant)] text-[10px] font-mono text-[var(--md-sys-color-on-surface-variant)]">
                          <span>Molécula: <strong className="text-[var(--md-sys-color-on-surface)]">{report.context.iupacName}</strong></span>
                          {report.context.formula && <span>Fórmula: {report.context.formula}</span>}
                          {report.context.userInput && <span>Digitado: <code className="bg-black/20 px-1 rounded">{report.context.userInput}</code></span>}
                        </div>
                      )}

                      {copiedId === report.id && (
                        <div className="text-xs text-[var(--md-sys-color-primary)] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Texto copiado para a área de transferência!</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : submitSuccess ? (
            /* Success Feedback View */
            <div className="p-6 rounded-3xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border border-[var(--md-sys-color-primary)] flex flex-col items-center text-center gap-4 animate-scaleUp">
              <div className="w-14 h-14 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider opacity-80">
                  Relatório Registrado com Sucesso!
                </span>
                <h3 className="text-lg font-black mt-1">
                  Obrigado por ajudar a aprimorar o QuímicaRush!
                </h3>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface)] text-xs text-left w-full space-y-1.5 font-mono border border-[var(--md-sys-color-outline-variant)]">
                <div>
                  <span className="text-[var(--md-sys-color-on-surface-variant)]">ID: </span>
                  <strong>{submitSuccess.id}</strong>
                </div>
                {submitSuccess.filePath ? (
                  <div>
                    <span className="text-[var(--md-sys-color-on-surface-variant)]">Arquivo no projeto: </span>
                    <strong className="text-[var(--md-sys-color-primary)]">{submitSuccess.filePath}</strong>
                    <p className="text-[11px] font-sans text-[var(--md-sys-color-on-surface-variant)] mt-1">
                      A IA e os desenvolvedores já conseguem abrir este arquivo e consertar o bug diretamente.
                    </p>
                  </div>
                ) : (
                  <div>
                    <span className="text-[var(--md-sys-color-on-surface-variant)]">Status: </span>
                    <span>Salvo com segurança no seu navegador. Você pode copiar o texto abaixo para enviar no chat.</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 w-full">
                <button
                  type="button"
                  onClick={() =>
                    handleCopyReport(
                      generateFormattedMarkdown(submitSuccess.id, new Date().toLocaleString('pt-BR')),
                      submitSuccess.id
                    )
                  }
                  className="px-4 py-2.5 rounded-xl bg-[var(--md-sys-color-surface-container-high)] hover:bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline-variant)] text-xs font-bold text-[var(--md-sys-color-on-surface)] flex items-center gap-2 cursor-pointer shadow-sm transition-all"
                >
                  <Copy className="w-4 h-4 text-[var(--md-sys-color-primary)]" />
                  <span>{copiedId === submitSuccess.id ? 'Copiado!' : 'Copiar Texto para o Chat'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSubmitSuccess(null);
                    setDescription('');
                    setExpectedBehavior('');
                    setScreenshotBase64(null);
                    setScreenshotFileName('');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[var(--md-sys-color-surface-container-high)] hover:bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline-variant)] text-xs font-bold text-[var(--md-sys-color-on-surface)] flex items-center gap-2 cursor-pointer shadow-sm transition-all"
                >
                  <span>Enviar Outro</span>
                </button>

                <button
                  type="button"
                  onClick={closeBugReportModal}
                  className="px-5 py-2.5 rounded-xl bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-xs font-bold cursor-pointer shadow-md hover:brightness-110 transition-all"
                >
                  Concluir & Fechar
                </button>
              </div>
            </div>
          ) : (
            /* Form View */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Ultra-clear Didactic Guidance Box */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--md-sys-color-primary)]">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>COMO REPORTAR PARA CONSERTARMOS EM MINUTOS:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] leading-relaxed">
                  <div className="p-2.5 rounded-xl bg-[var(--md-sys-color-error-container)]/30 border border-[var(--md-sys-color-error)]/30 text-[var(--md-sys-color-on-surface)]">
                    <strong className="text-[var(--md-sys-color-error)] flex items-center gap-1 mb-0.5">
                      ❌ NÃO AJUDA:
                    </strong>
                    <span>"Tá bugado", "Deu erro", "O nome tá errado", "Não funcionou". (Sem detalhes, não sabemos o que aconteceu na sua tela!)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[var(--md-sys-color-primary-container)]/30 border border-[var(--md-sys-color-primary)]/30 text-[var(--md-sys-color-on-surface)]">
                    <strong className="text-[var(--md-sys-color-primary)] flex items-center gap-1 mb-0.5">
                      ✅ PERFEITO:
                    </strong>
                    <span>"Digitei 2-metilpropano, mas o jogo deu errado e exigiu metilpropano." + <strong>PRINT DA TELA</strong></span>
                  </div>
                </div>
              </div>

              {/* Category Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--md-sys-color-on-surface)] uppercase tracking-wider block">
                  1. Categoria do Problema:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => {
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`p-2.5 rounded-xl text-left border flex flex-col gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-bold shadow-sm'
                            : 'border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
                        }`}
                      >
                        <span className="text-xs font-bold">{cat.label}</span>
                        <span className="text-[10px] opacity-75 line-clamp-1">{cat.hint}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 📸 Print / Screenshot Uploader (Prominently Highlighted!) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[var(--md-sys-color-on-surface)] uppercase tracking-wider flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-[var(--md-sys-color-primary)]" />
                    <span>2. Print da Tela (O QUE MAIS AJUDA!):</span>
                  </label>
                  <span className="text-[10px] text-[var(--md-sys-color-primary)] font-bold bg-[var(--md-sys-color-primary-container)] px-2 py-0.5 rounded-full">
                    Altamente Recomendado 🔥
                  </span>
                </div>

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => !screenshotBase64 && fileInputRef.current?.click()}
                  className={`p-4 rounded-2xl border-2 border-dashed transition-all ${
                    screenshotBase64
                      ? 'border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-surface-container-high)]'
                      : isDragging
                      ? 'border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)]/30 scale-[1.01]'
                      : 'border-[var(--md-sys-color-outline-variant)] hover:border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-surface-container-high)] cursor-pointer'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && processImageFile(e.target.files[0])}
                    className="hidden"
                  />

                  {screenshotBase64 ? (
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="relative group max-w-[200px] max-h-[140px] rounded-xl overflow-hidden border border-[var(--md-sys-color-outline-variant)] bg-black/40 shadow-sm shrink-0">
                        <img
                          src={screenshotBase64}
                          alt="Pré-visualização do print"
                          className="w-full h-full object-cover max-h-[140px]"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Eye className="w-5 h-5 text-white" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col gap-1.5 text-xs">
                        <div className="flex items-center gap-1.5 text-[var(--md-sys-color-primary)] font-bold">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span className="truncate">{screenshotFileName}</span>
                        </div>
                        <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
                          Print anexado com sucesso! A imagem será salva junto ao relatório técnico para resolução imediata.
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              fileInputRef.current?.click();
                            }}
                            className="text-[11px] font-bold text-[var(--md-sys-color-primary)] hover:underline cursor-pointer"
                          >
                            Trocar print
                          </button>
                          <span className="text-[var(--md-sys-color-outline-variant)]">•</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setScreenshotBase64(null);
                              setScreenshotFileName('');
                            }}
                            className="text-[11px] font-bold text-[var(--md-sys-color-error)] hover:underline cursor-pointer"
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center gap-2 py-3">
                      <div className="w-12 h-12 rounded-2xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-primary)] flex items-center justify-center">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[var(--md-sys-color-on-surface)]">
                          Tire um print da tela e cole aqui com <kbd className="px-1.5 py-0.5 rounded bg-[var(--md-sys-color-surface-container-highest)] border font-mono">Ctrl + V</kbd>
                        </p>
                        <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
                          Ou clique para selecionar / arraste a imagem do seu celular ou computador (.png, .jpg)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[var(--md-sys-color-on-surface)] uppercase tracking-wider">
                    3. O que aconteceu de errado? <span className="text-[var(--md-sys-color-error)]">*</span>
                  </label>
                  <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] font-mono">
                    {description.length} caracteres
                  </span>
                </div>
                <textarea
                  ref={descriptionInputRef}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Digitei '2-metilbutano' para a molécula apresentada, mas o sistema considerou errado e indicou 'pentano'. O carbono 2 possui nitidamente uma ramificação metil..."
                  rows={3}
                  required
                  className="w-full bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] focus:border-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-surface)] text-xs rounded-2xl p-3 outline-none resize-y leading-relaxed placeholder:text-[var(--md-sys-color-on-surface-variant)]/60"
                />
              </div>

              {/* Expected Behavior Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--md-sys-color-on-surface)] uppercase tracking-wider block">
                  4. O que você esperava que acontecesse? (Opcional):
                </label>
                <textarea
                  value={expectedBehavior}
                  onChange={(e) => setExpectedBehavior(e.target.value)}
                  placeholder="Ex: Esperava que o nome '2-metilbutano' fosse aceito como 100% correto segundo as regras da IUPAC 2013."
                  rows={2}
                  className="w-full bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] focus:border-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-surface)] text-xs rounded-2xl p-3 outline-none resize-y leading-relaxed placeholder:text-[var(--md-sys-color-on-surface-variant)]/60"
                />
              </div>

              {/* Autocaptured Technical Diagnostics (Collapsible Accordion) */}
              <div className="rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowTechDetails(!showTechDetails)}
                  className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--md-sys-color-primary)] font-mono">⚙️</span>
                    <span>Dados Técnicos Coletados Automaticamente</span>
                    <span className="text-[10px] text-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)] px-2 py-0.5 rounded-full font-bold">
                      Zero Esforço
                    </span>
                  </div>
                  <span className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                    {showTechDetails ? 'Ocultar ▲' : 'Ver detalhes ▼'}
                  </span>
                </button>

                {showTechDetails && (
                  <div className="p-3.5 border-t border-[var(--md-sys-color-outline-variant)] space-y-2 text-[11px] font-mono text-[var(--md-sys-color-on-surface-variant)] bg-[var(--md-sys-color-surface-container)]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <span className="text-[var(--md-sys-color-on-surface)] font-bold">Aba: </span>
                        <span>{technicalContext.activeTab}</span>
                      </div>
                      <div>
                        <span className="text-[var(--md-sys-color-on-surface)] font-bold">Molécula ID: </span>
                        <span>{technicalContext.moleculeId || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[var(--md-sys-color-on-surface)] font-bold">IUPAC Esperado: </span>
                        <span className="text-[var(--md-sys-color-primary)]">{technicalContext.iupacName || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[var(--md-sys-color-on-surface)] font-bold">Fórmula: </span>
                        <span>{technicalContext.formula || 'N/A'}</span>
                      </div>
                      <div className="col-span-1 sm:col-span-2">
                        <span className="text-[var(--md-sys-color-on-surface)] font-bold">SMILES: </span>
                        <span className="select-all break-all">{technicalContext.smiles || 'N/A'}</span>
                      </div>
                      {technicalContext.userInput && (
                        <div className="col-span-1 sm:col-span-2">
                          <span className="text-[var(--md-sys-color-on-surface)] font-bold">Entrada digitada: </span>
                          <span className="text-[var(--md-sys-color-error)]">{technicalContext.userInput}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-[var(--md-sys-color-outline-variant)]">
                <button
                  type="button"
                  onClick={closeBugReportModal}
                  className="px-4 py-2.5 rounded-xl hover:bg-[var(--md-sys-color-surface-container-highest)] text-xs font-bold text-[var(--md-sys-color-on-surface-variant)] transition-all cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || description.trim().length < 8}
                  className="px-6 py-2.5 rounded-xl bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Salvando relatório...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Enviar Relatório</span>
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
