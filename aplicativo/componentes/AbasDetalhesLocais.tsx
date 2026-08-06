import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { db } from '../FirebaseConfig';
import { doc } from 'firebase/firestore';
import { useLocalSearchParams } from 'expo-router';
import { getDoc } from 'firebase/firestore';

interface AbasProps {
  style?: StyleProp<ViewStyle>;
}


export default function Abas({ style }: AbasProps) {
  const { id } = useLocalSearchParams();
  const [local, setLocal] = useState<any>(null);

  useEffect(() => {
    async function buscarLocal() {
      console.log("Buscando...");
      if (typeof id !== 'string') return;

      const docRef = doc(db, 'espaco', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setLocal(docSnap.data());
      }
    }

    buscarLocal();
  }, [id]);

  const [abaAtiva, setAbaAtiva] = useState('Visão geral');
  const renderConteudo = () => {
    switch (abaAtiva) {
      case 'Visão geral':
        return (
        <View>
          <View style={styles.botoes}>
            <TouchableOpacity style={styles.cartao}>
              <Ionicons name="send" size={24} color="#3EC5D7" />
              <Text style={styles.cartaoTexto}>Rotas</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cartao}>
              <Ionicons name="share-social" size={24} color="#3EC5D7" />
              <Text style={styles.cartaoTexto}>Compartilhar</Text>
            </TouchableOpacity>
          </View>
          <View>
            <Ionicons name="location" size={24} color="#3EC5D7" />
            <Text style={{color: '#fff'}}>Endereço</Text>
            <Text style={{color: '#fff'}}>{local?.endereco}</Text>
            <Text style={{color: '#fff'}}>Horário de funcionamento</Text>
            <Text style={{color: '#fff'}}>{local?.horarioFuncionamento}</Text>
          </View>
        </View> 

        );
      case 'Avaliações':
        return (
          <View>
            <Text style={{color: '#fff'}}>Conteúdo das Avaliações</Text>
          </View>
        );
      case 'Acessibilidade':
        return (
          <View>
            <Text style={{color: '#fff'}}>Conteúdo de Acessibilidade</Text>
          </View>
        );
      default:
        return null;
        
    }
    
  };

  return (
    <View style={styles.container}>
      <View style={styles.abas}>
        <TouchableOpacity onPress={() => setAbaAtiva('Visão geral')} style={{ flex: 1 }}>
          <Text style={[styles.aba, abaAtiva === 'Visão geral' && styles.abaAtiva]}>
            Visão geral
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setAbaAtiva('Avaliações')} style={{ flex: 1 }}>
          <Text style={[styles.aba, abaAtiva === 'Avaliações' && styles.abaAtiva]}>
            Avaliações
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setAbaAtiva('Acessibilidade')} style={{ flex: 1 }}>
          <Text style={[styles.aba, abaAtiva === 'Acessibilidade' && styles.abaAtiva,]} >
            Acessibilidade
          </Text>
        </TouchableOpacity>
      </View>

      {renderConteudo()}
    </View>
  );
}


const styles = StyleSheet.create ({

  container: { 
    flex: 1, 
    backgroundColor: '#141414' 
  },
  abas: { 
    flexDirection: 'row', 
    borderBottomWidth: 1, 
    borderBottomColor: '#2A2A2A', 
    justifyContent: 'space-between',
  },
  aba: { 
    textAlign: 'center', 
    paddingVertical: 10,
    paddingHorizontal: 20, 
    color: '#9AA0A6' ,
    includeFontPadding: false,
  },
  abaAtiva: { 
    color: '#3EC5D7', 
    borderBottomWidth: 2, 
    borderBottomColor: '#3EC5D7' ,
    includeFontPadding: false,
  },
  botoes: { 
    flexDirection: 'row', 
    padding: 20 
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
    marginTop: 10 
  },

})