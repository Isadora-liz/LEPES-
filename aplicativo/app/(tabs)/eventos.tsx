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
import type { ComponentType } from "react";

import {
  Alert,
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
import { useLocalSearchParams } from "expo-router";
import { router } from "expo-router";
import { updateDoc } from "firebase/firestore";
import { arrayRemove } from "firebase/firestore";
import { arrayUnion } from "firebase/firestore";
//import { pedirPermissaoNotificacao, pegarTokenNotificacao } from "../../funcoes/notificacoes";
import { onSnapshot } from "firebase/firestore";

// The imported card is currently inferred as returning void. Normalize its
// type at this usage site so React can treat it as a component.
const EventoCardComponent = EventoCard as unknown as ComponentType<any>;


interface UsuarioData {
  imagem?: string;
  nome?: string;
  email?: string;
}


export default function Eventos() {

  const { id } = useLocalSearchParams();
  const [eventos, setEventos] = useState<any[]>([]);
  const [interesseMarcado, setInteresseMarcado] = useState(false);
  const [busca, setBusca] = useState("");
  const [usuario, setUsuario] = useState<UsuarioData | null>(null);
  const [modalidades, setModalidades] = useState<string[]>([]);
  const [modalidadesSelecionadas,setModalidadesSelecionadas,] = useState<string[]>([]);
  const [carregando, setCarregando,] = useState(true);
  const iconesModalidades: Record<string, string> = {
  Futsal: "⚽",
  Basquete: "🏀",
  Vôlei: "🏐",
  Skate: "🛹",
  Bocha: "🎯",
  Tênis: "🎾",
  "Tênis de mesa": "🏓",
  Futevôlei: "⚽",
  "Tênis de praia": "🎾",
  "Vôlei de praia": "🏐",
  "Corrida de rua": "🏃‍♂️",};

useEffect(() => {

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

   buscarUsuarioLogado();

   }, []);

  useEffect(() => {


      const unsubscribe = onSnapshot(
    collection(db, "eventos"),
    (snapshot: { docs: any[]; }) => {

      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      setEventos(lista);

      const todasModalidades = lista.flatMap(
        (eventos: any) => eventos.modalidades || []
      );

      const modalidadesUnicas: string[] = [
        ...new Set(todasModalidades)
      ].filter(
        (modalidade): modalidade is string =>
          typeof modalidade === "string"
      );

      setModalidades(modalidadesUnicas);
    }
  );


    return () => unsubscribe();


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

  function removerAcentos(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

  const eventosFiltrados =
    eventos.filter((item) => {

      const texto = removerAcentos(busca);

  const correspondeBusca =
    removerAcentos(item.nome || "").includes(texto) ||
    removerAcentos(item.endereco || "").includes(texto);


     const correspondeModalidade =
          modalidadesSelecionadas.length === 0 ||
          modalidadesSelecionadas.every((modalidade) =>
            item.modalidades?.includes(modalidade)
          );

      return (
        correspondeBusca &&
        correspondeModalidade
      );

    });

  
return(

    <SafeAreaView style={styles.conteudos} edges={["top"]}>

      <ImageBackground source={require( "../../assets/images/fundo_danilo.jpeg" )}
        style={styles.imageBackground}
        resizeMode="cover"
        imageStyle={{opacity: 0.6,}}
      >

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
          <View style={styles.container}>

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
              {modalidades.map((modalidade) => (
              <TouchableOpacity
                key={modalidade}
                style={[styles.botaoFiltro,
                modalidadesSelecionadas.includes(modalidade) &&
                styles.botaoFiltroAtivo,
               ]}
              onPress={() => alternarModalidade(modalidade)}
              activeOpacity={0.7}
              >
              {iconesModalidades[modalidade] && (
                <Text style={styles.iconeFiltro}>
                    {iconesModalidades[modalidade]}
                </Text>
              )}

                <Text
                style={[
                  styles.textoFiltro,
                  {minWidth: modalidade.length * 10,},
                  modalidadesSelecionadas.includes(modalidade) &&
                  styles.textoFiltroAtivo,
                ]}
                >
                    {modalidade}
                </Text>
              </TouchableOpacity>
             ))}
            </ScrollView>

          </View>

          <FlatList
            style={styles.lista}
            data={eventosFiltrados}
            keyExtractor={(item) =>
              String(item.id)
            }
            renderItem={({ item }) => (

              <EventoCardComponent
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
    marginBottom: 20,
    backgroundColor: '#202020',
    paddingHorizontal: 16,


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
    backgroundColor:"rgba(255, 255, 255, 0.94)",
    borderRadius: 18,
    paddingHorizontal: 16,
    marginBottom: 10,
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
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  borderWidth: 1,
  borderColor: "transparent",
  flexShrink: 0,
  alignSelf: "flex-start",
},

conteudoFiltro: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
},

iconeFiltro: {
  fontSize: 16,
  marginRight: 6,
},

textoFiltro: {
  fontSize: 15,
  lineHeight: 20,
  color: "#222",
  flexShrink: 0
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
  paddingBottom: 60,
  margin:-20,
  marginTop: -10,
  },


});
