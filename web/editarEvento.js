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

    document.getElementById("nome").value = evento.nome;
    document.getElementById("endereco").value = evento.endereco;
    document.getElementById("descricao").value = evento.descricao;
    document.getElementById("dataInicio").value =  evento.dataInicio.toDate().toISOString().split("T")[0];
    document.getElementById("dataFim").value =  evento.dataFim.toDate().toISOString().split("T")[0];
    document.getElementById("horarioInicio").value = evento.horarioInicio;
    document.getElementById("horarioFim").value = evento.horarioFim;


    evento.modalidades.forEach((modalidade) => {

        const checkbox = document.querySelector(
            `input[value="${modalidade}"]`
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
    const dataInicio = document.getElementById("dataInicio").value;
    const dataFim = document.getElementById("dataFim").value;
    const horarioInicio = document.getElementById("horarioInicio").value;
    const horarioFim = document.getElementById("horarioFim").value;
    const descricao = document.getElementById("descricao").value;
    
    const modalidades = evento.modalidades || [];

document.querySelectorAll('input[name="modalidades[]"]').forEach((checkbox) => {

    if (modalidades.includes(checkbox.value)) {
        checkbox.checked = true;
    }

});

    await updateDoc(doc(db, "eventos", id), {

        nome,
        endereco,
        descricao,
        dataInicio,
        horarioFim,
        horarioInicio,
        dataFim,
        modalidades,
        imagem

    });

    alert("Evento atualizado com sucesso!");

    window.location.href = "eventos.html";

});