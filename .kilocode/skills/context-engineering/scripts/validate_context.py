#!/usr/bin/env python3
"""
Validador de Contexto para Context Engineering

Este script valida a qualidade e eficiência do contexto de uma sessão
de desenvolvimento, verificando organização, relevância e economia de tokens.
"""

import json
import re
from dataclasses import dataclass, field
from typing import Any


@dataclass
class ResultadoValidacao:
    """Resultado de uma validação de contexto."""
    categoria: str
    passou: bool
    mensagem: str
    sugestao: str | None = None
    severidade: str = "info"  # info, warning, error


@dataclass
class MetricasValidacao:
    """Métricas gerais da validação."""
    total_checks: int = 0
    passou: int = 0
    falhas: int = 0
    avisos: int = 0
    score_geral: float = 0.0
    resultados: list = field(default_factory=list)


class ContextValidator:
    """
    Validador de contexto que verifica:
    - Organização de informações
    - Limites de tokens
    - Relevância do conteúdo
    - Estrutura de dependências
    - Padrões de nomenclatura
    """

    # Limites recomendados
    LIMITE_WORKING_TOKENS = 150
    LIMITE_SESSION_TOKENS = 800
    LIMITE_PROJECT_TOKENS = 2000

    # Tamanhos máximos recomendados
    TAMANHO_MAXIMO_ARQUIVO = 300  # linhas
    TAMANHO_MAXIMO_FUNCAO = 50    # linhas
    TAMANHO_MAXIMO_CLASSE = 200   # linhas

    def __init__(self, contexto: dict[str, Any]):
        self.contexto = contexto
        self.metricas = MetricasValidacao()

    def validar(self) -> MetricasValidacao:
        """Executa todas as validações."""
        self.metricas = MetricasValidacao()

        # Validações de organização
        self._validar_organizacao()
        self._validar_limites_tokens()
        self._validar_relevancia()
        self._validar_dependencias()
        self._validar_nomenclatura()
        self._validar_estruturas()

        # Calcular score geral
        self.metricas.score_geral = (
            self.metricas.passou / self.metricas.total_checks * 100
            if self.metricas.total_checks > 0 else 0
        )

        return self.metricas

    def _validar_organizacao(self) -> None:
        """Valida a organização do contexto."""
        resultados = []

        # Verificar se existe分层结构
        if "camadas" in self.contexto or "layers" in self.contexto:
            resultados.append(ResultadoValidacao(
                categoria="Organização",
                passou=True,
                mensagem="Contexto possui estrutura de camadas",
                severidade="info"
            ))
        else:
            resultados.append(ResultadoValidacao(
                categoria="Organização",
                passou=False,
                mensagem="Contexto não possui estrutura de camadas definida",
                sugestao="Considere implementar camadas: Working, Session, Project, Reference",
                severidade="warning"
            ))

        # Verificar separação de responsabilidades
        if "responsabilidades" in self.contexto or "responsibilities" in self.contexto:
            resultados.append(ResultadoValidacao(
                categoria="Organização",
                passou=True,
                mensagem="Responsabilidades estão definidas",
                severidade="info"
            ))
        else:
            resultados.append(ResultadoValidacao(
                categoria="Organização",
                passou=False,
                mensagem="Separação de responsabilidades não está clara",
                sugestao="Defina claramente as responsabilidades de cada componente",
                severidade="warning"
            ))

        self._adicionar_resultados(resultados)

    def _validar_limites_tokens(self) -> None:
        """Valida o uso de tokens."""
        resultados = []

        # Contar tokens aproximados
        contexto_str = json.dumps(self.contexto)
        tokens_estimados = len(contexto_str) // 4  # Aproximação: 1 token ≈ 4 caracteres

        resultados.append(ResultadoValidacao(
            categoria="Tokens",
            mensagem=f"Tokens estimados: {tokens_estimados}",
            passou=True,
            severidade="info"
        ))

        if tokens_estimados > self.LIMITE_PROJECT_TOKENS:
            resultados.append(ResultadoValidacao(
                categoria="Tokens",
                passou=False,
                mensagem=f"Uso de tokens está acima do limite recomendado ({self.LIMITE_PROJECT_TOKENS})",
                sugestao="Considere comprimir contexto inativo ou arquivar informações antigas",
                severidade="error"
            ))
        elif tokens_estimados > self.LIMITE_SESSION_TOKENS:
            resultados.append(ResultadoValidacao(
                categoria="Tokens",
                passou=True,
                mensagem="Uso de tokens está acima do nível de sessão",
                sugestao="Considere mover informações para a camada de projeto",
                severidade="warning"
            ))
        else:
            resultados.append(ResultadoValidacao(
                categoria="Tokens",
                passou=True,
                mensagem="Uso de tokens está dentro dos limites recomendados",
                severidade="info"
            ))

        self._adicionar_resultados(resultados)

    def _validar_relevancia(self) -> None:
        """Valida a relevância do conteúdo."""
        resultados = []

        # Verificar se há informações irrelevantes
        if "informacoes_inativas" in self.contexto or "inactive_info" in self.contexto:
            inativos = self.contexto.get("informacoes_inativas", [])
            if len(inativos) > 5:
                resultados.append(ResultadoValidacao(
                    categoria="Relevância",
                    passou=False,
                    mensagem=f"Existem {len(inativos)} informações inativas no contexto",
                    sugestao="Considere arquivar ou remover informações não utilizadas recentemente",
                    severidade="warning"
                ))
            else:
                resultados.append(ResultadoValidacao(
                    categoria="Relevância",
                    passou=True,
                    mensagem="Quantidade de informações inativas está controlada",
                    severidade="info"
                ))
        else:
            resultados.append(ResultadoValidacao(
                categoria="Relevância",
                passou=True,
                mensagem="Não foram detectadas informações inativas",
                severidade="info"
            ))

        # Verificar se há duplicação
        if "duplicatas" in self.contexto:
            duplicatas = self.contexto.get("duplicatas", [])
            if len(duplicatas) > 0:
                resultados.append(ResultadoValidacao(
                    categoria="Relevância",
                    passado=False,
                    mensagem=f"Foram detectadas {len(duplicatas)} duplicatas",
                    sugestao="Considere consolidar informações duplicadas",
                    severidade="warning"
                ))

        self._adicionar_resultados(resultados)

    def _validar_dependencias(self) -> None:
        """Valida as dependências."""
        resultados = []

        # Verificar cyclic dependencies
        if "dependencias_ciclicas" in self.contexto:
            ciclicas = self.contexto.get("dependencias_ciclicas", [])
            if len(ciclicas) > 0:
                resultados.append(ResultadoValidacao(
                    categoria="Dependências",
                    passou=False,
                    mensagem=f"Detectadas {len(ciclicas)} dependências cíclicas",
                    sugestao="Refatore para eliminar dependências circulares",
                    severidade="error"
                ))
            else:
                resultados.append(ResultadoValidacao(
                    categoria="Dependências",
                    passou=True,
                    mensagem="Não foram detectadas dependências cíclicas",
                    severidade="info"
                ))

        # Verificar acoplamento
        if "acoplamento" in self.contexto:
            acoplamento = self.contexto.get("acoplamento", 0)
            if acoplamento > 70:
                resultados.append(ResultadoValidacao(
                    categoria="Dependências",
                    passou=False,
                    mensagem=f"Acoplamento alto detectado: {acoplamento}%",
                    sugestao="Considere reduzir acoplamento com abstrações e interfaces",
                    severidade="warning"
                ))
            elif acoplamento < 30:
                resultados.append(ResultadoValidacao(
                    categoria="Dependências",
                    passou=True,
                    mensagem=f"Acoplamento está bom: {acoplamento}%",
                    severidade="info"
                ))

        self._adicionar_resultados(resultados)

    def _validar_nomenclatura(self) -> None:
        """Valida padrões de nomenclatura."""
        resultados = []

        # Verificar convenções de nomes
        problemas_nomeacao = []

        if "arquivos" in self.contexto:
            for arquivo in self.contexto.get("arquivos", []):
                nome = arquivo.get("nome", "")

                # Verificar PascalCase para componentes
                if re.match(r'^[A-Z][a-z]+(?:[A-Z][a-z]+)*\.tsx?$', nome) is None:
                    if nome.endswith('.tsx') or nome.endswith('.ts'):
                        problemas_nomeacao.append(f"Componente sem PascalCase: {nome}")

        if problemas_nomeacao:
            resultados.append(ResultadoValidacao(
                categoria="Nomenclatura",
                passou=False,
                mensagem=f"{len(problemas_nomeacao)} arquivos com problemas de nomenclatura",
                sugestao="Siga convenções: PascalCase para componentes, camelCase para utilitários",
                severidade="warning"
            ))
        else:
            resultados.append(ResultadoValidacao(
                categoria="Nomenclatura",
                passou=True,
                mensagem="Convensões de nomenclatura estão sendo seguidas",
                severidade="info"
            ))

        self._adicionar_resultados(resultados)

    def _validar_estruturas(self) -> None:
        """Valida estruturas de código."""
        resultados = []

        # Verificar tamanho de arquivos
        if "arquivos_grandes" in self.contexto:
            grandes = self.contexto.get("arquivos_grandes", [])
            if grandes:
                resultados.append(ResultadoValidacao(
                    categoria="Estruturas",
                    passou=False,
                    mensagem=f"{len(grandes)} arquivos acima do tamanho recomendado",
                    sugestao="Considere decompor arquivos muito grandes",
                    severidade="warning"
                ))

        # Verificar funções longas
        if "funcoes_longas" in self.contexto:
            longas = self.contexto.get("funcoes_longas", [])
            if longas:
                resultados.append(ResultadoValidacao(
                    categoria="Estruturas",
                    passou=False,
                    mensagem=f"{len(longas)} funções acima do tamanho recomendado",
                    sugestao="Considere extrair funções menores com responsabilidade única",
                    severidade="warning"
                ))

        self._adicionar_resultados(resultados)

    def _adicionar_resultados(self, resultados: list[ResultadoValidacao]) -> None:
        """Adiciona resultados às métricas."""
        for resultado in resultados:
            self.metricas.total_checks += 1
            if resultado.passou:
                self.metricas.passou += 1
            else:
                self.metricas.falhas += 1
                if resultado.severidade == "warning":
                    self.metricas.avisos += 1
            self.metricas.resultados.append(resultado)


