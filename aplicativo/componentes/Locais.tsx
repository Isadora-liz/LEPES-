import { router } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';

interface LocaisProps {
  id: string | number;
  nome: string;
  descricao: string;
  endereco: string;
  imagem: string;
}

export default function Locais({ id, nome, descricao, endereco, imagem }: LocaisProps) {
  return (
    <Card
      onPress={() => router.push(`/detalhesCards/DetalhesLocais?id=${id}`)}
      style={styles.card}
    >
      <Card.Cover source={{ uri: imagem }} />
      <Card.Title title={nome} />
      
      <Card.Content>
        <Text>{descricao}</Text>
      </Card.Content>

      <Card.Content>
        <Text>{endereco}</Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
  marginBottom: 10,
  borderRadius: 10,
  overflow: 'hidden',

  },
  imagem: {
  height: 100,
  width: "50%"

},
 titulo: {
    fontWeight: 'bold',
  },
  conteudo: {
    gap: 6,
  },
  descricao: {
    color: '#444',
  },
  endereco: {
    color: '#666',
    fontSize: 12,
  },
});