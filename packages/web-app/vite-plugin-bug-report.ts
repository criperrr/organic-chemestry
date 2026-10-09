import type { Plugin } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

export interface BugReportData {
  id: string;
  timestamp: number;
  dateIso: string;
  dateFormatted: string;
  category: string;
  title: string;
  description: string;
  expectedBehavior?: string;
  screenshotBase64?: string;
  context: {
    activeTab: string;
    moleculeId?: string;
    smiles?: string;
    iupacName?: string;
    formula?: string;
    userInput?: string;
    difficulty?: string;
    score?: number;
    userAgent: string;
    screenResolution: string;
    url: string;
  };
}

export function bugReportPlugin(): Plugin {
  return {
    name: 'quimicarush-bug-report-plugin',
    configureServer(server) {
      const reportsDir = path.resolve(__dirname, '../../reports');
      const screenshotsDir = path.join(reportsDir, 'screenshots');

      // Ensure directories exist
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }
      if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
      }

      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0];

        // 1. GET /api/bug-reports — List existing reports
        if (url === '/api/bug-reports' && req.method === 'GET') {
          try {
            const files = fs.readdirSync(reportsDir);
            const jsonFiles = files.filter(f => f.startsWith('bug-') && f.endsWith('.json'));
            const reports = jsonFiles
              .map(file => {
                try {
                  const content = fs.readFileSync(path.join(reportsDir, file), 'utf-8');
                  return JSON.parse(content);
                } catch {
                  return null;
                }
              })
              .filter(Boolean)
              .sort((a, b) => b.timestamp - a.timestamp);

            res.writeHead(200, {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            });
            res.end(JSON.stringify({ success: true, count: reports.length, reports }));
            return;
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: String(err) }));
            return;
          }
        }

        // 2. POST /api/bug-report — Save new bug report
        if (url === '/api/bug-report' && req.method === 'POST') {
          const chunks: Buffer[] = [];

          req.on('data', chunk => {
            chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
          });

          req.on('end', () => {
            try {
              const bodyStr = Buffer.concat(chunks).toString('utf-8');
              const data = JSON.parse(bodyStr) as BugReportData;

              const reportId = data.id || `bug-${Date.now()}`;
              const mdFilename = `${reportId}.md`;
              const jsonFilename = `${reportId}.json`;
              const mdPath = path.join(reportsDir, mdFilename);
              const jsonPath = path.join(reportsDir, jsonFilename);

              let screenshotMarkdown = '*Nenhum print anexado pelo usuário.*';
              let screenshotRelativePath = '';

              // Process screenshot if present
              if (data.screenshotBase64 && data.screenshotBase64.includes(',')) {
                try {
                  const parts = data.screenshotBase64.split(',');
                  const mimeMatch = parts[0].match(/:(.*?);/);
                  const mime = mimeMatch ? mimeMatch[1] : 'image/png';
                  const ext = mime.includes('jpeg') || mime.includes('jpg') ? 'jpg' : mime.includes('webp') ? 'webp' : 'png';
                  const imageFilename = `${reportId}.${ext}`;
                  const imagePath = path.join(screenshotsDir, imageFilename);

                  const imageBuffer = Buffer.from(parts[1], 'base64');
                  fs.writeFileSync(imagePath, imageBuffer);
                  screenshotRelativePath = `./screenshots/${imageFilename}`;
                  screenshotMarkdown = `![Print do Erro](${screenshotRelativePath})`;
                } catch (imgErr) {
                  console.error('[BugReportPlugin] Erro ao salvar imagem:', imgErr);
                  screenshotMarkdown = '*Erro ao processar imagem enviada.*';
                }
              }

              // Create clean Markdown documentation
              const mdContent = `# Relatório de Erro: [${data.category.toUpperCase()}] ${data.title}

- **ID do Relatório:** \`${reportId}\`
- **Data e Hora:** ${data.dateFormatted} (${data.dateIso})
- **Status:** 🔴 Aberto (Pendente de análise e correção)
- **Categoria:** \`${data.category}\`

---

## 1. O que aconteceu de errado? (Relato do Usuário)
${data.description}

## 2. O que era esperado acontecer?
${data.expectedBehavior?.trim() ? data.expectedBehavior : '*Não especificado.*'}

## 3. Captura de Tela (Print)
${screenshotMarkdown}

## 4. Diagnóstico Técnico Autocapturado
| Parâmetro | Valor Registrado |
|---|---|
| **Aba Ativa** | \`${data.context.activeTab}\` |
| **ID da Molécula** | \`${data.context.moleculeId || 'N/A'}\` |
| **Nome IUPAC Canônico Esperado** | \`${data.context.iupacName || 'N/A'}\` |
| **Fórmula Molecular** | \`${data.context.formula || 'N/A'}\` |
| **Estrutura SMILES** | \`${data.context.smiles || 'N/A'}\` |
| **Resposta Digitada pelo Usuário** | \`${data.context.userInput || 'N/A'}\` |
| **Dificuldade** | \`${data.context.difficulty || 'N/A'}\` |
| **Pontuação Obtida** | ${data.context.score !== undefined ? `${Math.round(data.context.score * 100)}%` : 'N/A'} |
| **Resolução da Tela** | \`${data.context.screenResolution}\` |
| **Navegador / SO** | \`${data.context.userAgent}\` |
| **URL** | \`${data.context.url}\` |

---
*Gerado automaticamente pelo QuímicaRush Bug Reporter.*
`;

              fs.writeFileSync(mdPath, mdContent, 'utf-8');

              // Save raw JSON without the huge base64 string to keep disk light,
              // but include screenshot relative path
              const cleanData = {
                ...data,
                screenshotFile: screenshotRelativePath || undefined,
                screenshotBase64: undefined, // omitted from json to save disk space
              };
              fs.writeFileSync(jsonPath, JSON.stringify(cleanData, null, 2), 'utf-8');

              // Update INDEX.md
              updateIndexFile(reportsDir);

              res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              });
              res.end(
                JSON.stringify({
                  success: true,
                  id: reportId,
                  filePath: `reports/${mdFilename}`,
                  hasScreenshot: !!screenshotRelativePath,
                })
              );
            } catch (parseErr) {
              console.error('[BugReportPlugin] Erro ao processar relatório:', parseErr);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: String(parseErr) }));
            }
          });

          return;
        }

        // Handle CORS preflight
        if (req.method === 'OPTIONS' && (url === '/api/bug-report' || url === '/api/bug-reports')) {
          res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          });
          res.end();
          return;
        }

        next();
      });
    },
  };
}

