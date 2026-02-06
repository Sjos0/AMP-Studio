#!/usr/bin/env python3
"""
Analisador de Contexto para Context Engineering

Este script analisa o contexto atual do projeto,
identificando padrões, dependências e oportunidades de otimização.
"""

import json
import os
import re
from collections import defaultdict
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


@dataclass
class AnaliseProjeto:
    """Resultado da análise de um projeto."""
    nome: str
    caminho: Path
    arquivos_encontrados: int = 0
    linhas_totais: int = 0
    complexidade: float = 0.0
    acoplamento: float = 0.0
    coesao: float = 0.0
    problemas: list = field(default_factory=list)
    sugestoes: list = field(default_factory=list)


@dataclass
class ResultadoAnalise:
    """Resultado geral da análise."""
    projetos: list[AnaliseProjeto]
    metricas_globais: dict[str, Any]
    recomendacoes: list[str]


class ContextAnalyzer:
    """
    Analisador de contexto que examina:
    - Estrutura de arquivos
    - Dependências
    - Padrões de código
    - Acoplamento e coesão
    - Oportunidades de refatoração
    """

    # Extensões suportadas
    EXTENSOES_CODIGO = {
        '.py', '.js', '.ts', '.tsx', '.jsx', '.java',
        '.cpp', '.c', '.h', '.cs', '.go', '.rs', '.rb'
    }

    # Tamanhos recomendados
    TAMANHO_MAXIMO_ARQUIVO = 300  # linhas
    TAMANHO_MAXIMO_FUNCAO = 50    # linhas
    TAMANHO_MAXIMO_CLASSE = 200   # linhas

    def __init__(self, caminho_projeto: str):
        self.caminho_projeto = Path(caminho_projeto)
        self.resultados: list[AnaliseProjeto] = []
        self.dependencias: dict[str, set[str]] = defaultdict(set)
        self.importacoes: list[dict] = []

    def analisar(self) -> ResultadoAnalise:
        """Executa a análise completa."""
        self.resultados = []
        self.dependencias = defaultdict(set)
        self.importacoes = []

        # Encontrar todos os projetos/diretórios
        self._encontrar_projetos()

        # Analisar cada projeto
        for projeto in self.resultados:
            self._analisar_projeto(projeto)

        # Calcular dependências globais
        self._calcular_dependencias()

        return ResultadoAnalise(
            projetos=self.resultados,
            metricas_globais=self._calcular_metricas_globais(),
            recomendacoes=self._gerar_recomendacoes()
        )

    def _encontrar_projetos(self) -> None:
        """Encontra todos os projetos no diretório."""
        # Verificar se é um projeto direto
        if self._eh_codigo_fonte(self.caminho_projeto):
            self.resultados.append(AnaliseProjeto(
                nome=self.caminho_projeto.name,
                caminho=self.caminho_projeto
            ))
            return

        # Buscar por projetos
        for item in self.caminho_projeto.iterdir():
            if item.is_dir():
                if self._tem_estrutura_projeto(item):
                    self.resultados.append(AnaliseProjeto(
                        nome=item.name,
                        caminho=item
                    ))

    def _eh_codigo_fonte(self, caminho: Path) -> bool:
        """Verifica se o caminho contém código fonte."""
        return any(
            caminho.suffix in self.EXTENSOES_CODIGO
            for caminho in caminho.rglob('*')
        )

    def _tem_estrutura_projeto(self, caminho: Path) -> bool:
        """Verifica se o diretório tem estrutura de projeto."""
        indicadores = [
            'package.json',
            'requirements.txt',
            'pyproject.toml',
            'go.mod',
            'Cargo.toml',
            'pom.xml',
            'build.gradle',
            'src',
            '.git',
        ]

        for indicador in indicadores:
            if (caminho / indicador).exists():
                return True

        # Verificar se tem arquivos de código
        arquivos_codigo = list(caminho.rglob('*'))[:10]
        return any(
            f.suffix in self.EXTENSOES_CODIGO
            for f in arquivos_codigo
            if f.is_file()
        )

    def _analisar_projeto(self, projeto: AnaliseProjeto) -> None:
        """Analisa um projeto específico."""
        arquivos_encontrados = 0
        linhas_totais = 0
        problemas_encontrados = []
        funcoes_por_arquivo = []

        # Encontrar todos os arquivos de código
        for arquivo in projeto.caminho.rglob('*'):
            if arquivo.is_file() and arquivo.suffix in self.EXTENSOES_CODIGO:
                arquivos_encontrados += 1
                linhas = self._contar_linhas(arquivo)
                linhas_totais += linhas

                # Analisar arquivo
                problemas = self._analisar_arquivo(arquivo)
                problemas_encontrados.extend(problemas)

                # Extrair funções
                funcoes = self._extrair_funcoes(arquivo)
                funcoes_por_arquivo.extend([
                    {'arquivo': arquivo, 'funcao': f}
                    for f in funcoes
                ])

        projeto.arquivos_encontrados = arquivos_encontrados
        projeto.linhas_totais = linhas_totais
        projeto.problemas = problemas_encontrados

        # Calcular complexidade
        projeto.complexidade = self._calcular_complexidade(
            arquivos_encontrados,
            linhas_totais,
            funcoes_por_arquivo
        )

        # Calcular acoplamento
        projeto.acoplamento = self._calcular_acoplamento(projeto)

        # Gerar sugestões
        projeto.sugestoes = self._gerar_sugestoes_projeto(projeto)

    def _contar_linhas(self, arquivo: Path) -> int:
        """Conta o número de linhas de um arquivo."""
        try:
            with open(arquivo, 'r', encoding='utf-8', errors='ignore') as f:
                return sum(1 for _ in f)
        except Exception:
            return 0

    def _analisar_arquivo(self, arquivo: Path) -> list[dict]:
        """Analisa um arquivo individual."""
        problemas = []

        try:
            with open(arquivo, 'r', encoding='utf-8', errors='ignore') as f:
                conteudo = f.read()
                linhas = conteudo.split('\n')
        except Exception:
            return problemas

        # Verificar tamanho
        if len(linhas) > self.TAMANHO_MAXIMO_ARQUIVO:
            problemas.append({
                'tipo': 'arquivo_grande',
                'arquivo': str(arquivo),
                'mensagem': f"Arquivo com {len(linhas)} linhas (máximo: {self.TAMANHO_MAXIMO_ARQUIVO})",
                'severidade': 'warning'
            })

        # Verificar indentação
        indentacao_inconsistente = self._verificar_indentacao(linhas)
        if indentacao_inconsistente:
            problemas.append({
                'tipo': 'indentacao',
                'arquivo': str(arquivo),
                'mensagem': 'Indentação inconsistente detectada',
                'severidade': 'info'
            })

        # Verificar linhas muito longas
        linhas_longas = [
            i + 1 for i, linha in enumerate(linhas)
            if len(linha) > 120
        ]
        if len(linhas_longas) > 5:
            problemas.append({
                'tipo': 'linhas_longas',
                'arquivo': str(arquivo),
                'mensagem': f"{len(linhas_longas)} linhas excedem 120 caracteres",
                'severidade': 'info'
            })

        # Extrair imports
        imports_encontrados = self._extrair_imports(conteudo, arquivo)
        self.importacoes.extend(imports_encontrados)

        for imp in imports_encontrados:
            self.dependencias[str(arquivo)].add(imp['modulo'])

        return problemas

    def _verificar_indentacao(self, linhas: list[str]) -> bool:
        """Verifica se a indentação é consistente."""
        espacos = 0
        tabs = 0

        for linha in linhas:
            if linha.strip().startswith('    '):
                espacos += 1
            elif linha.strip().startswith('\t'):
                tabs += 1

        return espacos > 0 and tabs > 0

    def _extrair_imports(self, conteudo: str, arquivo: Path) -> list[dict]:
        """Extrai imports de um arquivo."""
        imports = []

        # Python imports
        for match in re.finditer(r'^(?:from|import)\s+([\w.]+)', conteudo, re.MULTILINE):
            imports.append({
                'modulo': match.group(1),
                'arquivo': str(arquivo),
                'tipo': 'python'
            })

        # JavaScript/TypeScript imports
        for match in re.finditer(
            r'(?:import|from)\s+[\'"]([^\'"]+)[\'"]',
            conteudo
        ):
            imports.append({
                'modulo': match.group(1),
                'arquivo': str(arquivo),
                'tipo': 'js'
            })

        # Java imports
        for match in re.finditer(r'import\s+([\w.]+);', conteudo):
            imports.append({
                'modulo': match.group(1),
                'arquivo': str(arquivo),
                'tipo': 'java'
            })

        return imports

    def _extrair_funcoes(self, arquivo: Path) -> list[dict]:
        """Extrai funções de um arquivo."""
        funcoes = []

        try:
            with open(arquivo, 'r', encoding='utf-8', errors='ignore') as f:
                conteudo = f.read()
        except Exception:
            return funcoes

        # Python funções
        for match in re.finditer(
            r'^def\s+(\w+)\s*\([^)]*\)\s*(?:->\s*[\w\[\]]+)?\s*:\s*(?:#[^\n]*)?',
            conteudo,
            re.MULTILINE
        ):
            funcoes.append({
                'nome': match.group(1),
                'tipo': 'python'
            })

        # JavaScript/TypeScript funções
        for match in re.finditer(
            r'(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s*)?function|\s*(\w+)\s*\([^)]*\)\s*(?:=>|{))',
            conteudo
        ):
            nome = match.group(1) or match.group(2) or match.group(3)
            funcoes.append({
                'nome': nome,
                'tipo': 'js'
            })

        return funcoes

    def _calcular_complexidade(
        self,
        arquivos: int,
        linhas: int,
        funcoes: list
    ) -> float:
        """Calcula uma métrica de complexidade."""
        if arquivos == 0:
            return 0.0

        # Fatores de complexidade
        densidade_funcoes = len(funcoes) / arquivos if arquivos > 0 else 0
        tamanho_medio_arquivo = linhas / arquivos if arquivos > 0 else 0

        # Normalizar (valores típicos: 0-100)
        complexidade = (
            densidade_funcoes * 30 +
            min(tamanho_medio_arquivo / 100, 1) * 40 +
            30  # Base
        )

        return min(100, complexidade)

    def _calcular_acoplamento(self, projeto: AnaliseProjeto) -> float:
        """Calcula o acoplamento do projeto."""
        if not self.dependencias:
            return 0.0

        total_arquivos = len([
            f for f in projeto.caminho.rglob('*')
            if f.is_file() and f.suffix in self.EXTENSOES_CODIGO
        ])

        # Acoplamento = conexões / possíveis conexões
        conexoes = sum(len(v) for v in self.dependencias.values())

        if total_arquivos <= 1:
            return 0.0

        possiveis = total_arquivos * (total_arquivos - 1) / 2

        return min(100, (conexoes / possiveis) * 100) if possiveis > 0 else 0

    def _calcular_dependencias(self) -> None:
        """Calcula métricas de dependências globais."""
        for arquivo, deps in self.dependencias.items():
            self.dependencias[arquivo] = set(d.split('.')[0] for d in deps)

    def _calcular_metricas_globais(self) -> dict[str, Any]:
        """Calcula métricas globais da análise."""
        total_arquivos = sum(p.arquivos_encontrados for p in self.resultados)
        total_linhas = sum(p.linhas_totais for p in self.resultados)
        complexidade_media = (
            sum(p.complexidade for p in self.resultados) / len(self.resultados)
            if self.resultados else 0
        )
        acoplamento_medio = (
            sum(p.acoplamento for p in self.resultados) / len(self.resultados)
            if self.resultados else 0
        )

        return {
            'total_arquivos': total_arquivos,
            'total_linhas': total_linhas,
            'numero_projetos': len(self.resultados),
            'complexidade_media': round(complexidade_media, 2),
            'acoplamento_medio': round(acoplamento_medio, 2),
            'arquivos_mais_dependentes': self._encontrar_arquivos_centralizados(),
        }

    def _encontrar_arquivos_centralizados(self) -> list[dict]:
        """Encontra arquivos que são muito dependidos."""
        contador = defaultdict(int)

        for arquivo, deps in self.dependencias.items():
            for dep in deps:
                contador[dep] += 1

        return [
            {'modulo': k, 'dependencias': v}
            for k, v in sorted(contador.items(), key=lambda x: -x[1])[:5]
        ]

    def _gerar_sugestoes_projeto(self, projeto: AnaliseProjeto) -> list[str]:
        """Gera sugestões para um projeto específico."""
        sugestoes = []

        # Verificar acoplamento
        if projeto.acoplamento > 50:
            sugestoes.append(
                f"⚠️ Acoplamento alto ({projeto.acoplamento:.1f}%). "
                "Considere usar abstrações e interfaces."
            )

        # Verificar complexidade
        if projeto.complexidade > 70:
            sugestoes.append(
                f"📊 Complexidade elevada ({projeto.complexidade:.1f}). "
                "Revise a arquitetura do projeto."
            )

        # Verificar tamanho médio
        if projeto.linhas_totais > 0:
            tamanho_medio = projeto.linhas_totais / max(1, projeto.arquivos_encontrados)
            if tamanho_medio > self.TAMANHO_MAXIMO_ARQUIVO:
                sugestoes.append(
                    f"📏 Tamanho médio de arquivo alto ({tamanho_medio:.0f} linhas). "
                    "Considere decompor em módulos menores."
                )

        # Verificar arquivos grandes
        arquivos_grandes = [
            p['arquivo'] for p in projeto.problemas
            if p.get('tipo') == 'arquivo_grande'
        ]
        if len(arquivos_grandes) > 0:
            sugestoes.append(
                f"📄 {len(arquivos_grandes)} arquivos excedem o limite de linhas. "
                "Revise: " + ", ".join(arquivos_grandes[:3])
            )

        return sugestoes

    def _gerar_recomendacoes(self) -> list[str]:
        """Gera recomendações gerais."""
        recomendacoes = []

        # Analisar dependências
        mods_mais_usados = self._encontrar_arquivos_centralizados()
        if mods_mais_usados and mods_mais_usados[0]['dependencias'] > 10:
            recomendacoes.append(
                f"🔗 Módulo '{mods_mais_usados[0]['modulo']}' é muito dependido. "
                "Considere criar uma camada de abstração."
            )

        # Verificar padrões
        padroes_encontrados = self._identificar_padroes()
        if 'mono' in padroes_encontrados:
            recomendacoes.append(
                "📁 Detectada estrutura monolítica. "
                "Considere separar em módulos independentes."
            )
        if 'distributed' in padroes_encontrados:
            recomendacoes.append(
                "🔀 Estrutura distribuída detectada. "
                "Certifique-se de que as dependências estão claras."
            )

        # Verificar organização
        organizacao = self._avaliar_organizacao()
        if organizacao['score'] < 50:
            recomendacoes.append(
                f"📋 Organização precisa melhorar (score: {organizacao['score']}). "
                f"Sugestões: {', '.join(organizacao['sugestoes'])}"
            )

        return recomendacoes

    def _identificar_padroes(self) -> list[str]:
        """Identifica padrões arquiteturais."""
        padroes = []

        # Verificar estrutura monolítica
        dirs = [d.name for d in self.caminho_projeto.iterdir() if d.is_dir()]
        if len(dirs) < 5 and any(
            (self.caminho_projeto / d).is_file()
            for d in ['index.ts', 'index.js', 'main.py']
        ):
            padroes.append('mono')

        # Verificar estrutura distribuída
        if any(d in dirs for d in ['services', 'components', 'utils', 'hooks']):
            padroes.append('distributed')

        return padroes

    def _avaliar_organizacao(self) -> dict[str, Any]:
        """Avalia a organização do projeto."""
        score = 100
        sugestoes = []

        # Verificar estrutura de diretórios
        estrutura = self.caminho_projeto / 'src'
        if not estrutura.exists():
            score -= 20
            sugestoes.append("Criar diretório 'src' para código fonte")

        # Verificar estrutura de componentes
        componentes = self.caminho_projeto / 'src' / 'components'
        if not componentes.exists():
            score -= 10
            sugestoes.append("Criar diretório 'src/components' para componentes")

        # Verificar testes
        testes_encontrados = list(self.caminho_projeto.rglob('*test*')) + \
                            list(self.caminho_projeto.rglob('*spec*'))
        if len(testes_encontrados) == 0:
            score -= 20
            sugestoes.append("Adicionar testes unitários")

        # Verificar documentação
        docs = list(self.caminho_projeto.glob('README*'))
        if len(docs) == 0:
            score -= 10
            sugestoes.append("Adicionar arquivo README.md")

        return {
            'score': max(0, score),
            'sugestoes': sugestoes
        }


