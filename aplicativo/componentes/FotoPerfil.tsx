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
        width: 45,
        height: 45,
        borderRadius: 26,
        borderWidth: 2,
        borderColor: "#00bcd4",
        marginLeft: "68%",
        marginBottom: 10,
        marginTop: 10,
    },
});