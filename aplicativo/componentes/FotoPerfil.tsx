import { Image, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { auth } from "../FirebaseConfig";

type FotoPerfilProps = {
    imagem: string;
};

export default function FotoPerfil({ imagem }: FotoPerfilProps) {
    const router = useRouter();

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
                    imagem
                        ? { uri: imagem }
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