def validar_contexto_arquivo(caminho_arquivo: str) -> MetricasValidacao:
    """
    Valida contexto a partir de um arquivo JSON.

    Args:
        caminho_arquivo: Caminho para o arquivo de contexto

    Returns:
        MetricasValidacao com os resultados
    """
    with open(caminho_arquivo, 'r', encoding='utf-8') as f:
        contexto = json.load(f)

    validator = ContextValidator(contexto)
    return validator.validar()


def formatar_relatorio(metricas: MetricasValidacao) -> str:
    """Formata as métricas em um relatório legível."""
    linhas = []

    linhas.append("=" * 60)
    linhas.append("RELATÓRIO DE VALIDAÇÃO DE CONTEXTO")
    linhas.append("=" * 60)
    linhas.append("")
    linhas.append(f"Score Geral: {metricas.score_geral:.1f}%")
    linhas.append(f"Total de Checks: {metricas.total_checks}")
    linhas.append(f"Passou: {metricas.passou}")
    linhas.append(f"Falhas: {metricas.falhas}")
    linhas.append(f"Avisos: {metricas.avisos}")
    linhas.append("")
    linhas.append("-" * 60)
    linhas.append("DETALHES POR CATEGORIA")
    linhas.append("-" * 60)

    # Agrupar resultados por categoria
    por_categoria: dict[str, list[ResultadoValidacao]] = {}
    for resultado in metricas.resultados:
        if resultado.categoria not in por_categoria:
            por_categoria[resultado.categoria] = []
        por_categoria[resultado.categoria].append(resultado)

    for categoria, resultados in por_categoria.items():
        linhas.append(f"\n{categoria}:")
        for resultado in resultados:
            status = "✅" if resultado.passou else "❌"
            severidade = f"[{resultado.severidade.upper()}]"
            linhas.append(f"  {status} {severidade} {resultado.mensagem}")
            if resultado.sugestao:
                linhas.append(f"     💡 Sugestão: {resultado.sugestao}")

    linhas.append("")
    linhas.append("=" * 60)

    return "\n".join(linhas)


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1:
        caminho = sys.argv[1]
        metricas = validar_contexto_arquivo(caminho)
        print(formatar_relatorio(metricas))
    else:
        # Exemplo de uso
        contexto_exemplo = {
            "camadas": {
                "working": {"tokens": 100},
                "session": {"tokens": 500},
                "project": {"tokens": 1500}
            },
            "acoplamento": 45,
            "arquivos": [
                {"nome": "Button.tsx"},
                {"nome": "UserCard.tsx"},
                {"nome": "utils.ts"}
            ]
        }

        validator = ContextValidator(contexto_exemplo)
        metricas = validator.validar()
        print(formatar_relatorio(metricas))
