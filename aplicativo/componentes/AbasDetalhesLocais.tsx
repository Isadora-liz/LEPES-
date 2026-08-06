import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';


interface AbasProps {
  style?: StyleProp<ViewStyle>;
}


export default function Abas({ style }: AbasProps) {
  const [abaAtiva, setAbaAtiva] = useState('Visão geral');
  const renderConteudo = () => {
    switch (abaAtiva) {
      case 'Visão geral':
        return (
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
        );
      case 'Avaliações':
        return (
          <View>
            <Text>Conteúdo das Avaliações</Text>
          </View>
        );
      case 'Acessibilidade':
        return (
          <View>
            <Text>Conteúdo de Acessibilidade</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Abas Clicáveis */}
      <View style={styles.abas}>
        <TouchableOpacity onPress={() => setAbaAtiva('Visão geral')}>
          <Text style={[styles.aba, abaAtiva === 'Visão geral' && styles.abaAtiva]}>
            Visão geral
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setAbaAtiva('Avaliações')}>
          <Text style={[styles.aba, abaAtiva === 'Avaliações' && styles.abaAtiva]}>
            Avaliações
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setAbaAtiva('Acessibilidade')}>
          <Text style={[styles.aba, abaAtiva === 'Acessibilidade' && styles.abaAtiva]}>
            Acessibilidade
          </Text>
        </TouchableOpacity>
      </View>

      {/* Exibição Dinâmica do Conteúdo */}
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
    flex: 1, 
    textAlign: 'center', 
    paddingVertical: 14, 
    color: '#9AA0A6' ,
    includeFontPadding: false,
    width: '100%',
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