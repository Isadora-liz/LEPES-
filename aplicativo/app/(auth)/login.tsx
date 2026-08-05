import { Link, useRouter } from 'expo-router';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from 'react';
import { Image, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Login() {
      const [email, setEmail] = useState('');
      const [senha, setSenha] = useState('');
      const router = useRouter();
      const auth = getAuth()

      const Logar = async () => {
        if (!email || !senha) {
        console.warn("Por favor, preencha todos os campos.");
        return;
    }
         try {
          const userCredential = await signInWithEmailAndPassword(auth, email.trim(), senha.trim());
          console.log("Usuário logado com sucesso:", userCredential);
          router.push('/explorar');
    }
        catch (e) {
           console.error("Email ou senha incorretos. Por favor, tente novamente.", e);
    }
}


  return (
  
    <View style={styles.container}>
      <ImageBackground
            source={require('../../assets/images/caricatura_volei (2).png')}
            style={styles.imageBackground}
            resizeMode='cover'
            imageStyle={{ opacity: 0.3}}
      />

      <View style={styles.conteudos}>
        <Image
        source={require('../../assets/images/logo_LEPES.png')}
        style={{ width: 200, height: 200, marginBottom: 20 }}
        resizeMode="contain"
      />
        <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />

      <TouchableOpacity style={styles.botao} onPress={Logar}>
        <Text style={styles.textoBotao}>Entrar</Text>
      </TouchableOpacity>
      <Text style={{color: '#ffffff'}}> ou </Text>
      <TouchableOpacity style={styles.botaoGoogle} onPress={() => {
        // Lógica para login com Google
      }}>
        <Text style={styles.textoBotaoGoogle}>Entrar com o Google</Text>
      </TouchableOpacity>
      <Link href="./cadastro" >
            <Text style={{color: '#ffffff', width: '100%'}}>cadastre-se</Text>
      </Link>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  conteudos: {
    position: 'absolute',
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    width: '90%',
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 25,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  botao: {
    backgroundColor: '#119fb8',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: '100%',
  },
  botaoGoogle: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: '100%',
  },
  textoBotao: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    alignSelf: 'center',
  },
  textoBotaoGoogle: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
    alignSelf: 'center',
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
  },
  
});
