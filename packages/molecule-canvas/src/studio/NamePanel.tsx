import React, { useCallback, useState } from 'react';
import { Copy, Check, AlertTriangle, Lightbulb, ChevronDown, Send, Tag } from 'lucide-react';
import {
  FUNCTION_GUIDE,
  functionLabelPtBR,
  type MolecularGraphAnalysis,
  type OrganicFunction,
} from '@quimicarush/chemistry-core';
import { Balloon } from './Balloon.js';

export interface NamePanelProps {
  analysis: MolecularGraphAnalysis;
  onHide: () => void;
  /** Present only where there is an Arcade to send the molecule to. */
  onSendToArcade?: () => void;
}

/**
 * The live readout: what the structure on the canvas is called, and why.
 */
export const NamePanel: React.FC<NamePanelProps> = ({ analysis, onHide, onSendToArcade }) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [showSteps, setShowSteps] = useState(false);

  const copy = useCallback((value: string, field: string) => {
    if (typeof navigator === 'undefined' || !navigator.clipboard || !value) return;
    navigator.clipboard.writeText(value).then(() => {
      setCopied(field);
      setTimeout(() => setCopied(null), 1400);
    });
  }, []);

  const functions: OrganicFunction[] = analysis.isNameable
    ? [analysis.primaryFunction, ...analysis.secondaryFunctions]
    : [];

  return (
    <Balloon
      title="Nomenclatura"
      icon={<Tag className="w-4 h-4" />}
      initialPosition={{ top: 88, right: 16 }}
      onHide={onHide}
      hideKey="I"
    >
      {analysis.problems.map((problem, index) => (
        <p
          key={`${problem.code}-${index}`}
          className="flex items-start gap-2 text-[12px] leading-snug px-2.5 py-2 rounded-xl bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]"
        >
          <AlertTriangle className="w-4 h-4 shrink-0 mt-px" />
          {problem.message}
        </p>
      ))}

      {!analysis.isNameable && analysis.problems.length === 0 && (
        <p className="text-[12px] text-[var(--md-sys-color-on-surface-variant)]">
          Desenhe uma estrutura no canvas — o nome aparece aqui a cada traço.
        </p>
      )}

      {analysis.isNameable && (
        <>
          <button
            type="button"
            onClick={() => copy(analysis.iupacName2013, 'name')}
            title="Copiar nome"
            className="text-left"
          >
            <h1 className="text-xl font-bold leading-tight break-words text-[var(--md-sys-color-primary)]">
              {analysis.iupacName2013}
              {copied === 'name' && <Check className="inline w-4 h-4 ml-1.5" />}
            </h1>
          </button>

          {analysis.iupacName1993 !== analysis.iupacName2013 && (
            <p className="text-[11px] font-mono text-[var(--md-sys-color-on-surface-variant)]">
              1993: <strong>{analysis.iupacName1993}</strong>
            </p>
          )}

          <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-mono">
            <span className="m3-chip py-0.5 px-2">
              <strong>{analysis.formula}</strong>
            </span>
            <button
              type="button"
              onClick={() => copy(analysis.smiles, 'smiles')}
              className="m3-chip py-0.5 px-2 gap-1"
              title="Copiar SMILES"
            >
              {copied === 'smiles' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span className="truncate max-w-[170px]">{analysis.smiles}</span>
            </button>
            <span className="m3-chip py-0.5 px-2">
              {analysis.parentType === 'ring' ? 'anel' : 'cadeia'} · {analysis.parentSize} C
            </span>
          </div>

          {functions.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {functions.map((fn, index) => (
                <span
                  key={fn}
                  title={`${FUNCTION_GUIDE[fn].recognition} — sufixo ${FUNCTION_GUIDE[fn].suffix}`}
                  className={`m3-chip py-0.5 px-2 text-[11px] font-semibold gap-1 ${
                    index === 0
                      ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border-[var(--md-sys-color-primary)]'
                      : ''
                  }`}
                >
                  {functionLabelPtBR(fn)}
                  <span className="font-mono opacity-60">{FUNCTION_GUIDE[fn].suffix}</span>
                </span>
              ))}
            </div>
          )}

          {analysis.steps.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => setShowSteps(value => !value)}
                className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--md-sys-color-tertiary)] hover:underline self-start"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                Por que esse nome?
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${showSteps ? 'rotate-180' : ''}`}
                />
              </button>

              {showSteps && (
                <ol className="flex flex-col gap-2">
                  {analysis.steps.map(step => (
                    <li
                      key={step.title}
                      className="pl-2.5 border-l-2 border-[var(--md-sys-color-primary)]/40 flex flex-col gap-0.5"
                    >
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--md-sys-color-primary)]">
                        {step.title}
                      </span>
                      <span className="text-[12px] leading-snug text-[var(--md-sys-color-on-surface-variant)]">
                        {step.detail}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </>
          )}

          {onSendToArcade && (
            <button
              type="button"
              onClick={onSendToArcade}
              className="m3-chip py-1.5 px-3 text-[11px] font-bold gap-1.5 bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] self-start"
            >
              <Send className="w-3.5 h-3.5" />
              Treinar esta molécula no Arcade
            </button>
          )}
        </>
      )}
    </Balloon>
  );
};
