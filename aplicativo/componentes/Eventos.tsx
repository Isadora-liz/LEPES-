import { router } from 'expo-router';
import { Image, StyleSheet, View, TouchableOpacity} from 'react-native';
import { Card, Text, } from 'react-native-paper';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import{useState} from 'react';

interface EventosProps {
  id: string | number;
  nome: string;
  descricao: string;
  endereco: string;
  imagem: string;
}

export default function EventoCard({ id, nome, descricao, endereco, imagem, }: EventosProps) {
  const [notificacaoAtiva, setNotificacaoAtiva] = useState(false);
  const [interesse, setInteresse] = useState(false);

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
          onPress={(e) => {
            e.stopPropagation();
            setNotificacaoAtiva(!notificacaoAtiva);
          }}
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
          interesse && styles.botaoInteresseAtivo,
        ]}
        activeOpacity={0.85}
        onPress={(e) => {
          e.stopPropagation();
          setInteresse(!interesse);
        }}
      >
        <Text style={styles.textoBotaoInteresse}>
          {interesse ? "Interesse marcado" : "Marcar interesse"}
        </Text>
      </TouchableOpacity>
    </Card>
  );
}




const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
    borderRadius: 10,
    overflow: 'hidden',
    minHeight: 170,
    margin:20,

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