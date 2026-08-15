import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import { auth } from '../FirebaseConfig';

import {
  Avaliacao,
  buscarAvaliacoesDoLocal,
  buscarMinhaAvaliacao,
  calcularMedia,
  calcularPercentual,
  HORARIOS_FREQUENCIA,
  salvarAvaliacaoDoUsuario,
  totalAvaliacoes,
} from '../funcoes/avaliacoes';

import {
  abrirRotasLocal,
  buscarLocalPorId,
  compartilharLocal,
  LocalData,
} from '../funcoes/localBusca';

interface AbasProps {
  style?: StyleProp<ViewStyle>;
}

export default function Abas({ style }: AbasProps) {
  const { id } = useLocalSearchParams();

  const [local, setLocal] = useState<LocalData | null>(null);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [abaAtiva, setAbaAtiva] = useState('Visão geral');

  const [mostrarAvaliacao, setMostrarAvaliacao] = useState(false);
  const [notaSelecionada, setNotaSelecionada] = useState(0);
  const [horariosSelecionados, setHorariosSelecionados] = useState<string[]>([]);
  const [enviandoAvaliacao, setEnviandoAvaliacao] = useState(false);

  useEffect(() => {
    async function carregarDados() {
      if (typeof id !== 'string') return;

      try {
        const dadosLocal = await buscarLocalPorId(id);
        setLocal(dadosLocal);

        const listaAvaliacoes = await buscarAvaliacoesDoLocal(id);
        setAvaliacoes(listaAvaliacoes);

        const usuario = auth.currentUser;

        if (usuario) {
          const minhaAvaliacao = await buscarMinhaAvaliacao(id, usuario.uid);

          if (minhaAvaliacao) {
            setNotaSelecionada(minhaAvaliacao.nota);
            setHorariosSelecionados(minhaAvaliacao.horariosFrequencia || []);
          }
        }
      } catch (error) {
        console.log('Erro ao carregar dados:', error);
      }
    }

    carregarDados();
  }, [id]);

  function alternarHorario(horario: string) {
    if (horariosSelecionados.includes(horario)) {
      setHorariosSelecionados(
        horariosSelecionados.filter((item) => item !== horario)
      );
    } else {
      setHorariosSelecionados([...horariosSelecionados, horario]);
    }
  }

  async function enviarAvaliacao() {
    if (typeof id !== 'string') return;

    const usuario = auth.currentUser;

    if (!usuario) {
      Alert.alert(
        'Faça login',
        'Você precisa estar conectado para avaliar este local.'
      );
      return;
    }

    if (notaSelecionada === 0) {
      Alert.alert('Selecione uma nota', 'Escolha de 1 a 5 estrelas.');
      return;
    }

    if (horariosSelecionados.length === 0) {
      Alert.alert(
        'Selecione um horário',
        'Informe pelo menos um horário em que você costuma frequentar este local.'
      );
      return;
    }

    try {
      setEnviandoAvaliacao(true);

      await salvarAvaliacaoDoUsuario(
        id,
        usuario.uid,
        notaSelecionada,
        horariosSelecionados
      );

      const listaAtualizada = await buscarAvaliacoesDoLocal(id);
      setAvaliacoes(listaAtualizada);

      setMostrarAvaliacao(false);

      Alert.alert('Avaliação enviada', 'Obrigado pela sua avaliação!');
    } catch (error) {
      console.log('Erro ao avaliar:', error);
      Alert.alert('Erro', 'Não foi possível enviar sua avaliação.');
    } finally {
      setEnviandoAvaliacao(false);
    }
  }

  function renderizarEstrelas() {
    const media = calcularMedia(avaliacoes);

    return (
      <View style={styles.estrelas}>
        {[1, 2, 3, 4, 5].map((estrela) => {
          let icone: 'star' | 'star-half' | 'star-outline' = 'star-outline';

          if (media >= estrela) {
            icone = 'star';
          } else if (media >= estrela - 0.5) {
            icone = 'star-half';
          }

          return (
            <Ionicons
              key={estrela}
              name={icone}
              size={19}
              color="#FFB800"
            />
          );
        })}
      </View>
    );
  }

  function renderizarEstrelasAvaliacao() {
    return (
      <View style={styles.estrelasAvaliacao}>
        {[1, 2, 3, 4, 5].map((estrela) => (
          <TouchableOpacity
            key={estrela}
            onPress={() => setNotaSelecionada(estrela)}
          >
            <Ionicons
              name={estrela <= notaSelecionada ? 'star' : 'star-outline'}
              size={38}
              color="#FFB800"
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  function renderizarBarras() {
    return [5, 4, 3, 2, 1].map((nota) => {
      const percentual = calcularPercentual(avaliacoes, nota);

      return (
        <View key={nota} style={styles.linhaAvaliacao}>
          <Text style={styles.numeroEstrela}>{nota}</Text>

          <View style={styles.barraFundo}>
            <View
              style={[
                styles.barraPreenchida,
                { width: `${percentual}%` as `${number}%` },
              ]}
            />
          </View>
        </View>
      );
    });
  }

  function renderizarHorariosSelecao() {
    return (
      <View style={styles.listaHorarios}>
        {HORARIOS_FREQUENCIA.map((horario) => {
          const selecionado = horariosSelecionados.includes(horario);

          return (
            <TouchableOpacity
              key={horario}
              style={styles.opcaoHorario}
              onPress={() => alternarHorario(horario)}
            >
              <View
                style={[
                  styles.checkbox,
                  selecionado && styles.checkboxSelecionado,
                ]}
              >
                {selecionado && (
                  <Ionicons
                    name="checkmark"
                    size={18}
                    color="#141414"
                  />
                )}
              </View>

              <Text style={styles.textoHorario}>{horario}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  function obterDadosHorarios() {
    const totalAvaliacoesComHorario = avaliacoes.length;

    return HORARIOS_FREQUENCIA.map((horario) => {
      let quantidade = 0;

      for (const avaliacao of avaliacoes) {
        if (avaliacao.horariosFrequencia?.includes(horario)) {
          quantidade++;
        }
      }

      const percentual =
        totalAvaliacoesComHorario === 0
          ? 0
          : (quantidade / totalAvaliacoesComHorario) * 100;

      let nivel = 'Baixo';

      if (percentual >= 70) {
        nivel = 'Alto';
      } else if (percentual >= 35) {
        nivel = 'Médio';
      }

      return {
        horario,
        percentual,
        nivel,
      };
    });
  }

  function renderizarGraficoHorarios() {
    const dadosHorarios = obterDadosHorarios();

    return (
      <View style={styles.areaHorariosPico}>
        <View style={styles.tituloGraficoRow}>
          <Ionicons
            name="stats-chart-outline"
            size={20}
            color="#3EC5D7"
          />
          <Text style={styles.tituloGrafico}>Horários de pico</Text>
        </View>

        {dadosHorarios.map((item) => (
          <View key={item.horario} style={styles.linhaHorarioPico}>
            <Text style={styles.textoHora}>{item.horario}</Text>

            <View style={styles.barraHorarioFundo}>
              <View
                style={[
                  styles.barraHorarioPreenchida,
                  {
                    width: `${item.percentual}%` as `${number}%`,
                  },
                ]}
              />
            </View>

            <Text style={styles.textoNivel}>{item.nivel}</Text>
          </View>
        ))}
      </View>
    );
  }

  function renderizarVisaoGeral() {
    return (
      <View>
        <View style={styles.botoes}>
          <TouchableOpacity
            style={styles.cartao}
            onPress={() => {
              if (local) {
                abrirRotasLocal(local);
              }
            }}
          >
            <Ionicons name="send" size={24} color="#3EC5D7" />
            <Text style={styles.cartaoTexto}>Rotas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cartao}
            onPress={() => {
              if (local) {
                compartilharLocal(local);
              }
            }}
          >
            <Ionicons
              name="share-social"
              size={24}
              color="#3EC5D7"
            />
            <Text style={styles.cartaoTexto}>Compartilhar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.informacoes}>
          <View style={styles.informacaoRow}>
            <Ionicons
              name="location-outline"
              size={30}
              color="#3EC5D7"
            />
            <Text style={styles.tituloInformacao}>Endereço</Text>
          </View>

          <Text style={styles.textoInformacao}>{local?.endereco}</Text>

          <View style={styles.informacaoRowComMargem}>
            <Ionicons
              name="time-outline"
              size={30}
              color="#3EC5D7"
            />
            <Text style={styles.tituloInformacao}>
              Horário de funcionamento
            </Text>
          </View>

          <Text style={styles.textoInformacao}>
            {local?.horarioFuncionamento}
          </Text>

          {renderizarGraficoHorarios()}
        </View>
      </View>
    );
  }

  function renderizarAvaliacoes() {
    const total = totalAvaliacoes(avaliacoes);
    const media = calcularMedia(avaliacoes);

    return (
      <View style={styles.conteudoAvaliacoes}>
        <Text style={styles.tituloAvaliacoes}>Avaliações</Text>

        {total === 0 ? (
          <View style={styles.areaSemAvaliacoes}>
            <Ionicons
              name="star-outline"
              size={40}
              color="#9AA0A6"
            />
            <Text style={styles.semAvaliacoes}>
              Este local ainda não possui avaliações.
            </Text>
          </View>
        ) : (
          <View style={styles.resumoAvaliacoes}>
            <View style={styles.areaBarras}>{renderizarBarras()}</View>

            <View style={styles.areaNota}>
              <Text style={styles.mediaAvaliacao}>
                {media.toFixed(1).replace('.', ',')}
              </Text>

              {renderizarEstrelas()}

              <Text style={styles.totalAvaliacoes}>
                {total} {total === 1 ? 'avaliação' : 'avaliações'}
              </Text>
            </View>
          </View>
        )}

        {!mostrarAvaliacao && (
          <TouchableOpacity
            style={styles.botaoAvaliar}
            onPress={() => setMostrarAvaliacao(true)}
          >
            <Ionicons
              name="create-outline"
              size={21}
              color="#141414"
            />
            <Text style={styles.textoBotaoAvaliar}>Avaliar</Text>
          </TouchableOpacity>
        )}

        {mostrarAvaliacao && (
          <View style={styles.areaDarAvaliacao}>
            <Text style={styles.tituloDarAvaliacao}>
              Como você avalia este local?
            </Text>

            {renderizarEstrelasAvaliacao()}

            <Text style={styles.tituloHorarios}>
              Em quais horários você costuma frequentar?
            </Text>

            <Text style={styles.subtituloHorarios}>
              Selecione pelo menos uma opção
            </Text>

            {renderizarHorariosSelecao()}

            <View style={styles.botoesAvaliacao}>
              <TouchableOpacity
                style={styles.botaoCancelar}
                onPress={() => setMostrarAvaliacao(false)}
              >
                <Text style={styles.textoCancelar}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.botaoEnviar,
                  (notaSelecionada === 0 ||
                    horariosSelecionados.length === 0) &&
                    styles.botaoDesativado,
                ]}
                onPress={enviarAvaliacao}
                disabled={
                  enviandoAvaliacao ||
                  notaSelecionada === 0 ||
                  horariosSelecionados.length === 0
                }
              >
                <Text style={styles.textoEnviar}>
                  {enviandoAvaliacao
                    ? 'Enviando...'
                    : 'Enviar avaliação'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  }

  function renderizarConteudo() {
    if (abaAtiva === 'Visão geral') {
      return renderizarVisaoGeral();
    }

    if (abaAtiva === 'Avaliações') {
      return renderizarAvaliacoes();
    }

    return (
      <View style={styles.conteudoAcessibilidade}>
        <Text style={styles.textoAcessibilidade}>
          Conteúdo de Acessibilidade
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.abas}>
        <TouchableOpacity
          style={styles.botaoAba}
          onPress={() => setAbaAtiva('Visão geral')}
        >
          <Text
            style={[
              styles.aba,
              abaAtiva === 'Visão geral' && styles.abaAtiva,
            ]}
          >
            Visão geral
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botaoAba}
          onPress={() => setAbaAtiva('Avaliações')}
        >
          <Text
            style={[
              styles.aba,
              abaAtiva === 'Avaliações' && styles.abaAtiva,
            ]}
          >
            Avaliações
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botaoAba}
          onPress={() => setAbaAtiva('Acessibilidade')}
        >
          <Text
            style={[
              styles.aba,
              abaAtiva === 'Acessibilidade' && styles.abaAtiva,
            ]}
          >
            Acessibilidade
          </Text>
        </TouchableOpacity>
      </View>

      {renderizarConteudo()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414',
  },

  abas: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },

  botaoAba: {
    flex: 1,
  },

  aba: {
    textAlign: 'center',
    paddingVertical: 10,
    color: '#9AA0A6',
    includeFontPadding: false,
  },

  abaAtiva: {
    color: '#3EC5D7',
    borderBottomWidth: 2,
    borderBottomColor: '#3EC5D7',
  },

  botoes: {
    flexDirection: 'row',
    padding: 20,
  },

  cartao: {
    flex: 1,
    backgroundColor: '#262626',
    borderRadius: 16,
    paddingVertical: 24,
    alignItems: 'center',
    marginHorizontal: 5,
  },

  cartaoTexto: {
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 10,
  },

  informacoes: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  informacaoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  informacaoRowComMargem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
  },

  tituloInformacao: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
    marginLeft: 5,
  },

  textoInformacao: {
    color: '#9d9c9c',
    marginLeft: 35,
    marginTop: 5,
  },

  areaHorariosPico: {
  marginTop: 25,
  paddingTop: 8,
  borderTopWidth: 1,
  borderTopColor: '#1F1F1F',
},

tituloGraficoRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 12,
},

tituloGrafico: {
  color: '#FFFFFF',
  fontSize: 17,
  fontWeight: 'bold',
  marginLeft: 7,
},

linhaHorarioPico: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 10,
},

textoHora: {
  width: 35,
  color: '#D7D7D7',
  fontSize: 13,
},

barraHorarioFundo: {
  flex: 1,
  height: 18,
  backgroundColor: '#2A2A2A',
  borderRadius: 10,
  overflow: 'hidden',
  marginHorizontal: 8,
},

barraHorarioPreenchida: {
  height: '100%',
  backgroundColor: '#20B7D1',
  borderRadius: 10,
},

textoNivel: {
  width: 45,
  color: '#CFCFCF',
  fontSize: 13,
  textAlign: 'right',
},

  conteudoAvaliacoes: {
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 30,
  },

  tituloAvaliacoes: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  resumoAvaliacoes: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  areaBarras: {
    flex: 1,
    marginRight: 25,
  },

  linhaAvaliacao: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },

  numeroEstrela: {
    color: '#9AA0A6',
    width: 22,
    fontSize: 14,
  },

  barraFundo: {
    flex: 1,
    height: 9,
    backgroundColor: '#303030',
    borderRadius: 10,
    overflow: 'hidden',
  },

  barraPreenchida: {
    height: '100%',
    backgroundColor: '#FFB800',
    borderRadius: 10,
  },

  areaNota: {
    alignItems: 'center',
    minWidth: 105,
  },

  mediaAvaliacao: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '500',
  },

  estrelas: {
    flexDirection: 'row',
    marginTop: 3,
  },

  totalAvaliacoes: {
    color: '#9AA0A6',
    fontSize: 13,
    marginTop: 6,
  },

  areaSemAvaliacoes: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 25,
  },

  semAvaliacoes: {
    color: '#9AA0A6',
    fontSize: 15,
    marginTop: 10,
    textAlign: 'center',
  },

  botaoAvaliar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: '#3EC5D7',
    paddingHorizontal: 26,
    paddingVertical: 12,
    borderRadius: 30,
    marginTop: 28,
  },

  textoBotaoAvaliar: {
    color: '#141414',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 7,
  },

  areaDarAvaliacao: {
    backgroundColor: '#202020',
    borderRadius: 18,
    padding: 20,
    marginTop: 25,
  },

  tituloDarAvaliacao: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },

  estrelasAvaliacao: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
    marginBottom: 25,
  },

  tituloHorarios: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },

  subtituloHorarios: {
    color: '#9AA0A6',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 15,
  },

  listaHorarios: {
    width: '100%',
  },

  opcaoHorario: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#5F6368',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  checkboxSelecionado: {
    backgroundColor: '#3EC5D7',
    borderColor: '#3EC5D7',
  },

  textoHorario: {
    color: '#FFFFFF',
    fontSize: 15,
  },

  botoesAvaliacao: {
    flexDirection: 'row',
    marginTop: 22,
    width: '100%',
    gap: 10,
  },

  botaoCancelar: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#303030',
  },

  textoCancelar: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  botaoEnviar: {
    flex: 1.5,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#3EC5D7',
  },

  botaoDesativado: {
    opacity: 0.4,
  },

  textoEnviar: {
    color: '#141414',
    fontWeight: 'bold',
  },

  conteudoAcessibilidade: {
    padding: 20,
  },

  textoAcessibilidade: {
    color: '#FFFFFF',
  },
});