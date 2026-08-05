import {
    doc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

import { db } from "./firebase.js";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const docRef = doc(db, "eventos", id);
const docSnap = await getDoc(docRef);

if (docSnap.exists()) {

    const evento = docSnap.data();

    const dataEvento = evento.data.toDate();

    document.getElementById("nome").value = evento.nome;
    document.getElementById("endereco").value = evento.endereco;
    document.getElementById("descricao").value = evento.descricao;

    document.getElementById("data").value =
        dataEvento.toISOString().split("T")[0];

    document.getElementById("horario").value =
        dataEvento.toTimeString().slice(0, 5);

    evento.modalidades.forEach((modalidade) => {

        const checkbox = document.querySelector(
            `input[value="${modalidade}"]`
        );

        if (checkbox) {
            checkbox.checked = true;
        }

     });

    evento.acessibilidade.forEach((acessibilidade) => {

        const checkbox = document.querySelector(
            `input[value="${acessibilidade}"]`
        );

        if (checkbox) {
            checkbox.checked = true;
        }

    });

} else {

    alert("Evento não encontrado.");

}

document.getElementById("form-evento").addEventListener("submit", async (e) => {

    e.preventDefault();

    const nome = document.getElementById("nome").value;
    const endereco = document.getElementById("endereco").value;
    const descricao = document.getElementById("descricao").value;
    const data = document.getElementById("data").value;
    const horario = document.getElementById("horario").value;
    const dataHora = new Date(`${data}T${horario}:00`);
    const modalidades = [];
    const acessibilidade = [];

    document
        .querySelectorAll('input[name="acessibilidade[]"]:checked')
        .forEach((checkbox) => {
            acessibilidade.push(checkbox.value);
        });

    document
        .querySelectorAll('input[name="modalidades[]"]:checked')
        .forEach((checkbox) => {
            modalidades.push(checkbox.value);
        });

    await updateDoc(doc(db, "eventos", id), {

        nome,
        endereco,
        descricao,
        data: dataHora,
        modalidades,
        acessibilidade

    });

    alert("Evento atualizado com sucesso!");

    window.location.href = "eventos.html";

});