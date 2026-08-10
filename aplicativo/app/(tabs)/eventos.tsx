import { Feather } from "@expo/vector-icons";

import {
  collection,
  doc,
  getDoc,
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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import FotoPerfil from "@/componentes/FotoPerfil";
import EventoCard from "../../componentes/Eventos";
import { auth, db } from "../../FirebaseConfig";


interface UsuarioData {
  imagem?: string;
  nome?: string;
  email?: string;
}


export default function Eventos() {

  const [eventos, setEventos] = useState<any[]>([]);
  const [busca, setBusca] = useState("");

  const [usuario, setUsuario] =
    useState<UsuarioData | null>(null);

  const [
    modalidadesSelecionadas,
    setModalidadesSelecionadas,
  ] = useState<string[]>([]);

  async function buscarUsuarioLogado() {

    try {

      const user = auth.currentUser;

      if (!user) {
        console.log("Usuário não está logado");
        return;
      }

      const usuarioRef = doc(
        db,
        "usuarios",
        user.uid
      );

      const usuarioSnap =
        await getDoc(usuarioRef);

      if (usuarioSnap.exists()) {

        setUsuario(
          usuarioSnap.data() as UsuarioData
        );

      }

    } catch (error) {

      console.log(
        "Erro ao buscar usuário:",
        error
      );

    }

  }

  async function buscarEventos() {

    try {

      const snapshot = await getDocs(
        collection(db, "eventos")
      );

      const lista = snapshot.docs.map(
        (documento: { id: any; data: () => any; }) => ({
          id: documento.id,
          ...documento.data(),
        })
      );

      setEventos(lista);

    } catch (error) {

      console.log(
        "Erro ao buscar eventos:",
        error
      );

    }

  }


  useEffect(() => {

    buscarUsuarioLogado();
    buscarEventos();

  }, []);

  function alternarModalidade(
    modalidade: string
  ) {

    setModalidadesSelecionadas(
      (modalidadesAnteriores) => {

        const estaSelecionada =
          modalidadesAnteriores.includes(
            modalidade
          );

        if (estaSelecionada) {

          return modalidadesAnteriores.filter(
            (item) =>
              item !== modalidade
          );

        }

        return [
          ...modalidadesAnteriores,
          modalidade,
        ];

      }
    );

  }

  const eventosFiltrados =
    eventos.filter((item) => {

      const texto =
        busca.trim().toLowerCase();

      const correspondeBusca =
        item.nome
          ?.toLowerCase()
          .includes(texto)
        ||
        item.endereco
          ?.toLowerCase()
          .includes(texto);

      const correspondeModalidade =
        modalidadesSelecionadas.length === 0
        ||
        modalidadesSelecionadas.includes(
          item.modalidade
        );

      return (
        correspondeBusca &&
        correspondeModalidade
      );

    });


  return (

    <SafeAreaView
      style={styles.conteudos}
      edges={["top"]}
    >

      <ImageBackground
        source={require(
          "../../assets/images/fundo_volei.jpg"
        )}
        style={styles.imageBackground}
        resizeMode="cover"
        imageStyle={{
          opacity: 0.6,
        }}
      >

        <View style={styles.container}>

          <View style={styles.topo}>

            <Text style={styles.titulo}>
              Eventos
            </Text>

            <View style={styles.perfil}>

              <FotoPerfil
                imagem={usuario?.imagem ?? ""}
              />

            </View>

          </View>

          <View style={styles.containerBusca}>

            <Feather
              name="search"
              size={20}
              color="#64748B"
            />

            <TextInput
              style={styles.busca}
              placeholder="Buscar eventos..."
              placeholderTextColor="#64748B"
              value={busca}
              onChangeText={setBusca}
            />

          </View>

          <View style={styles.containerFiltros}>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.scrollFiltros}
              contentContainerStyle={styles.filtros}
            >

              <TouchableOpacity
                style={[
                  styles.botaoFiltro,

                  modalidadesSelecionadas.includes(
                    "Futebol"
                  ) &&
                  styles.botaoFiltroAtivo,
                ]}
                onPress={() =>
                  alternarModalidade("Futebol")
                }
                activeOpacity={0.7}
              >

                <Text
                  style={[
                    styles.textoFiltro,

                    modalidadesSelecionadas.includes(
                      "Futebol"
                    ) &&
                    styles.textoFiltroAtivo,
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
                  ) &&
                  styles.botaoFiltroAtivo,
                ]}
                onPress={() =>
                  alternarModalidade("Basquete")
                }
                activeOpacity={0.7}
              >

                <Text
                  style={[
                    styles.textoFiltro,

                    modalidadesSelecionadas.includes(
                      "Basquete"
                    ) &&
                    styles.textoFiltroAtivo,
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
                  ) &&
                  styles.botaoFiltroAtivo,
                ]}
                onPress={() =>
                  alternarModalidade("Vôlei")
                }
                activeOpacity={0.7}
              >

                <Text
                  style={[
                    styles.textoFiltro,

                    modalidadesSelecionadas.includes(
                      "Vôlei"
                    ) &&
                    styles.textoFiltroAtivo,
                  ]}
                >
                  🏐 Vôlei
                </Text>

              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.botaoFiltro,

                  modalidadesSelecionadas.includes(
                    "Skate"
                  ) &&
                  styles.botaoFiltroAtivo,
                ]}
                onPress={() =>
                  alternarModalidade("Skate")
                }
                activeOpacity={0.7}
              >

                <Text
                  style={[
                    styles.textoFiltro,

                    modalidadesSelecionadas.includes(
                      "Skate"
                    ) &&
                    styles.textoFiltroAtivo,
                  ]}
                >
                  🛹 Skate
                </Text>

              </TouchableOpacity>

            </ScrollView>

          </View>

          <FlatList
            style={styles.lista}
            data={eventosFiltrados}
            keyExtractor={(item) =>
              String(item.id)
            }
            renderItem={({ item }) => (

              <EventoCard
                {...item}
              />

            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={
              styles.listaEventos
            }
          />

        </View>

      </ImageBackground>

    </SafeAreaView>

  );

}



