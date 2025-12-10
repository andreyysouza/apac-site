// server.js
// Servidor Express usando Cloudinary para upload de imagens
// e JSON para armazenar artesanatos e cachorros

const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

// -------- CLOUDINARY --------
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Storage do Cloudinary
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
// ---------- FIM CLOUDINARY ----------


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// arquivos estáticos
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "inicio.html"));
});

// garante pasta data/
if (!fs.existsSync(path.join(__dirname, "data"))) {
  fs.mkdirSync(path.join(__dirname, "data"), { recursive: true });
}


// ======= Leitura dos arquivos JSON =======
function readDataFile(tipo) {
  const filePath = tipo === "artesanato"
    ? path.join(__dirname, "data", "produtos.json")
    : path.join(__dirname, "data", "aupac.json");

  if (!fs.existsSync(filePath)) {
    const empty = tipo === "artesanato" ? { produtos: [] } : { cachorros: [] };
    fs.writeFileSync(filePath, JSON.stringify(empty, null, 2));
  }

  const raw = fs.readFileSync(filePath, "utf8");

  try {
    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed)) return { root: parsed, key: null, arr: parsed, filePath };
    if (parsed.produtos) return { root: parsed, key: "produtos", arr: parsed.produtos, filePath };
    if (parsed.cachorros) return { root: parsed, key: "cachorros", arr: parsed.cachorros, filePath };

  } catch {}

  // fallback
  const fallback = tipo === "artesanato" ? { produtos: [] } : { cachorros: [] };
  return {
    root: fallback,
    key: tipo === "artesanato" ? "produtos" : "cachorros",
    arr: fallback[tipo === "artesanato" ? "produtos" : "cachorros"],
    filePath
  };
}

function writeDataFile(filePath, root) {
  fs.writeFileSync(filePath, JSON.stringify(root, null, 2));
}


// ======= ROTAS API =======

// retornar lista
app.get("/api/:tipo", (req, res) => {
  const tipo = req.params.tipo === "artesanato" ? "artesanato" : "aupac";
  const { arr } = readDataFile(tipo);
  res.json(arr);
});

// criar
app.post("/api/add/:tipo", upload.single("imagem"), (req, res) => {
  const tipo = req.params.tipo === "artesanato" ? "artesanato" : "aupac";
  const { root, key, arr, filePath } = readDataFile(tipo);

  const novo = {
    id: Date.now(),
    nome: req.body.nome || "",
    preco: req.body.preco || null,
    descricao: req.body.descricao || "",
    categoria: req.body.categoria || null,
    porte: req.body.porte || null,
    idade: req.body.idade || null,
    sexo: req.body.sexo || null,
    whatsapp: req.body.whatsapp || null,
    obs: req.body.obs || null,
    imagem: req.file ? req.file.path : null   // URL DO CLOUDINARY
  };

  arr.push(novo);

  if (key) root[key] = arr;
  writeDataFile(filePath, root);

  res.json(novo);
});

// editar
app.put("/api/edit/:tipo/:id", upload.single("imagem"), (req, res) => {
  const tipo = req.params.tipo === "artesanato" ? "artesanato" : "aupac";
  const id = Number(req.params.id);

  const { root, key, arr, filePath } = readDataFile(tipo);

  const idx = arr.findIndex(i => i.id === id);
  if (idx === -1) return res.status(404).json({ error: "Item não encontrado" });

  const item = arr[idx];
  const campos = ["nome", "preco", "descricao", "categoria", "porte", "idade", "sexo", "whatsapp", "obs"];

  campos.forEach(c => {
    if (req.body[c] !== undefined) item[c] = req.body[c];
  });

  // nova imagem no Cloudinary
  if (req.file) item.imagem = req.file.path;

  arr[idx] = item;
  if (key) root[key] = arr;
  writeDataFile(filePath, root);

  res.json(item);
});

// deletar
app.delete("/api/delete/:tipo/:id", (req, res) => {
  const tipo = req.params.tipo === "artesanato" ? "artesanato" : "aupac";
  const id = Number(req.params.id);

  const { root, key, arr, filePath } = readDataFile(tipo);

  const novoArr = arr.filter(i => i.id !== id);

  if (key) root[key] = novoArr;
  writeDataFile(filePath, root);

  res.json({ msg: "Removido" });
});


// iniciar
app.listen(PORT, () =>
  console.log(`Servidor rodando em http://localhost:${PORT}`)
);






