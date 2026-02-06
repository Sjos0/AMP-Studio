/**
 * Algoritmo de Chunking de Markdown
 * Sistema de Memória Persistente - AMP Studio
 * Baseado no OpenClaw memory/chunking.ts
 * 
 * Chunking com janela deslizante e overlap para preservar contexto
 */

import crypto from 'crypto';
import { MEMORY_CONSTANTS } from '@/types';

/**
 * Chunk de conteúdo com metadados
 */
export interface Chunk {
  id: string;
  content: string;
  startLine: number;
  endLine: number;
  hash: string;
  index: number;
}

/**
 * Configuração de chunking
 */
export interface ChunkingConfig {
  targetTokens: number;  // ~400 tokens por padrão
  overlapTokens: number; // ~80 tokens de overlap
}

/**
 * Configuração padrão (equivalente ao OpenClaw)
 */
const DEFAULT_CHUNKING_CONFIG: ChunkingConfig = {
  targetTokens: MEMORY_CONSTANTS.TARGET_CHUNK_TOKENS, // 400
  overlapTokens: MEMORY_CONSTANTS.CHUNK_OVERLAP_TOKENS, // 80
};

/**
 * Estima o número de tokens para um texto
 * Aproximação: 4 caracteres ≈ 1 token para texto em inglês/português
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Gera hash SHA-256 do conteúdo
 * Usado para cache e deduplicação de chunks
 */
export function generateChunkHash(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Divide o conteúdo em linhas preservando estrutura
 */
function splitIntoLines(content: string): Array<{ text: string; lineNo: number }> {
  const lines = content.split('\n');
  return lines.map((text, index) => ({
    text,
    lineNo: index + 1, // Linhas começam em 1
  }));
}

/**
 * Converte linhas de volta para texto
 */
function linesToText(lines: Array<{ text: string; lineNo: number }>): string {
  return lines.map(l => l.text).join('\n');
}

/**
 * Algoritmo principal de chunking com sliding window e overlap
 * 
 * Baseado no OpenClaw:
 * - Target: ~400 tokens por chunk
 * - Overlap: ~80 tokens para preservar contexto entre chunks
 * - Preserva limites de linha para citação precisa
 */
export function chunkMarkdown(
  content: string,
  config: ChunkingConfig = DEFAULT_CHUNKING_CONFIG
): Chunk[] {
  const lines = splitIntoLines(content);
  
  if (lines.length === 0) {
    return [];
  }

  // Conversão de tokens para caracteres (aproximação)
  const maxChars = Math.max(32, config.targetTokens * 4);
  const overlapChars = Math.max(0, config.overlapTokens * 4);

  const chunks: Chunk[] = [];
  const currentLines: Array<{ text: string; lineNo: number }> = [];
  let currentChars = 0;
  let chunkIndex = 0;

  // Função para calcular overlap do início do chunk anterior
  const carryOverlap = (): Array<{ text: string; lineNo: number }> => {
    if (overlapChars <= 0 || currentLines.length === 0) {
      return [];
    }

    let acc = 0;
    const kept: Array<{ text: string; lineNo: number }> = [];

    // Começa do final e vai para o início
    for (let i = currentLines.length - 1; i >= 0; i--) {
      const entry = currentLines[i];
      if (!entry) continue;

      acc += entry.text.length + 1; // +1 para newline
      kept.unshift(entry);

      if (acc >= overlapChars) break;
    }

    return kept;
  };

  // Processa linhas com sliding window
  for (const line of lines) {
    // Se adicionar esta linha exceder o limite, cria um chunk
    if (currentChars + line.text.length + 1 > maxChars && currentLines.length > 0) {
      // Cria chunk atual
      const chunkContent = linesToText(currentLines);
      const startLine = currentLines[0].lineNo;
      const endLine = currentLines[currentLines.length - 1].lineNo;

      chunks.push({
        id: `${startLine}-${endLine}`,
        content: chunkContent,
        startLine,
        endLine,
        hash: generateChunkHash(chunkContent),
        index: chunkIndex,
      });

      chunkIndex++;

      // Prepara overlap para o próximo chunk
      const overlap = carryOverlap();
      
      // Inicia próximo chunk com overlap
      currentLines.length = 0;
      overlap.forEach(entry => currentLines.push(entry));
      currentChars = overlap.reduce((sum, entry) => sum + entry.text.length + 1, 0);
    }

    currentLines.push(line);
    currentChars += line.text.length + 1; // +1 para newline
  }

  // Cria chunk final se houver conteúdo restantes
  if (currentLines.length > 0) {
    const chunkContent = linesToText(currentLines);
    const startLine = currentLines[0].lineNo;
    const endLine = currentLines[currentLines.length - 1].lineNo;

    chunks.push({
      id: `${startLine}-${endLine}`,
      content: chunkContent,
      startLine,
      endLine,
      hash: generateChunkHash(chunkContent),
      index: chunkIndex,
    });
  }

  return chunks;
}

/**
 * Chunking simples (sem overlap) para texto não estruturado
 */
export function chunkSimpleText(
  content: string,
  targetTokens: number = DEFAULT_CHUNKING_CONFIG.targetTokens
): Chunk[] {
  const maxChars = targetTokens * 4;
  const chunks: Chunk[] = [];
  let chunkIndex = 0;

  let start = 0;
  while (start < content.length) {
    const end = Math.min(start + maxChars, content.length);
    const chunkContent = content.slice(start, end);

    chunks.push({
      id: `chunk-${chunkIndex}`,
      content: chunkContent,
      startLine: start,
      endLine: end,
      hash: generateChunkHash(chunkContent),
      index: chunkIndex,
    });

    chunkIndex++;
    start = end;
  }

  return chunks;
}

/**
 * Verifica se dois chunks são idênticos pelo hash
 */
export function areChunksEqual(chunk1: Chunk, chunk2: Chunk): boolean {
  return chunk1.hash === chunk2.hash;
}

/**
 * Filtra chunks novos (não existentes em uma lista de hashes)
 */
export function filterNewChunks(
  chunks: Chunk[],
  existingHashes: Set<string>
): Chunk[] {
  return chunks.filter(chunk => !existingHashes.has(chunk.hash));
}

/**
 * Estatísticas de chunking
 */
export interface ChunkingStats {
  totalChunks: number;
  totalChars: number;
  avgChunkSize: number;
  overlapUsed: boolean;
}

export function getChunkingStats(
  originalContent: string,
  chunks: Chunk[]
): ChunkingStats {
  const totalChars = chunks.reduce((sum, c) => sum + c.content.length, 0);
  
  return {
    totalChunks: chunks.length,
    totalChars,
    avgChunkSize: chunks.length > 0 ? totalChars / chunks.length : 0,
    overlapUsed: chunks.length > 1,
  };
}
