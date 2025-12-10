// server.js
// Servidor Express para ler/escrever data/produtos.json e data/aupac.json
// + uploads de imagens para uploads/artesanatos e uploads/aupac
const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// servir arquivos estáticos (pasta public) e uploads para imagens
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "inicio.html"));
});

// garante que as pastas existam
const ensureDir = dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};
ensureDir(path.join(__dirname, "uploads", "artesanatos"));
ensureDir(path.join(__dirname, "uploads", "aupac"));
ensureDir(path.join(__dirname, "data"));

// ---- util: lê o arquivo e retorna { rootObj, key, arr }
// suporta formato { produtos: [...] } e { cachorros: [...] } ou array puro
function readDataFile(tipo) {
  const filePath = tipo === "artesanato" ? path.join(__dirname, "data", "produtos.json")
                                        : path.join(__dirname, "data", "aupac.json");
  if (!fs.existsSync(filePath)) {
    // cria arquivo padrão com a chave adequada
    const empty = tipo === "artesanato" ? { produtos: [] } : { cachorros: [] };
    fs.writeFileSync(filePath, JSON.stringify(empty, null, 2));
  }
  const raw = fs.readFileSync(filePath, "utf8");
  let parsed;
  try { parsed = JSON.parse(raw); } catch (e) { parsed = tipo === "artesanato" ? { produtos: [] } : { cachorros: [] }; }

  // detecta chave
  if (Array.isArray(parsed)) return { root: parsed, key: null, arr: parsed, filePath };
  if (parsed.produtos && Array.isArray(parsed.produtos)) return { root: parsed, key: "produtos", arr: parsed.produtos, filePath };
  if (parsed.cachorros && Array.isArray(parsed.cachorros)) return { root: parsed, key: "cachorros", arr: parsed.cachorros, filePath };

  // fallback: cria estrutura adequada
  const fallback = tipo === "artesanato" ? { produtos: [] } : { cachorros: [] };
  return { root: fallback, key: tipo === "artesanato" ? "produtos" : "cachorros", arr: tipo === "artesanato" ? fallback.produtos : fallback.cachorros, filePath };
}

function writeDataFile(filePath, root) {
  fs.writeFileSync(filePath, JSON.stringify(root, null, 2));
}

// ---- multer setup (usa uma rota com :tipo para escolher a pasta) ----
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tipo = req.params.tipo;
    const folder = tipo === "artesanato" ? "artesanatos" : "aupac";
    const dest = path.join(__dirname, "uploads", folder);
    ensureDir(dest);
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const safe = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, safe);
  }
});
const upload = multer({ storage });

// ---- ROTAS ----

// listar (retorna a array)
app.get("/api/:tipo", (req, res) => {
  const tipo = req.params.tipo === "artesanato" ? "artesanato" : "aupac";
  const { arr } = readDataFile(tipo);
  return res.json(arr);
});

// criar (com upload opcional)
app.post("/api/add/:tipo", upload.single("imagem"), (req, res) => {
  const tipo = req.params.tipo === "artesanato" ? "artesanato" : "aupac";
  const { root, key, arr, filePath } = readDataFile(tipo);

  // montar item com campos possíveis
  const novo = {
    id: Date.now(),
    nome: req.body.nome || req.body.titulo || "",
    preco: req.body.preco != null ? req.body.preco : null,
    descricao: req.body.descricao || req.body.descricao_curta || "",
    categoria: req.body.categoria || null,
    // campos aupac
    porte: req.body.porte || null,
    idade: req.body.idade || null,
    sexo: req.body.sexo || null,
    // contato
    whatsapp: req.body.whatsapp || null,
    // imagem: gravamos o caminho relativo que o front pode usar
    imagem: req.file ? `/uploads/${tipo === "artesanato" ? "artesanatos" : "aupac"}/${req.file.filename}` : (req.body.imagem || null)
  };

  arr.push(novo);

  // grava de volta respeitando a estrutura original
  if (key) {
    root[key] = arr;
    writeDataFile(filePath, root);
  } else {
    writeDataFile(filePath, arr);
  }

  return res.json(novo);
});

// editar (PUT) - aceita upload opcional
app.put("/api/edit/:tipo/:id", upload.single("imagem"), (req, res) => {
  const tipo = req.params.tipo === "artesanato" ? "artesanato" : "aupac";
  const id = Number(req.params.id);
  const { root, key, arr, filePath } = readDataFile(tipo);

  const idx = arr.findIndex(i => i.id === id);
  if (idx === -1) return res.status(404).json({ error: "Item não encontrado" });

  // atualiza campos (somente os enviados)
  const item = arr[idx];
  const allowed = ["nome","preco","descricao","categoria","porte","idade","sexo","whatsapp","obs"];
  allowed.forEach(k => {
    if (req.body[k] !== undefined) item[k] = req.body[k];
  });

  if (req.file) {
    item.imagem = `/uploads/${tipo === "artesanato" ? "artesanatos" : "aupac"}/${req.file.filename}`;
  }

  arr[idx] = item;
  if (key) { root[key] = arr; writeDataFile(filePath, root); } else { writeDataFile(filePath, arr); }

  return res.json(item);
});

// deletar
app.delete("/api/delete/:tipo/:id", (req, res) => {
  const tipo = req.params.tipo === "artesanato" ? "artesanato" : "aupac";
  const id = Number(req.params.id);
  const { root, key, arr, filePath } = readDataFile(tipo);

  const novoArr = arr.filter(i => i.id !== id);

  if (key) { root[key] = novoArr; writeDataFile(filePath, root); } else { writeDataFile(filePath, novoArr); }

  return res.json({ msg: "Removido" });
});

// iniciar
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));






