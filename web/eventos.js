import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";


let filtroSelecionado = null;


// ===============================
// FUNÇÕES AUXILIARES
// ===============================

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


// ===============================
// APLICAR FILTRO
// ===============================

function aplicaFiltro() {

    const termo = semAcento(
        document
            .getElementById("busca-container")
            .value
    );


    const cards =
        document.querySelectorAll(".evento");


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


// ===============================
// BUSCA
// ===============================

function configurarBusca() {

    document
        .getElementById("busca-container")
        .addEventListener(
            "input",
            debounce(aplicaFiltro)
        );
}


// ===============================
// FILTROS
// ===============================

function configurarFiltros() {

    document
        .querySelectorAll(".bot-modalidade")
        .forEach(bot => {

            bot.addEventListener(
                "click",
                () => {

                    const modalidade =
                        bot.dataset.modalidade;


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
// CRIAR FILTROS DE MODALIDADES
// ===============================

function criarFiltrosModalidades(listaEventos) {

    const container =
        document.getElementById(
            "filtros-modalidades"
        );


    container.innerHTML = "";


    // Pega todas as modalidades de todos os eventos
    const todasModalidades =
        listaEventos.flatMap(
            evento => evento.modalidades || []
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


            botao.dataset.modalidade =
                modalidade;


            botao.textContent =
                modalidade;


            container.appendChild(
                botao
            );
        }
    );


    // Só configura depois que todos
    // os botões foram criados
    configurarFiltros();
}


// ===============================
// CARREGAR EVENTOS
// ===============================

async function carregarEventos() {

    console.log(
        "Função carregarEventos iniciou"
    );


    const container =
        document.getElementById(
            "lista-eventos"
        );


    container.innerHTML = "";


    try {

        const snapshot =
            await getDocs(
                collection(db, "eventos")
            );


        console.log(
            "Quantidade de documentos:",
            snapshot.size
        );


        const listaEventos = [];


        snapshot.forEach(docSnap => {

            console.log(
                "ID:",
                docSnap.id
            );


            console.log(
                "Dados:",
                docSnap.data()
            );


            const evento =
                docSnap.data();


            listaEventos.push(
                evento
            );


            const div =
                document.createElement("div");


            div.classList.add(
                "evento"
            );


            div.dataset.id =
                docSnap.id;


            div.dataset.modalidades =
                JSON.stringify(
                    evento.modalidades || []
                );


            div.innerHTML = `

                <div class="imagem-evento">

                    <img
                        src="${evento.imagem}"
                        alt="${evento.nome}"
                    >

                </div>


                <button class="botao-editar">

                    <i class="material-icons">
                        edit
                    </i>

                </button>


                <button class="botao-remover">

                    <i class="material-icons">
                        delete
                    </i>

                </button>


                <div class="info">

                    <span class="modalidade">
                        ${(evento.modalidades || []).join(" • ")}
                    </span>


                    <h2>
                        ${evento.nome || ""}
                    </h2>


                    <div class="detalhes">

                        <span>

                            <i class="material-icons">
                                event
                            </i>

                            ${
                                evento.data
                                    ? evento.data
                                        .toDate()
                                        .toLocaleDateString("pt-BR")
                                    : ""
                            }

                        </span>


                        <span>

                            <i class="material-icons">
                                schedule
                            </i>

                            ${
                                evento.data
                                    ? evento.data
                                        .toDate()
                                        .toLocaleTimeString(
                                            "pt-BR",
                                            {
                                                hour: "2-digit",
                                                minute: "2-digit"
                                            }
                                        )
                                    : ""
                            }

                        </span>

                    </div>


                    <div class="endereco">

                        <span>

                            <i class="material-icons">
                                location_on
                            </i>

                            ${evento.endereco || ""}

                        </span>

                    </div>


                    <p class="descricao">

                        ${evento.descricao || ""}

                    </p>

                </div>

            `;


            container.appendChild(
                div
            );


            // ===============================
            // EDITAR
            // ===============================

            const botaoEditar =
                div.querySelector(
                    ".botao-editar"
                );


            botaoEditar.addEventListener(
                "click",
                () => {

                    window.location.href =
                        `editarEvento.html?id=${docSnap.id}`;

                }
            );


            // ===============================
            // REMOVER
            // ===============================

            const botaoRemover =
                div.querySelector(
                    ".botao-remover"
                );


            botaoRemover.addEventListener(
                "click",
                async () => {

                    const confirmar =
                        confirm(
                            "Deseja realmente excluir este evento?"
                        );


                    if (!confirmar) return;


                    try {

                        await deleteDoc(
                            doc(
                                db,
                                "eventos",
                                docSnap.id
                            )
                        );


                        div.remove();


                        alert(
                            "Evento removido com sucesso!"
                        );


                    } catch (erro) {

                        console.error(
                            erro
                        );


                        alert(
                            "Erro ao remover o evento."
                        );
                    }

                }
            );

        });


        // =====================================
        // IMPORTANTE:
        // criar os filtros DEPOIS de carregar
        // todos os eventos
        // =====================================

        criarFiltrosModalidades(
            listaEventos
        );


        aplicaFiltro();


    } catch (erro) {

        console.error(
            "Erro ao carregar eventos:",
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

        carregarEventos();

    }
);