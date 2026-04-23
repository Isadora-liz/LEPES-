import { router } from 'expo-router';
import { Card, Text } from 'react-native-paper';

interface LocaisProps {
  id: string | number;
  nome: string;
  descricao: string;
  imagem: string;
}

export default function Locais({ id, nome, descricao, imagem }: LocaisProps) {
  return (
    <Card
      onPress={() => router.push(`/detalhesCards/${id}`)}
      style={{ margin: 10 }}
    >
      <Card.Title title={nome} />
      
      <Card.Content>
        <Text>{descricao}</Text>
      </Card.Content>

      <Card.Cover source={{ uri: imagem }} />
    </Card>
  );
}