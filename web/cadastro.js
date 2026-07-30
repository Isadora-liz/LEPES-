import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { auth, db } from "./firebase.js";

document.querySelector(".cadastrar").addEventListener("click", async function(e) {
    e.preventDefault();

    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    const erroElemento = document.getElementById("mensagem-erro");
    erroElemento.textContent = "";

    if (!nome || !email || !senha) {
        erroElemento.textContent = "Por favor, preencha todos os campos.";
        erroElemento.style.display = "block";
        return;
    }
    
    try { 
        const userCredential = await createUserWithEmailAndPassword(
            auth, 
            email.trim(), 
            senha.trim()
        );
        const user = userCredential.user;


        console.log({
    nome,
    email,
    senha,

});

        await setDoc(doc(db, "usuarios", user.uid), {
        nome: nome,
        email: email
    });

        window.location.href = "explorar.html";


    } catch (error) {
       // console.error("Erro no Firebase:", error.code);
       console.log(error);
console.log(error.code);
console.log(error.message);

        if (error.code === 'auth/email-already-in-use') {
            erroElemento.textContent = "Este e-mail já está em uso. Por favor, use outro e-mail.";
        } 

        else if (error.code === 'auth/invalid-email') {
            erroElemento.textContent = "Por favor, insira um e-mail válido.";
        }

        else {
            erroElemento.textContent = "Ocorreu um erro ao tentar cadastrar o usuário.";
        }   

        erroElemento.style.display = "block";
    }
});