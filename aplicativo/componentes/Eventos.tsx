import { router } from 'expo-router';
import { Image, StyleSheet, View, TouchableOpacity, Alert, SafeAreaView} from 'react-native';
import { Card, Text, } from 'react-native-paper';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import{useEffect, useState} from 'react';
import { auth, db } from '@/FirebaseConfig';
import { doc } from 'firebase/firestore';
import { updateDoc } from 'firebase/firestore';
import { arrayRemove } from 'firebase/firestore';
import { arrayUnion } from 'firebase/firestore';
import { getDoc } from 'firebase/firestore';
//import {
//  pedirPermissaoNotificacao,
//  pegarTokenNotificacao,
//} from '@/funcoes/notificacoes';

interface EventosProps {
  id: string | number;
  nome: string;
  descricao: string;
  endereco: string;
  imagem: string;
}

export default function EventoCard({ id, nome, descricao, endereco, imagem, }: EventosProps) {

  const [notificacaoAtiva, setNotificacaoAtiva] = useState(false);
  const [interesseMarcado, setInteresseMarcado] = useState(false);
   const [carregando, setCarregando,] = useState(true);

    async function carregarnotificaçãoAtiva(){
      const usuario  = auth.currentUser;
      
      if (!usuario){
        setNotificacaoAtiva(false); 

        return;
      }

      try {
        const usuarioRef = doc(
          db,
          "usuarios",
          usuario.uid
        );
        const usuarioSnap = await getDoc(usuarioRef);

        if(!usuarioSnap.exists()
        ){
         setNotificacaoAtiva(false);
         return;
        }
        const dadosUsuario=usuarioSnap.data();
        const notificacoes: string[] = dadosUsuario.interesses.notificacaoAtiva || [];

        if (
          typeof id === 'string'
        ){
          setNotificacaoAtiva(notificacoes.includes(id));
        }
      } catch (error) {
        console.log('erro ao verificar notificação', error);
      }
    }

    async function carregarInteresseMarcado(){
      const usuario  = auth.currentUser;
  
      if (!usuario){
        setInteresseMarcado(false);
  
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
         setInteresseMarcado(false);
  
         return;
        }
        const dadosUsuario=usuarioSnap.data();
        const interesses: string[] = dadosUsuario.interesses.interesseMarcado || [];
  
        if (
          typeof id === 'string'
        ){
          setInteresseMarcado(interesses.includes(id));
        }
      } catch (error) {
        console.log('erro ao verificar interesse', error);
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

            carregarnotificaçãoAtiva(),
            carregarInteresseMarcado(),
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
  

  async function marcarInteresse() {
      if (
      typeof id !== 'string'
    ){
      return;
    }

    try{
      const usuario = auth.currentUser;
      if (!usuario) {
        Alert.alert(
                  'Para marcar interesse, você precisa estar logado.',
                  'Clique em OK para ir para a tela de login.',
                  [
                    { text: 'Cancelar' },
                    { text: 'OK', onPress: () => router.push('/login') }
                  ],
                );
                return;
    }
      const usuarioRef = doc (
        db,
        "usuarios",
        usuario.uid
      );


      if (interesseMarcado){
        await updateDoc(usuarioRef,
          {
            "interesses.interesseMarcado": arrayRemove(id),
          }
        );

        setInteresseMarcado(false);
      }
      else {
        await updateDoc(usuarioRef,
          {
            "interesses.interesseMarcado": arrayUnion(id),
          }
        );
        setInteresseMarcado(true);
      }
    
    } catch (error) {
      console.log('Erro ao marcar interesse:', error);
    }
    
      return;
    }

   async function ativarNotificacao() {
  if (typeof id !== 'string') {
    return;
  }

  try {
    const usuario = auth.currentUser;

    if (!usuario) {
      Alert.alert(
        'Para ativar notificações, você precisa estar logado.',
        'Clique em OK para ir para a tela de login.',
        [
          { text: 'Cancelar' },
          { text: 'OK', onPress: () => router.push('/login') }
        ],
      );
      return;
    }

    const usuarioRef = doc(
      db,
      "usuarios",
      usuario.uid
    );

    if (notificacaoAtiva) {
      await updateDoc(usuarioRef, {
        "interesses.notificacaoAtiva": arrayRemove(id),
      });

      setNotificacaoAtiva(false);
      return;
    }

    
    //const permissao = await pedirPermissaoNotificacao();

    //if (!permissao) {
     // Alert.alert(
     //   'Notificações desativadas',
     //   'Você precisa permitir as notificações para receber avisos sobre este evento.'
     // );
     // return;
    //}

    // Pega o token do aparelho
    //const token = await pegarTokenNotificacao();

    //if (!token) {
    //  Alert.alert(
    //    'Erro',
    //    'Não foi possível configurar as notificações neste aparelho.'
    //  );
    //  return;
    //}

    // Salva o token do aparelho
    //await updateDoc(usuarioRef, {
    //  expoPushToken: token,
    //});

    // Salva o evento como notificação ativa
    await updateDoc(usuarioRef, {
      "interesses.notificacaoAtiva": arrayUnion(id),
    });

    setNotificacaoAtiva(true);

  } catch (error) {
    console.log('Erro ao ativar notificação:', error);
  }
}
         
  return (
    <Card
      style={styles.card}
      onPress={() => router.push(`/detalhesCards/DetalhesEventos?id=${id}`)}
    >

      <Card.Content style={styles.linha}>

        <TouchableOpacity
          style={[
            styles.botaoNotificacao,
            notificacaoAtiva
              ? styles.botaoNotificacaoAtivo
              : styles.botaoNotificacaoInativo,
          ]}
          activeOpacity={0.7}
          hitSlop={{ top: 40, bottom: 40, left: 40, right: 40 }}
          onPress={ativarNotificacao}
        >
          <MaterialCommunityIcons
            name={notificacaoAtiva ? "bell" : "bell-off-outline"}
            size={20}
            color={notificacaoAtiva ? "#FFFFFF" : "#6B7280"}
          />
        </TouchableOpacity>

        <Image
          source={{ uri: imagem }}
          style={styles.imagem}
        />

        <View style={styles.info}>
          <Text style={styles.titulo}>{nome}</Text>

          <Text style={styles.descricao} numberOfLines={2}>
            {descricao}
          </Text>

          <Text style={styles.endereco}>📍 {endereco}</Text>
        </View>

      </Card.Content>

      <TouchableOpacity
        style={[
          styles.botaoInteresse,
          interesseMarcado && styles.botaoInteresseAtivo,
        ]}
        activeOpacity={0.85}
        onPress={marcarInteresse}
      >
        <Text style={styles.textoBotaoInteresse}>
          {interesseMarcado ? "Interesse marcado" : "Marcar interesse"}
        </Text>
      </TouchableOpacity>
    </Card>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 0,
  },
  card: {
    marginBottom: 10,
    borderRadius: 10,
    overflow: 'hidden',
    minHeight: 170,
    margin: 20

  },

  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },

  imagem: {
    width: 140,
    height: 140,
    borderRadius: 14,
    marginRight: 16,
    margin: 0,
  },

  info: {
  flex: 1,
  justifyContent: 'center',
  paddingRight: 40,
},

  titulo: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    color: '#222',
  },

  descricao: {
    fontSize: 15,
    color: '#555',
    marginBottom: 8,
  },

  endereco: {
    fontSize: 14,
    color: '#777',
  },

 botaoNotificacao: {
  position: "absolute",
  top: 10,
  right: 10,
  width: 42,
  height: 42,
  borderRadius: 21,
  justifyContent: "center",
  alignItems: "center",
  zIndex: 10,
},

botaoNotificacaoInativo: {
  backgroundColor: "#E5E7EB",
},

botaoNotificacaoAtivo: {
  backgroundColor: "#3ec5d7",
},

botaoInteresse: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  marginHorizontal: 12,
  marginBottom: 12,
  marginTop: 6,
  paddingVertical: 12,
  borderRadius: 100,
  backgroundColor: "#9aa0a6",
},
botaoInteresseAtivo: {
  backgroundColor: "#3ec5d7",
},
textoBotaoInteresse: {
  color: "#fff",
  fontSize: 15,
  fontWeight: "700",
},
});