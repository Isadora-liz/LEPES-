
import { useEffect, useState } from "react";
import {
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";

import { auth, db } from "../FirebaseConfig";

type FotoPerfilProps = {
  imagem: string;
};

export default function FotoPerfil({ imagem }: FotoPerfilProps) {
  const router = useRouter();
  const [fotoAtual, setFotoAtual] = useState(imagem);

  useEffect(() => {
    // Mantém a foto recebida pelo componente como valor inicial
    setFotoAtual(imagem);
  }, [imagem]);

  useEffect(() => {
    let cancelarFoto: (() => void) | undefined;

    const cancelarAuth = onAuthStateChanged(auth, (usuarios: { uid: any; }) => {
      // Cancela a observação anterior, se existir
      cancelarFoto?.();
      cancelarFoto = undefined;

      if (!usuarios) {
        setFotoAtual("");
        return;
      }

      const referenciaUsuario = doc(db, "usuarios", usuarios.uid);

      cancelarFoto = onSnapshot(
        referenciaUsuario,
        (snapshot: { exists: () => any; data: () => any; }) => {
          if (snapshot.exists()) {
            const dados = snapshot.data();
            setFotoAtual(dados.imagem || "");
          } else {
            setFotoAtual("");
          }
        },
        (erro: any) => {
          console.log("Erro ao atualizar foto de perfil:", erro);
        }
      );
    });

    return () => {
      cancelarAuth();
      cancelarFoto?.();
    };
  }, []);

  const abrirPerfil = () => {
    if (auth.currentUser) {
      router.push("/perfil");
    } else {
      router.push("/login");
    }
  };

  return (
    <TouchableOpacity
      style={styles.botao}
      onPress={abrirPerfil}
    >
      <Image
        source={
          fotoAtual
            ? { uri: fotoAtual }
            : require("../assets/images/avatar.png")
        }
        style={styles.avatar}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: "#00bcd4",
    marginLeft: "68%",
    marginBottom: 10,
    marginTop: 10,
  },

  botao: {
    width: 30,
    marginLeft: "48%",
  },
});
