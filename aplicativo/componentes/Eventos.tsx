import { router } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';

interface EventosProps {
  id: string | number;
  nome: string;
  descricao: string;
  endereco: string;
  imagem: string;
}

export default function EventoCard({ id, nome, descricao, endereco, imagem }: EventosProps) {
  return (
    <Card
      onPress={() => router.push(`/detalhesCards/DetalhesEventos?id=${id}`)}
      style={styles.card}
    >
      <Card.Cover source={{ uri: imagem }} />
      <Card.Title title={nome} titleStyle={styles.titulo} />
      
      <Card.Content style={styles.conteudo}>
        <Text style={styles.descricao}>{descricao}</Text>
        <Text style={styles.endereco}>{endereco}</Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 20,
    borderRadius: 35,
    marginHorizontal: 10,
    overflow: 'hidden', // Mantém a imagem dentro do border radius arredondado
  },
  titulo: {
    fontWeight: 'bold',
  },
  conteudo: {
    gap: 6, // Espaçamento limpo entre descrição e endereço
  },
  descricao: {
    color: '#444',
  },
  endereco: {
    color: '#666',
    fontSize: 12,
  },
});