
const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const serviceAccount = require("./serviceAccountKey.json");

initializeApp({
    credential: cert(serviceAccount)
});

async function adicionarRole() {
    const uid = "2zMZuet31LWnuY7F2x6B6sbCDTD3";

    const authAdmin = getAuth();
    const usuario = await authAdmin.getUser(uid);
    const permissoesAtuais = usuario.customClaims || {};

    await authAdmin.setCustomUserClaims(uid, {
        ...permissoesAtuais,
        role: "authenticated",
        lepes_admin: true
    });

    console.log("Permissões configuradas para o administrador!");
    console.log("UID:", uid);
}

adicionarRole().catch((erro) => {
    console.error("Erro ao configurar permissões:", erro.message);
    process.exitCode = 1;
});
