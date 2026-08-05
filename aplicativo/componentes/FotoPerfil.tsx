import { Image, StyleSheet, TouchableOpacity } from "react-native";

type FotoPerfilProps = {
    navigation: any;
    foto?: string;
};

export default function FotoPerfil({ navigation, foto }: FotoPerfilProps) {
    return (
        <TouchableOpacity
            onPress={() => navigation.navigate("Perfil")}
        >
            <Image
                source={{
                    uri: foto || "https://via.placeholder.com/150",
                }}
                style={styles.avatar}
            />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    avatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        borderWidth: 2,
        borderColor: "#7C3AED",
    },
});