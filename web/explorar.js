import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

let filtroSelecionado = null;

function semAcento(texto) {
    if (!texto) return "";

    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

function debounce(fn, wait = 150) {

    let timeout;

    return function (...args) {

        clearTimeout(timeout);

        timeout = setTimeout(
            () => fn.apply(this, args),
            wait
        );
    };
}

function aplicaFiltro() {

    const termo = semAcento(
        document.getElementById("campo-busca").value
    );

    const cards =
        document.querySelectorAll(".lugar-card");

    cards.forEach(card => {

        const textoCard =
            semAcento(card.textContent || "");

        const modalidades =
            JSON.parse(
                card.dataset.modalidades || "[]"
            );

        const textoOk =
            termo === "" ||
            textoCard.includes(termo);

        const modalidadeOk =
            !filtroSelecionado ||
            modalidades.includes(
                Number(filtroSelecionado)
            );

        card.style.display =
            textoOk && modalidadeOk
                ? "flex"
                : "none";
    });
}

function configurarBusca() {

    document
        .getElementById("campo-busca")
        .addEventListener(
            "input",
            debounce(aplicaFiltro)
        );
}

function configurarFiltros() {

    document
        .querySelectorAll(".bot-modalidade")
        .forEach(bot => {

            bot.addEventListener("click", () => {

                const id = bot.dataset.id;

                if (filtroSelecionado === id) {

                    filtroSelecionado = null;

                    bot.classList.remove(
                        "ativo"
                    );

                } else {

                    filtroSelecionado = id;

                    document
                        .querySelectorAll(
                            ".bot-modalidade"
                        )
                        .forEach(b =>
                            b.classList.remove(
                                "ativo"
                            )
                        );

                    bot.classList.add(
                        "ativo"
                    );
                }

                aplicaFiltro();
            });
        });
}

async function carregarExplorar() {

    console.log("Função iniciou");


    const container =
        document.getElementById(
            "lista-lugares"
        );

    container.innerHTML = "";

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "espaco"
                )
            );

         console.log("Quantidade de documentos:", snapshot.size);

        snapshot.forEach(doc => {

             console.log("ID:", doc.id);
            console.log("Dados:", doc.data());

            const lugar = doc.data();

            const div =
                document.createElement("div");

            div.classList.add(
                "lugar-card"
            );

            div.dataset.id = doc.id;

            div.dataset.modalidades =
                JSON.stringify(
                    lugar.modalidades_ids || []
                );

            div.innerHTML = `
                <img
                    src="${lugar.imagem}"
                    alt="${lugar.nome}"
                    class="lugar-img"
                >

                <div class="info">

                    <h3 class="titulo-local">
                        ${lugar.nome}
                    </h3>

                    <p class="endereco">
                        ${lugar.endereco}
                    </p>

                    <p>
                        ${lugar.descricao}
                    </p>

                </div>
            `;

            container.appendChild(div);
        });

        aplicaFiltro();

    } catch (erro) {

        console.error(
            "Erro ao carregar espaços:",
            erro
        );
    }
}

document.addEventListener(
    "DOMContentLoaded",
    () => {

        configurarBusca();

        configurarFiltros();

        carregarExplorar();
    }
);