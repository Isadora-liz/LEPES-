import {
    doc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

import { db } from "./firebase.js";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const docRef = doc(db, "espaco", id);
const docSnap = await getDoc(docRef);

if (docSnap.exists()) {

    const espaco = docSnap.data();

    document.getElementById("nome").value = espaco.nome;
    document.getElementById("endereco").value = espaco.endereco;
    document.getElementById("descricao").value = espaco.descricao;

    espaco.modalidades.forEach((modalidade) => {

        const checkbox = document.querySelector(
            `input[value="${modalidade}"]`
        );

        if (checkbox) {
            checkbox.checked = true;
        }

    });

    espaco.acessibilidade.forEach((acessibilidade) => {

        const checkbox = document.querySelector(
            `input[value="${acessibilidade}"]`
        );

        if (checkbox) {
            checkbox.checked = true;
        }

    });

} else {

    alert("Espaço não encontrado.");

}

document.getElementById("form-local").addEventListener("submit", async (e) => {

    e.preventDefault();

    const nome = document.getElementById("nome").value;
    const endereco = document.getElementById("endereco").value;
    const descricao = document.getElementById("descricao").value;
    const modalidades = [];
    const acessibilidade = [];

    document
        .querySelectorAll('input[name="modalidades[]"]:checked')
        .forEach((checkbox) => {
            modalidades.push(checkbox.value);
        });

    document
        .querySelectorAll('input[name="acessibilidade[]"]:checked')
        .forEach((checkbox) => {
            acessibilidade.push(checkbox.value);
        });

    await updateDoc(doc(db, "espaco", id), {

        nome,
        endereco,
        descricao,
        modalidades,
        acessibilidade

    });

    alert("Espaço atualizado com sucesso!");

    window.location.href = "explorar.html";

});