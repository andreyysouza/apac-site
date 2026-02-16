// server.js
// Express + Cloudinary + Firestore

const express = require("express");
const path = require("path");

// Cloudinary
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// Firebase Admin (Firestore)
const admin = require("firebase-admin");

const app = express();
const PORT = process.env.PORT || 3000;

/* ======================================================
   CLOUDINARY
====================================================== */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const tipo = req.params.tipo === "artesanato" ? "artesanatos" : "aupac";

    return {
      folder: tipo,
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      public_id: Date.now() + "-" + file.originalname.replace(/\s+/g, "_"),

      // ✅ TRANSFORMAÇÃO CORRETA E ESTÁVEL
      transformation:
        tipo === "aupac"
          ? [
              {
                width: 600,
                height: 750,
                crop: "fill",
                gravity: "auto" // ✅ CORRETO (não quebra upload)
              },
              {
                quality: "auto",
                fetch_format: "auto"
              }
            ]
          : [
              {
                width: 600,
                height: 600,
                crop: "fill",
                gravity: "center"
              },
              {
                quality: "auto",
                fetch_format: "auto"
              }
            ]
    };
  }
});

const upload = multer({ storage });

/* ------------------------------------------------------
   Função segura para pegar URL do Cloudinary
------------------------------------------------------- */
function fileUrlFromReqFile(file) {
  if (!file) return null;
  return (
    file.path ||
    file.secure_url ||
    file.url ||
    file.location ||
    null
  );
}

/* ======================================================
   FIREBASE ADMIN (FIRESTORE)
====================================================== */
if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  console.warn("⚠️ FIREBASE_SERVICE_ACCOUNT não definido.");
} else {
  try {
    const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(sa)
    });
    console.log("Firebase Admin inicializado com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao inicializar Firebase Admin:", error);
    process.exit(1);
  }
}

const db = admin.apps.length ? admin.firestore() : null;

/* ======================================================
   EXPRESS CONFIG
====================================================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "inicio.html"))
);

/* Utilidade para nome de coleção */
function collectionName(tipo) {
  return tipo === "artesanato" ? "produtos" : "cachorros";
}

/* ======================================================
   API - LISTAR
====================================================== */
app.get("/api/:tipo", async (req, res) => {
  const tipo = req.params.tipo === "artesanato" ? "artesanato" : "aupac";
  const coll = collectionName(tipo);

  if (!db) return res.json([]);

  try {
    const snap = await db.collection(coll).orderBy("id", "desc").get();
    const list = snap.docs.map(doc => doc.data());
    res.json(list);
  } catch (err) {
    console.error("Erro ao listar:", err);
    res.status(500).json({ error: "Erro ao listar" });
  }
});

/* ======================================================
   API - CRIAR
====================================================== */
app.post("/api/add/:tipo", upload.single("imagem"), async (req, res) => {
  const tipo = req.params.tipo === "artesanato" ? "artesanato" : "aupac";
  const coll = collectionName(tipo);

  const novo = {
    id: Date.now(),
    nome: req.body.nome || "",
    preco: req.body.preco || null,
    descricao: req.body.descricao || "",
    categoria: req.body.categoria || null,
    porte: req.body.porte || null,
    idade: req.body.idade || null,
    sexo: req.body.sexo || null,
    especial: req.body.especial === "true",
    whatsapp: req.body.whatsapp || null,
    obs: req.body.obs || null,
    imagem: fileUrlFromReqFile(req.file)
  };

  if (!db) return res.json(novo);

  try {
    await db.collection(coll).doc(String(novo.id)).set(novo);
    res.json(novo);
  } catch (err) {
    console.error("Erro ao salvar:", err);
    res.status(500).json({ error: "Erro ao salvar" });
  }
});

/* ======================================================
   API - EDITAR
====================================================== */
app.put("/api/edit/:tipo/:id", upload.single("imagem"), async (req, res) => {
  const tipo = req.params.tipo === "artesanato" ? "artesanato" : "aupac";
  const coll = collectionName(tipo);
  const id = String(req.params.id);

  if (!db) return res.status(500).json({ error: "Firestore não configurado" });

  try {
    const docRef = db.collection(coll).doc(id);
    const snap = await docRef.get();

    if (!snap.exists)
      return res.status(404).json({ error: "Item não encontrado" });

    const item = snap.data();

    const campos = [
      "nome", "preco", "descricao", "categoria",
      "porte", "idade", "sexo", "whatsapp", "obs",  "especial"
    ];

    campos.forEach(c => {
      if (req.body[c] !== undefined) item[c] = req.body[c];
    });

    if (req.file) item.imagem = fileUrlFromReqFile(req.file);

    await docRef.set(item);
    res.json(item);
  } catch (err) {
    console.error("Erro ao editar:", err);
    res.status(500).json({ error: "Erro ao editar" });
  }
});

/* ======================================================
   API - DELETAR
====================================================== */
app.delete("/api/delete/:tipo/:id", async (req, res) => {
  const tipo = req.params.tipo === "artesanato" ? "artesanato" : "aupac";
  const coll = collectionName(tipo);
  const id = String(req.params.id);

  if (!db) return res.status(500).json({ error: "Firestore não configurado" });

  try {
    await db.collection(coll).doc(id).delete();
    res.json({ msg: "Removido" });
  } catch (err) {
    console.error("Erro ao deletar:", err);
    res.status(500).json({ error: "Erro ao deletar" });
  }
});

/* ======================================================
   START SERVER
====================================================== */
app.listen(PORT, () =>
  console.log(`Servidor rodando em http://localhost:${PORT}`)
);
















