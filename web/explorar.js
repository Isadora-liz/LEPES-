import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";


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
        document
            .getElementById("busca-container")
            .value
    );


    const cards =
        document.querySelectorAll(".card");


    cards.forEach(card => {

        const textoCard =
            semAcento(
                card.textContent || ""
            );


        const modalidades =
            JSON.parse(
                card.dataset.modalidades || "[]"
            );


        const textoOk =
            termo === "" ||
            textoCard.includes(termo);


        const modalidadeOk =
            !filtroSelecionado ||
            modalidades.some(modalidade =>
                semAcento(modalidade) ===
                semAcento(filtroSelecionado)
            );


        card.style.display =
            textoOk && modalidadeOk
                ? "flex"
                : "none";
    });
}


function configurarBusca() {

    document
        .getElementById("busca-container")
        .addEventListener(
            "input",
            debounce(aplicaFiltro)
        );
}



function configurarFiltros() {

    document
        .querySelectorAll(".bot-modalidade")
        .forEach(bot => {

            bot.addEventListener(
                "click",
                () => {

                    const modalidade =
                        bot.dataset.modalidade;


                    // Clicou novamente no filtro
                    if (
                        filtroSelecionado === modalidade
                    ) {

                        filtroSelecionado = null;

                        bot.classList.remove(
                            "ativo"
                        );

                    } else {

                        filtroSelecionado =
                            modalidade;


                        // Remove ativo dos outros
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
                }
            );
        });
}


// ===============================
// CRIAR BOTÕES DAS MODALIDADES
// ===============================

function criarFiltrosModalidades(listaEspacos) {

    const container =
        document.getElementById(
            "filtros-modalidades"
        );


    container.innerHTML = "";


    // Junta todas as modalidades de todos os espaços
    const todasModalidades =
        listaEspacos.flatMap(
            espaco => espaco.modalidades || []
        );


    // Remove modalidades repetidas
    const modalidadesUnicas =
        [...new Set(todasModalidades)];


    modalidadesUnicas.forEach(
        modalidade => {

            const botao =
                document.createElement("button");


            botao.classList.add(
                "bot-modalidade"
            );


            // Guarda o nome da modalidade
            botao.dataset.modalidade =
                modalidade;


            botao.textContent =
                modalidade;


            container.appendChild(
                botao
            );
        }
    );


    // Agora que os botões existem,
    // adicionamos os eventos de clique
    configurarFiltros();
}


// ===============================
// CARREGAR ESPAÇOS
// ===============================

async function carregarExplorar() {

    console.log(
        "Função iniciou"
    );


    const container = document.getElementById( "cards-container");


    container.innerHTML = "";


    try {

        const snapshot =
            await getDocs(
                collection(db, "espaco")
            );


        console.log(
            "Quantidade de documentos:",
            snapshot.size
        );


        // Guarda os espaços para posteriormente
        // criar os filtros
        const listaEspacos = [];


        snapshot.forEach(doc => {

            console.log(
                "ID:",
                doc.id
            );


            console.log(
                "Dados:",
                doc.data()
            );


            const lugar =
                doc.data();


            listaEspacos.push(
                lugar
            );


            const div =
                document.createElement("div");


            div.classList.add(
                "card"
            );


            div.dataset.id =
                doc.id;


            // Agora guardamos as modalidades
            // como nomes, e não como IDs
            div.dataset.modalidades =
                JSON.stringify(
                    lugar.modalidades || []
                );


            div.innerHTML = `

                <button class="botao-editar">
                    <span class="material-icons">
                        edit
                    </span>
                </button>

                <img
                    src="${lugar.imagem}"
                    alt="${lugar.nome}"
                    class="card-image"
                >

                <div class="card-content">

                    <h3 class="card-titulo">
                        ${lugar.nome}
                    </h3>

                    <p class="card-endereco">
                        ${lugar.endereco}
                    </p>

                    <p class="card-descricao">
                        ${lugar.descricao}
                    </p>

                </div>
            `;


            container.appendChild(
                div
            );


            const botaoEditar =
                div.querySelector(
                    ".botao-editar"
                );


            botaoEditar.addEventListener(
                "click",
                () => {

                    window.location.href =
                        `editarLocal.html?id=${doc.id}`;

                }
            );
        });


        // Cria os botões usando as modalidades
        // que realmente existem nos espaços
        criarFiltrosModalidades(
            listaEspacos
        );


        aplicaFiltro();


    } catch (erro) {

        console.error(
            "Erro ao carregar espaços:",
            erro
        );
    }
}


// ===============================
// SETAS
// ===============================

function configurarSetas() {

    const filtros =
        document.getElementById(
            "filtros-modalidades"
        );


    document
        .getElementById("seta-dir")
        .addEventListener(
            "click",
            () => {

                filtros.scrollLeft += 200;

            }
        );


    document
        .getElementById("seta-esq")
        .addEventListener(
            "click",
            () => {

                filtros.scrollLeft -= 200;

            }
        );
}


// ===============================
// INICIALIZAÇÃO
// ===============================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        configurarBusca();

        configurarSetas();

        carregarExplorar();
    }
);