const styles = StyleSheet.create({

  conteudos: {
    flex: 1,
    padding: 0,
    margin: 0,
  },


  imageBackground: {
    flex: 1,
    width: "100%",
  },


  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 0,
  },

  topo: {
    width: "100%",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    minHeight: 70,

    marginBottom: 8,
  },


  titulo: {
    fontSize: 32,
    lineHeight: 38,

    fontWeight: "bold",
    color: "#fff",

    margin: 0,
    padding: 0,

    includeFontPadding: false,
  },


  perfil: {
    alignItems: "center",
    justifyContent: "center",

    margin: 0,
    padding: 0,
  },

  containerBusca: {
    height: 52,

    flexDirection: "row",
    alignItems: "center",

    backgroundColor:
      "rgba(255, 255, 255, 0.94)",

    borderRadius: 18,

    paddingHorizontal: 16,

    marginBottom: 10,

    borderWidth: 1,

    borderColor:
      "rgba(62, 197, 215, 0.35)",

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

  containerFiltros: {
    height: 54,

    marginBottom: 8,

    justifyContent: "center",
  },


  scrollFiltros: {
    flexGrow: 0,
  },


  filtros: {
    flexDirection: "row",
    alignItems: "center",

    paddingVertical: 5,
    paddingRight: 10,
  },


  botaoFiltro: {
    height: 42,

    backgroundColor: "#fff",

    paddingHorizontal: 18,

    borderRadius: 21,

    marginRight: 10,

    justifyContent: "center",
    alignItems: "center",

    borderWidth: 1,
    borderColor: "transparent",
  },


  textoFiltro: {
    fontSize: 15,

    lineHeight: 20,

    color: "#222",

    textAlign: "center",

    includeFontPadding: false,
  },


  botaoFiltroAtivo: {
    backgroundColor: "#3EC5D7",
    borderColor: "#3EC5D7",
  },


  textoFiltroAtivo: {
    color: "#fff",
    fontWeight: "700",
  },

  lista: {
    flex: 1,
  },


  listaEventos: {
    paddingBottom: 20,
  },

});