import {
  collection,
  getDocs,
} from "firebase/firestore";

import {
  useEffect,
  useState,
} from "react";

import {
  FlatList,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import EventoCard from "../../componentes/Eventos";
import { db } from "../../FirebaseConfig";
import { Feather } from "@expo/vector-icons";
import { documentSnapshotFromJSON } from "firebase/firestore";


export default function Eventos() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [busca, setBusca] = useState("");

  // Guarda todas as modalidades selecionadas
  const [
    modalidadesSelecionadas,
    setModalidadesSelecionadas,
  ] = useState<string[]>([]);


  useEffect(() => {
    async function buscarEventos() {
      try {
        const snapshot = await getDocs(
          collection(db, "eventos")
        );

        const lista = snapshot.docs.map((documentos) => ({
          id: documentos.id,
          ...documentos.data(),
        }));

        setEventos(lista);
      } catch (error) {
        console.log("Erro ao buscar eventos:", error);
      }
    }

    buscarEventos();
  }, []);


  // Seleciona ou desmarca uma modalidade
  function alternarModalidade(modalidade: string) {
    setModalidadesSelecionadas((modalidadesAnteriores) => {
      const estaSelecionada =
        modalidadesAnteriores.includes(modalidade);

      if (estaSelecionada) {
        return modalidadesAnteriores.filter(
          (item) => item !== modalidade
        );
      }

      return [...modalidadesAnteriores, modalidade];
    });
  }


  const eventosFiltrados = eventos.filter((item) => {
    const texto = busca.trim().toLowerCase();

    const correspondeBusca =
      item.nome?.toLowerCase().includes(texto) ||
      item.endereco?.toLowerCase().includes(texto);

    /*
      Nenhuma modalidade selecionada:
      mostra todos os eventos.

      Uma ou mais selecionadas:
      mostra os eventos que correspondem a pelo menos
      uma das modalidades selecionadas.
    */
    const correspondeModalidade =
      modalidadesSelecionadas.length === 0 ||
      modalidadesSelecionadas.includes(item.modalidade);

    return correspondeBusca && correspondeModalidade;
  });


  return (
    <ImageBackground
      source={require("../../assets/images/fundo_volei.jpg")}
      style={styles.imageBackground}
      resizeMode="cover"
      imageStyle={{
        opacity: 0.6,
      }}
    >
      <SafeAreaView style={styles.conteudos}>
        <FlatList
          data={eventosFiltrados}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <EventoCard {...item} />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 1,
          }}
          ListHeaderComponent={
            <>
              <Text style={styles.titulo}>
                Eventos
              </Text>

            <View style={styles.containerBusca}>
  <Feather
    name="search"
    size={20}
    color="#64748B"
  />

  <TextInput
    style={styles.busca}
    placeholder="Buscar eventos ou endereços"
    placeholderTextColor="#94A3B8"
    value={busca}
    onChangeText={setBusca}
    returnKeyType="search"
    autoCorrect={false}
    selectionColor="#3ec5d7"
  />
      <Feather
        size={18}
        color="#64748B"
      />
</View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filtros}
              >
                <TouchableOpacity
                  style={[
                    styles.botaoFiltro,
                    modalidadesSelecionadas.includes(
                      "Futebol"
                    ) && styles.botaoFiltroAtivo,
                  ]}
                  onPress={() =>
                    alternarModalidade("Futebol")
                  }
                >
                  <Text
                    style={[
                      styles.textoFiltro,
                      modalidadesSelecionadas.includes(
                        "Futebol"
                      ) && styles.textoFiltroAtivo,
                    ]}
                  >
                    ⚽ Futebol
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.botaoFiltro,
                    modalidadesSelecionadas.includes(
                      "Basquete"
                    ) && styles.botaoFiltroAtivo,
                  ]}
                  onPress={() =>
                    alternarModalidade("Basquete")
                  }
                >
                  <Text
                    style={[
                      styles.textoFiltro,
                      modalidadesSelecionadas.includes(
                        "Basquete"
                      ) && styles.textoFiltroAtivo,
                    ]}
                  >
                    🏀 Basquete
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.botaoFiltro,
                    modalidadesSelecionadas.includes(
                      "Vôlei"
                    ) && styles.botaoFiltroAtivo,
                  ]}
                  onPress={() =>
                    alternarModalidade("Vôlei")
                  }
                >
                  <Text
                    style={[
                      styles.textoFiltro,
                      modalidadesSelecionadas.includes(
                        "Vôlei"
                      ) && styles.textoFiltroAtivo,
                    ]}
                  >
                    🏐 Vôlei
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </>
          }
        />
      </SafeAreaView>
    </ImageBackground>
  );
}


const styles = StyleSheet.create({
  imageBackground: {
    flex: 1,
    width: "100%",
  },

  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: "#7C3AED",
  },

  conteudos: {
  flex: 1,
  width: "100%",
  paddingHorizontal: 10,
  paddingTop: 0,
  paddingBottom: -30,
},

  titulo: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },

 containerBusca: {
  width: "100%",
  height: 52,
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "rgba(255, 255, 255, 0.94)",
  borderRadius: 18,
  paddingHorizontal: 16,
  marginBottom: 18,
  borderWidth: 1,
  borderColor: "rgba(62, 197, 215, 0.35)",

  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 3,
  },
  shadowOpacity: 0.1,
  shadowRadius: 8,

  elevation: 3,
},

busca: {
  flex: 1,
  height: "100%",
  marginLeft: 12,
  paddingVertical: 0,
  color: "#1E293B",
  fontSize: 15,
},

  filtros: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 18,
    paddingTop: 2,
    paddingVertical: 8,
    paddingRight: 20,
  },

  botaoFiltro: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    marginRight: 10,
    alignSelf: "flex-start",
    justifyContent: "center",
    alignItems: "center",
  },

  textoFiltro: {
    fontSize: 16,
    textAlignVertical: "center",
    paddingRight: 4,
    includeFontPadding: false,
  },

  botaoFiltroAtivo: {
    backgroundColor: "#3ec5d7",
    borderColor: "#3ec5d7",
  },

  textoFiltroAtivo: {
    color: "#fff",
    fontWeight: "700",
  },
});