function updateIndexFile(reportsDir: string): void {
  try {
    const files = fs.readdirSync(reportsDir);
    const jsonFiles = files.filter(f => f.startsWith('bug-') && f.endsWith('.json'));

    const reports: (BugReportData & { screenshotFile?: string })[] = [];
    for (const f of jsonFiles) {
      try {
        const str = fs.readFileSync(path.join(reportsDir, f), 'utf-8');
        reports.push(JSON.parse(str));
      } catch {
        // ignore broken json
      }
    }

    reports.sort((a, b) => b.timestamp - a.timestamp);

    let indexMd = `# Central de Erros Reportados — QuímicaRush

Total de relatórios registrados: **${reports.length}**

| Status | ID | Data | Categoria | Descrição | Print | Arquivo |
|:---:|---|---|---|---|:---:|---|
`;

    if (reports.length === 0) {
      indexMd += `| - | *Nenhum relatório* | - | - | - | - | - |\n`;
    } else {
      for (const r of reports) {
        const shortDesc = (r.description || '').replace(/\r?\n/g, ' ').slice(0, 50) + (r.description?.length > 50 ? '...' : '');
        const hasPrint = r.screenshotFile ? '📸 Sim' : '❌ Não';
        const mdLink = `[Ver Detalhes](./${r.id}.md)`;
        indexMd += `| 🔴 Aberto | \`${r.id}\` | ${r.dateFormatted} | \`${r.category}\` | ${shortDesc} | ${hasPrint} | ${mdLink} |\n`;
      }
    }

    indexMd += `\n---\n*Atualizado automaticamente a cada novo reporte.* \n`;

    fs.writeFileSync(path.join(reportsDir, 'INDEX.md'), indexMd, 'utf-8');
  } catch (err) {
    console.error('[BugReportPlugin] Erro ao atualizar INDEX.md:', err);
  }
}
