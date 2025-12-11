// server.js
// Express + Cloudinary (multer-storage-cloudinary) + Firestore (firebase-admin)

const express = require("express");
const path = require("path");

// cloudinary + multer storage
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// firebase-admin
const admin = require("firebase-admin");

const app = express();
const PORT = process.env.PORT || 3000;

/* =========== Cloudinary =========== */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const tipo = req.params.tipo === "artesanato" ? "artesanatos" : "aupac";
    return {
      folder: tipo,
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      public_id: Date.now() + "-" + file.originalname.replace(/\s+/g, "_")
    };
  }
});
const upload = multer({ storage });
/* =========== End Cloudinary =========== */

/* =========== Firestore (firebase-admin) =========== */
/*
  EXPECTS: process.env.FIREBASE_SERVICE_ACCOUNT to be a JSON string (the service account).
  On Render: add an Environment Secret named FIREBASE_SERVICE_ACCOUNT with the JSON content.
*/
if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  console.warn("Warning: FIREBASE_SERVICE_ACCOUNT not set. Local Firestore calls will fail unless set.");
} else {
  try {
    const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(sa)
    });
  } catch (err) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:", err);
    process.exit(1);
  }
}

const db = admin.apps.length ? admin.firestore() : null;
/* =========== End Firestore =========== */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve static front files
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "inicio.html")));

/* =========== Helpers =========== */
function collectionName(tipo) {
  return tipo === "artesanato" ? "produtos" : "cachorros";
}

// safe extractor for cloudinary file URL (multer-storage-cloudinary)
function fileUrlFromReqFile(file) {
  if (!file) return null;
  // multer-storage-cloudinary usually sets file.path or file.path and file.filename; check possible names
  return file.path || file.url || file.secure_url || file.location || file.path || null;
}

/* =========== API routes using Firestore =========== */

// LIST
app.get("/api/:tipo", async (req, res) => {
  const tipo = req.params.tipo === "artesanato" ? "artesanato" : "aupac";
  const collName = collectionName(tipo);

  if (!db) {
    // fallback: if Firestore not configured, return empty array to keep front working
    return res.json([]);
  }

  try {
    const snapshot = await db.collection(collName).orderBy("id", "desc").get();
    const items = snapshot.docs.map(d => d.data());
    return res.json(items);
  } catch (err) {
    console.error("Erro GET /api/:tipo", err);
    return res.status(500).json({ error: "Erro ao ler dados" });
  }
});

// CREATE
app.post("/api/add/:tipo", upload.single("imagem"), async (req, res) => {
  const tipo = req.params.tipo === "artesanato" ? "artesanato" : "aupac";
  const collName = collectionName(tipo);

  const novo = {
    id: Date.now(), // mantém compatibilidade com o front
    nome: req.body.nome || "",
    preco: req.body.preco || null,
    descricao: req.body.descricao || "",
    categoria: req.body.categoria || null,
    porte: req.body.porte || null,
    idade: req.body.idade || null,
    sexo: req.body.sexo || null,
    whatsapp: req.body.whatsapp || null,
    obs: req.body.obs || null,
    imagem: fileUrlFromReqFile(req.file) // cloudinary url
  };

  if (!db) {
    // fallback: respond success but do not persist
    return res.json(novo);
  }

  try {
    // use id as document id so front (which uses numeric id) can find by id easily
    const docId = String(novo.id);
    await db.collection(collName).doc(docId).set(novo);
    return res.json(novo);
  } catch (err) {
    console.error("Erro POST /api/add/:tipo", err);
    return res.status(500).json({ error: "Erro ao salvar item" });
  }
});

// EDIT
app.put("/api/edit/:tipo/:id", upload.single("imagem"), async (req, res) => {
  const tipo = req.params.tipo === "artesanato" ? "artesanato" : "aupac";
  const collName = collectionName(tipo);
  const id = Number(req.params.id);
  const docId = String(id);

  if (!db) {
    return res.status(500).json({ error: "Firestore não configurado" });
  }

  try {
    const docRef = db.collection(collName).doc(docId);
    const snap = await docRef.get();
    if (!snap.exists) return res.status(404).json({ error: "Item não encontrado" });

    const item = snap.data();

    const campos = ["nome", "preco", "descricao", "categoria", "porte", "idade", "sexo", "whatsapp", "obs"];
    campos.forEach(c => {
      if (req.body[c] !== undefined) item[c] = req.body[c];
    });

    if (req.file) {
      item.imagem = fileUrlFromReqFile(req.file);
    }

    await docRef.set(item);
    return res.json(item);
  } catch (err) {
    console.error("Erro PUT /api/edit/:tipo/:id", err);
    return res.status(500).json({ error: "Erro ao atualizar" });
  }
});

// DELETE
app.delete("/api/delete/:tipo/:id", async (req, res) => {
  const tipo = req.params.tipo === "artesanato" ? "artesanato" : "aupac";
  const collName = collectionName(tipo);
  const id = Number(req.params.id);
  const docId = String(id);

  if (!db) {
    return res.status(500).json({ error: "Firestore não configurado" });
  }

  try {
    await db.collection(collName).doc(docId).delete();
    return res.json({ msg: "Removido" });
  } catch (err) {
    console.error("Erro DELETE /api/delete/:tipo/:id", err);
    return res.status(500).json({ error: "Erro ao deletar" });
  }
});

app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));








