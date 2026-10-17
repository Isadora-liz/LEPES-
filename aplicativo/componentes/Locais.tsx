
import { router } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';

interface LocaisProps {
  id: string | number;
  nome: string;
  descricao: string;
  endereco: string;
  imagem: string | string[];
}

export default function Locais({
  id,
  nome,
  descricao,
  endereco,
  imagem,
}: LocaisProps) {
  // Se imagem for um array, seleciona a primeira URL válida.
  const primeiraImagem = Array.isArray(imagem)
    ? imagem.find(
        (url) => typeof url === 'string' && url.trim() !== ''
      )
    : imagem;

  console.log('URL recebida:', imagem);
  console.log('Primeira imagem:', primeiraImagem);

  return (
    <Card
      onPress={() =>
        router.push(`/detalhesCards/DetalhesLocais?id=${id}`)
      }
      style={styles.card}
    >
      {typeof primeiraImagem === 'string' &&
        primeiraImagem.trim() !== '' && (
          <Card.Cover
            source={{ uri: primeiraImagem }}
            onError={(e) =>
              console.log(
                'Erro ao carregar imagem:',
                e.nativeEvent
              )
            }
            style={styles.imagem}
          />
        )}

      <Card.Title title={nome} />

      <Card.Content>
        <Text>{descricao}</Text>
      </Card.Content>

      <Card.Content>
        <Text>📍 {endereco}</Text>
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
    height: 200,
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
