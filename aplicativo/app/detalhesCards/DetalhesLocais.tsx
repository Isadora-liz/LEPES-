import Ionicons from '@expo/vector-icons/build/Ionicons';
import { useLocalSearchParams, router } from 'expo-router';
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';

import {
  Alert,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { auth, db } from '../../FirebaseConfig';
import Abas from '../../componentes/AbasDetalhesLocais';

import {
  buscarAvaliacoesDoLocal,
  calcularMedia,
  totalAvaliacoes,
} from '../../funcoes/avaliacoes';

import { buscarLocalPorId } from '../../funcoes/localBusca';

interface LocalData {
  imagem?: string | string[];
  nome: string;
  descricao?: string;
  endereco: string;
  horarioFuncionamento?: string;
  favoritos?: string[];
}

export default function Detalhes() {
  console.log('Detalhes renderizou');

  // Todos os hooks ficam antes dos retornos condicionais.
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams();

  console.log('Tipo:', typeof id);
  console.log('ID:', id);

  const [local, setLocal] = useState<LocalData | null>(null);
  const [favoritado, setFavoritado] = useState(false);
  const [mediaAvaliacoes, setMediaAvaliacoes] = useState(0);
  const [quantidadeAvaliacoes, setQuantidadeAvaliacoes] = useState(0);
  const [carregando, setCarregando] = useState(true);

  async function carregarLocal() {
    if (typeof id !== 'string') {
      return;
    }

    try {
      const dados = await buscarLocalPorId(id);

      if (dados) {
        setLocal(dados);
      } else {
        setLocal(null);
      }
    } catch (error) {
      console.error('Erro ao carregar local:', error);
    }
  }

  async function carregarAvaliacoes() {
    if (typeof id !== 'string') {
      return;
    }

    try {
      const notas = await buscarAvaliacoesDoLocal(id);
      const media = calcularMedia(notas);
      const quantidade = totalAvaliacoes(notas);

      setMediaAvaliacoes(media);
      setQuantidadeAvaliacoes(quantidade);
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
    }
  }

  async function carregarFavorito() {
    const usuario = auth.currentUser;

    if (!usuario) {
      setFavoritado(false);
      return;
    }

    try {
      const usuarioRef = doc(db, 'usuarios', usuario.uid);
      const usuarioSnap = await getDoc(usuarioRef);

      if (!usuarioSnap.exists()) {
        setFavoritado(false);
        return;
      }

      const dadosUsuario = usuarioSnap.data();
      const favoritos: string[] = dadosUsuario.favoritos || [];

      if (typeof id === 'string') {
        setFavoritado(favoritos.includes(id));
      }
    } catch (error) {
      console.log('Erro ao verificar favorito:', error);
    }
  }

  useEffect(() => {
    console.log('Entrou no useEffect');

    async function carregarDados() {
      if (typeof id !== 'string') {
        setCarregando(false);
        return;
      }

      try {
        setCarregando(true);

        await Promise.all([
          carregarLocal(),
          carregarAvaliacoes(),
          carregarFavorito(),
        ]);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, [id]);

  async function favoritar() {
    if (typeof id !== 'string') {
      return;
    }

    try {
      const usuario = auth.currentUser;

      if (!usuario) {
        Alert.alert(
          'Login necessário',
          'Para favoritar um local, você precisa estar logado.',
          [
            { text: 'Cancelar' },
            {
              text: 'OK',
              onPress: () => router.push('/login'),
            },
          ],
        );

        return;
      }

      const usuarioRef = doc(db, 'usuarios', usuario.uid);
      const usuarioSnap = await getDoc(usuarioRef);

      if (!usuarioSnap.exists()) {
        console.log('Usuário não encontrado');
        return;
      }

      if (favoritado) {
        await updateDoc(usuarioRef, {
          favoritos: arrayRemove(id),
        });

        setFavoritado(false);
      } else {
        await updateDoc(usuarioRef, {
          favoritos: arrayUnion(id),
        });

        setFavoritado(true);
      }
    } catch (error) {
      console.error('Erro ao favoritar:', error);
    }
  }

  // Retornos condicionais depois de todos os hooks.
  if (carregando) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ color: '#fff' }}>Carregando...</Text>
      </SafeAreaView>
    );
  }

  if (!local) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ color: '#fff' }}>Local não encontrado</Text>
      </SafeAreaView>
    );
  }

  // Aceita tanto uma URL quanto um array de URLs.
  const imagensLocal: string[] = (
  Array.isArray(local.imagem)
    ? local.imagem
    : [local.imagem]
).filter(
  (imagem): imagem is string =>
    typeof imagem === 'string' && imagem.trim() !== ''
);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View>
          {/* Carrossel horizontal de imagens */}
          {imagensLocal.length > 0 && (
            <FlatList
              data={imagensLocal}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => `${item}-${index}`}
              renderItem={({ item }) => (
                <View
                  style={{
                    width,
                    alignItems: 'center',
                  }}
                >
                  <Image
                    source={{ uri: item }}
                    style={styles.imagemCarrossel}
                    resizeMode="cover"
                  />
                </View>
              )}
            />
          )}

          <TouchableOpacity
            style={styles.botao}
            onPress={() => router.push('/explorar')}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color="#141414"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botaoFav}
            onPress={favoritar}
          >
            <Ionicons
              name={favoritado ? 'heart' : 'heart-outline'}
              size={24}
              color={favoritado ? '#E53935' : '#141414'}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.informacoes}>
          <Text style={styles.titulo}>{local.nome}</Text>

          <Text style={styles.subtitulo}>
            {local.descricao}
          </Text>

          <View style={styles.avaliacoes}>
            {quantidadeAvaliacoes > 0 ? (
              <>
                <Ionicons
                  name="star"
                  size={20}
                  color="#FFC107"
                />

                <Text style={styles.nota}>
                  {mediaAvaliacoes.toFixed(1).replace('.', ',')}
                </Text>

                <Text style={styles.avaliacoesTexto}>
                  ({quantidadeAvaliacoes}{' '}
                  {quantidadeAvaliacoes === 1
                    ? 'avaliação'
                    : 'avaliações'})
                </Text>
              </>
            ) : (
              <>
                <Ionicons
                  name="star-outline"
                  size={20}
                  color="#9AA0A6"
                />

                <Text style={styles.semAvaliacoes}>
                  Ainda não há avaliações
                </Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.abas}>
          <Abas style={styles.aba} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414',
  },

  foto: {
    width: '100%',
    height: 300,
  },

  botao: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '4%',
    marginTop: 15,
  },

  botaoFav: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    right: '4%',
    marginTop: 15,
  },

  informacoes: {
    padding: 20,
  },

  titulo: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
  },

  subtitulo: {
    color: '#9AA0A6',
    fontSize: 16,
    marginTop: 8,
  },

  avaliacoes: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    width: '100%',
    includeFontPadding: false,
  },

  semAvaliacoes: {
    color: '#9AA0A6',
    fontSize: 15,
    marginLeft: 8,
    flexShrink: 1,
  },

  nota: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 8,
  },

  avaliacoesTexto: {
    color: '#9AA0A6',
    marginLeft: 8,
    includeFontPadding: false,
  },

  imagemCarrossel: {
    width: '100%',
    height: 300,
    
  },

  abas: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },

  aba: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: 14,
    color: '#9AA0A6',
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
});