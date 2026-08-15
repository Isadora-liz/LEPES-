import Ionicons from '@expo/vector-icons/build/Ionicons';
import { useLocalSearchParams, router } from 'expo-router';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { auth, db } from '../../FirebaseConfig';
import Abas from '../../componentes/AbasDetalhesLocais';

import {
  buscarAvaliacoesDoLocal,
  calcularMedia,
  totalAvaliacoes,
} from '../../funcoes/avaliacoes';

import {
  buscarLocalPorId,
} from '../../funcoes/localBusca';

interface LocalData {
  imagem?: string;
  nome: string;
  descricao?: string;
  endereco: string;
  horarioFuncionamento?: string;
  favoritos?: string[];
}

export default function Detalhes() {
  console.log('Detalhes renderizou');

  const { id } = useLocalSearchParams();
  console.log("Tipo:", typeof id);
  console.log('ID:', id);

  const [local, setLocal] = useState<LocalData | null>(null);
  const [favoritado, setFavoritado] = useState(false);
  const [mediaAvaliacoes, setMediaAvaliacoes] = useState(0);
  const [quantidadeAvaliacoes, setQuantidadeAvaliacoes] = useState(0);
  const [carregando, setCarregando,] = useState(true);

  async function carregarLocal(){
    if (
      typeof id !== "string"
    ) {
      return;
    }
    try {
      const dados = await buscarLocalPorId(id);

      if (dados) {
        setLocal(dados);
      }
    } catch (error) {
      console.error ('erro ao carregar local:', error);
    }
  }

  async function carregarAvaliacoes(){
    if (
      typeof id !== 'string'
    ) {
      return;
    }
    try{
      const notas = await buscarAvaliacoesDoLocal(id);
      const media = calcularMedia(notas);
      const quantidade = totalAvaliacoes(notas);
      setMediaAvaliacoes(media);
      setQuantidadeAvaliacoes(quantidade);
  } catch (error) {
    console.error('erro ao carregar avaliações:', error);
  }
}

  async function carregarFavorito(){
    const usuario  = auth.currentUser;

    if (!usuario){
      setFavoritado(false);

      return;
    }

    try {
      const usuarioRef = doc(
        db,
        'usuarios',
        usuario.uid
      );
      const usuarioSnap = await getDoc(usuarioRef);

      if(!usuarioSnap.exists()
      ){
       setFavoritado(false);

       return;
      }
      const dadosUsuario=usuarioSnap.data();
      const favoritos: string[] = dadosUsuario.favoritos || [];

      if (
        typeof id === 'string'
      ){
        setFavoritado(favoritos.includes(id));
      }
    } catch (error) {
      console.log('erro ao verificar favorito', error);
    }
  }

  useEffect(() => {
    console.log('Entrou no useEffect');

      async function carregarDados() {
        if (
          typeof id !== 'string'
        ) {
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

        console.error(
          'Erro ao carregar dados:',
          error
        );

        } finally {
            setCarregando(false);
          }
        }

    carregarDados();

  }, [id]);

  async function favoritar(){
    if (
      typeof id !== 'string'
    ){
      return;
    }

    try{
      const usuario = auth.currentUser;

      if (!usuario) {
        console.log ('usuario nao está logado');

        return;
      }
      
      const usuarioRef = doc (
        db,
        'usuarios',
        usuario.uid
      );

      const usuarioSnap = await getDoc(usuarioRef);

      if (!usuarioSnap.exists()){
        console.log('usuario nao encontrado');

        return; 
      }

      if (favoritado){
        await updateDoc(usuarioRef,
          {
            favoritos: arrayRemove(id),
          }
        );

        setFavoritado(false);
      }
      else {
        await updateDoc(usuarioRef,
          {
            favoritos:
              arrayUnion(id),
          }
        );
        setFavoritado(true);
      }

    } catch (error) {
      console.error('erro ao favoritar', error);
    }
  }

  if (carregando){
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ color: '#fff' }}>Carregando...</Text>
      </SafeAreaView>
    );
  }

  if (!local) {
  return (
    <SafeAreaView style={styles.container}>
        <Text style={{ color: '#fff' }}>local nao encontrado</Text>
      </SafeAreaView>
  )}

  return(

    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View>
          <Image source={{ uri: local?.imagem }} style={styles.foto} />
          
          <TouchableOpacity
            style={styles.botao}
            onPress={() => router.push('/explorar')}
          >
            <Ionicons name="arrow-back" size={24} color="#141414" />
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
          <Text style={styles.titulo}>{local?.nome}</Text>

          <Text style={styles.subtitulo}>
            {local?.descricao}
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
    width:"100%",
    includeFontPadding: false,

  },

  semAvaliacoes: {
  color: '#9AA0A6',
  fontSize: 15,
  marginLeft: 8,
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
    width: "100%"

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

  cartaoTexto: {
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 10,
  },
});