def formatar_relatorio(resultado: ResultadoAnalise) -> str:
    """Formata o resultado em um relatório legível."""
    linhas = []

    linhas.append("=" * 70)
    linhas.append("RELATÓRIO DE ANÁLISE DE CONTEXTO")
    linhas.append("=" * 70)
    linhas.append("")

    # Métricas globais
    m = resultado.metricas_globais
    linhas.append("📊 MÉTRICAS GLOBAIS")
    linhas.append("-" * 40)
    linhas.append(f"  Total de arquivos: {m['total_arquivos']}")
    linhas.append(f"  Total de linhas: {m['total_linhas']}")
    linhas.append(f"  Complexidade média: {m['complexidade_media']:.1f}%")
    linhas.append(f"  Acoplamento médio: {m['acoplamento_medio']:.1f}%")
    linhas.append("")

    # Por projeto
    linhas.append("📁 ANÁLISE POR PROJETO")
    linhas.append("-" * 40)

    for projeto in resultado.projetos:
        linhas.append(f"\n  📂 {projeto.nome}")
        linhas.append(f"     Arquivos: {projeto.arquivos_encontrados}")
        linhas.append(f"     Linhas: {projeto.linhas_totais}")
        linhas.append(f"     Complexidade: {projeto.complexidade:.1f}%")
        linhas.append(f"     Acoplamento: {projeto.acoplamento:.1f}%")

        if projeto.sugestoes:
            linhas.append("     💡 Sugestões:")
            for sugestao in projeto.sugestoes:
                linhas.append(f"        • {sugestao}")

        if projeto.problemas:
            linhas.append(f"     ⚠️ Problemas encontrados: {len(projeto.problemas)}")

    # Recomendações
    linhas.append("\n" + "=" * 70)
    linhas.append("💡 RECOMENDAÇÕES")
    linhas.append("=" * 70)

    if resultado.recomendacoes:
        for rec in resultado.recomendacoes:
            linhas.append(f"  • {rec}")
    else:
        linhas.append("  Nenhuma recomendação crítica no momento.")

    linhas.append("\n" + "=" * 70)

    return "\n".join(linhas)


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1:
        caminho = sys.argv[1]
        analyzer = ContextAnalyzer(caminho)
        resultado = analyzer.analisar()
        print(formatar_relatorio(resultado))
    else:
        # Análise do diretório atual
        caminho = os.getcwd()
        analyzer = ContextAnalyzer(caminho)
        resultado = analyzer.analisar()
        print(formatar_relatorio(resultado))
