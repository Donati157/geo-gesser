// Banco de perguntas do quiz Zen Zone. Conteúdo MISTO: começo curado, fácil de
// adicionar/ajustar. Foco no estilo "de qual lugar/cidade/país" (sem datas).
//
// Para categorias com FOTO (lugares, comidas), `wiki` é o título na Wikipedia
// (pt) — a foto é buscada em runtime (ver wiki.ts). `image` sobrepõe quando a
// foto da Wiki não serve. `marcas` e `fatos` são de texto.

export type QuizCategory = "lugares" | "fatos" | "comidas" | "marcas";
export type Difficulty = "facil" | "medio" | "dificil";

export interface QuizQuestion {
  id: string;
  category: QuizCategory;
  difficulty: Difficulty;
  prompt: string;
  wiki?: string;
  image?: string;
  options: [string, string, string, string];
  correct: number; // índice 0-3 da resposta certa
  explain?: string;
}

export const CATEGORIES: { id: QuizCategory; name: string; emoji: string; hasPhoto: boolean }[] = [
  { id: "lugares", name: "Lugares", emoji: "🌍", hasPhoto: true },
  { id: "comidas", name: "Comidas", emoji: "🍽️", hasPhoto: true },
  { id: "fatos", name: "Fatos do Brasil", emoji: "🇧🇷", hasPhoto: false },
  { id: "marcas", name: "Marcas", emoji: "🏷️", hasPhoto: false },
];

export const DIFFICULTIES: { id: Difficulty | "misto"; name: string; emoji: string }[] = [
  { id: "misto", name: "Misto", emoji: "🎲" },
  { id: "facil", name: "Fácil", emoji: "🟢" },
  { id: "medio", name: "Médio", emoji: "🟡" },
  { id: "dificil", name: "Difícil", emoji: "🔴" },
];

export const QUESTIONS: QuizQuestion[] = [
  // ================= LUGARES =================
  { id: "l1", category: "lugares", difficulty: "facil", prompt: "Que cidade é essa?", wiki: "Cristo Redentor", options: ["Rio de Janeiro", "São Paulo", "Salvador", "Recife"], correct: 0, explain: "O Cristo Redentor fica no Rio de Janeiro." },
  { id: "l2", category: "lugares", difficulty: "facil", prompt: "Em que país fica esse monumento?", wiki: "Torre Eiffel", options: ["Itália", "França", "Espanha", "Bélgica"], correct: 1, explain: "A Torre Eiffel fica em Paris, na França." },
  { id: "l3", category: "lugares", difficulty: "facil", prompt: "Em que país fica esse lugar?", wiki: "Coliseu", options: ["Grécia", "Itália", "Turquia", "Egito"], correct: 1, explain: "O Coliseu fica em Roma, na Itália." },
  { id: "l4", category: "lugares", difficulty: "facil", prompt: "Em que cidade está essa estátua?", wiki: "Estátua da Liberdade", options: ["Los Angeles", "Chicago", "Nova York", "Boston"], correct: 2, explain: "A Estátua da Liberdade fica em Nova York." },
  { id: "l5", category: "lugares", difficulty: "facil", prompt: "Essas cataratas ficam na divisa de quais países?", wiki: "Cataratas do Iguaçu", options: ["Brasil e Argentina", "Brasil e Paraguai", "Argentina e Chile", "Brasil e Bolívia"], correct: 0, explain: "As Cataratas do Iguaçu ficam na fronteira Brasil–Argentina." },
  { id: "l6", category: "lugares", difficulty: "facil", prompt: "Em que país fica esse relógio?", wiki: "Big Ben", options: ["Estados Unidos", "Reino Unido", "Irlanda", "Canadá"], correct: 1, explain: "O Big Ben fica em Londres, no Reino Unido." },
  { id: "l7", category: "lugares", difficulty: "medio", prompt: "Em que cidade fica esse centro histórico?", wiki: "Pelourinho", options: ["Recife", "Salvador", "Olinda", "São Luís"], correct: 1, explain: "O Pelourinho é o centro histórico de Salvador, na Bahia." },
  { id: "l8", category: "lugares", difficulty: "medio", prompt: "Em que país fica essa cidade antiga?", wiki: "Machu Picchu", options: ["Bolívia", "Peru", "Equador", "Chile"], correct: 1, explain: "Machu Picchu fica no Peru, nos Andes." },
  { id: "l9", category: "lugares", difficulty: "medio", prompt: "Em que país fica esse palácio?", wiki: "Taj Mahal", options: ["Índia", "Paquistão", "Irã", "Turquia"], correct: 0, explain: "O Taj Mahal fica em Agra, na Índia." },
  { id: "l10", category: "lugares", difficulty: "medio", prompt: "Em que cidade está essa ponte?", wiki: "Golden Gate", options: ["Los Angeles", "Seattle", "São Francisco", "Nova York"], correct: 2, explain: "A Golden Gate fica em São Francisco, nos EUA." },
  { id: "l11", category: "lugares", difficulty: "medio", prompt: "Em que país fica essa igreja inacabada?", wiki: "Sagrada Família", options: ["Itália", "Portugal", "Espanha", "França"], correct: 2, explain: "A Sagrada Família fica em Barcelona, na Espanha." },
  { id: "l12", category: "lugares", difficulty: "dificil", prompt: "Em que cidade brasileira fica esse teatro?", wiki: "Teatro Amazonas", options: ["Belém", "Manaus", "Cuiabá", "Porto Velho"], correct: 1, explain: "O Teatro Amazonas fica em Manaus." },
  { id: "l13", category: "lugares", difficulty: "dificil", prompt: "Em que cidade fica esse elevador histórico?", wiki: "Elevador Lacerda", options: ["Salvador", "Recife", "Rio de Janeiro", "São Luís"], correct: 0, explain: "O Elevador Lacerda fica em Salvador, na Bahia." },
  { id: "l14", category: "lugares", difficulty: "dificil", prompt: "Em que país fica essa cidade esculpida na rocha?", wiki: "Petra", options: ["Egito", "Jordânia", "Marrocos", "Israel"], correct: 1, explain: "Petra fica na Jordânia." },
  { id: "l15", category: "lugares", difficulty: "dificil", prompt: "Em que país fica esse templo?", wiki: "Angkor Wat", options: ["Tailândia", "Vietnã", "Camboja", "Índia"], correct: 2, explain: "Angkor Wat fica no Camboja." },
  { id: "l16", category: "lugares", difficulty: "dificil", prompt: "Em que cidade fica essa catedral?", wiki: "Catedral de Brasília", options: ["Goiânia", "Brasília", "Belo Horizonte", "Palmas"], correct: 1, explain: "A Catedral de Brasília é obra de Oscar Niemeyer." },

  // ================= COMIDAS =================
  { id: "c1", category: "comidas", difficulty: "facil", prompt: "De qual país é esse prato?", wiki: "Feijoada", options: ["Brasil", "Portugal", "Angola", "México"], correct: 0, explain: "A feijoada é um dos pratos mais brasileiros que existem." },
  { id: "c2", category: "comidas", difficulty: "facil", prompt: "De qual país é o sushi?", wiki: "Sushi", options: ["China", "Coreia do Sul", "Japão", "Tailândia"], correct: 2, explain: "O sushi é típico do Japão." },
  { id: "c3", category: "comidas", difficulty: "facil", prompt: "De qual país é a pizza?", wiki: "Pizza", options: ["Grécia", "Itália", "EUA", "Espanha"], correct: 1, explain: "A pizza nasceu em Nápoles, na Itália." },
  { id: "c4", category: "comidas", difficulty: "facil", prompt: "De qual país é o taco?", wiki: "Taco", options: ["México", "Espanha", "Argentina", "Peru"], correct: 0, explain: "O taco é típico do México." },
  { id: "c5", category: "comidas", difficulty: "medio", prompt: "De qual país é a paella?", wiki: "Paella", options: ["Portugal", "Espanha", "Itália", "México"], correct: 1, explain: "A paella é típica da região de Valência, na Espanha." },
  { id: "c6", category: "comidas", difficulty: "medio", prompt: "De qual estado brasileiro é o pão de queijo?", wiki: "Pão de queijo", options: ["São Paulo", "Minas Gerais", "Goiás", "Bahia"], correct: 1, explain: "O pão de queijo é símbolo de Minas Gerais." },
  { id: "c7", category: "comidas", difficulty: "medio", prompt: "De qual país é o croissant?", wiki: "Croissant", options: ["França", "Áustria", "Suíça", "Bélgica"], correct: 0, explain: "O croissant é associado à França (com raízes austríacas)." },
  { id: "c8", category: "comidas", difficulty: "medio", prompt: "De qual país é o ceviche?", wiki: "Ceviche", options: ["México", "Peru", "Chile", "Equador"], correct: 1, explain: "O ceviche é prato nacional do Peru." },
  { id: "c9", category: "comidas", difficulty: "dificil", prompt: "De qual país é o pad thai?", wiki: "Pad thai", options: ["Vietnã", "Tailândia", "Indonésia", "Malásia"], correct: 1, explain: "O pad thai é típico da Tailândia." },
  { id: "c10", category: "comidas", difficulty: "dificil", prompt: "De qual país é o goulash?", wiki: "Goulash", options: ["Alemanha", "Polônia", "Hungria", "Áustria"], correct: 2, explain: "O goulash é típico da Hungria." },
  { id: "c11", category: "comidas", difficulty: "dificil", prompt: "De qual região do Brasil é o tacacá?", wiki: "Tacacá", options: ["Norte", "Nordeste", "Sul", "Centro-Oeste"], correct: 0, explain: "O tacacá é típico do Norte, especialmente do Pará e Amazonas." },

  // ================= FATOS DO BRASIL =================
  { id: "f1", category: "fatos", difficulty: "facil", prompt: "O frevo é uma dança típica de qual estado?", options: ["Bahia", "Pernambuco", "Ceará", "Maranhão"], correct: 1, explain: "O frevo nasceu no carnaval do Recife, em Pernambuco." },
  { id: "f2", category: "fatos", difficulty: "facil", prompt: "A música 'Garota de Ipanema' fala de qual cidade?", options: ["São Paulo", "Rio de Janeiro", "Santos", "Niterói"], correct: 1, explain: "Ipanema é um bairro do Rio de Janeiro." },
  { id: "f3", category: "fatos", difficulty: "facil", prompt: "O filme 'Cidade de Deus' se passa em qual cidade?", options: ["São Paulo", "Rio de Janeiro", "Brasília", "Recife"], correct: 1, explain: "Cidade de Deus é um bairro do Rio de Janeiro." },
  { id: "f4", category: "fatos", difficulty: "facil", prompt: "Qual é a capital do Brasil?", options: ["Rio de Janeiro", "São Paulo", "Brasília", "Salvador"], correct: 2, explain: "Brasília é a capital desde 1960." },
  { id: "f5", category: "fatos", difficulty: "medio", prompt: "O Festival de Parintins (Boi-Bumbá) acontece em qual estado?", options: ["Pará", "Amazonas", "Acre", "Rondônia"], correct: 1, explain: "Parintins fica no Amazonas; os bois são Garantido e Caprichoso." },
  { id: "f6", category: "fatos", difficulty: "medio", prompt: "O bumba meu boi é tradição forte de qual estado?", options: ["Maranhão", "Piauí", "Bahia", "Sergipe"], correct: 0, explain: "O bumba meu boi é uma das maiores tradições do Maranhão." },
  { id: "f7", category: "fatos", difficulty: "medio", prompt: "O Círio de Nazaré é uma grande festa religiosa de qual cidade?", options: ["Recife", "Belém", "Fortaleza", "São Luís"], correct: 1, explain: "O Círio de Nazaré acontece em Belém, no Pará." },
  { id: "f8", category: "fatos", difficulty: "medio", prompt: "A novela 'Pantanal' se passa em qual região?", options: ["Nordeste", "Centro-Oeste", "Norte", "Sudeste"], correct: 1, explain: "O Pantanal fica no Centro-Oeste (MT/MS)." },
  { id: "f9", category: "fatos", difficulty: "dificil", prompt: "A Oktoberfest brasileira mais famosa acontece em qual cidade?", options: ["Blumenau", "Curitiba", "Caxias do Sul", "Joinville"], correct: 0, explain: "A maior Oktoberfest do Brasil é em Blumenau (SC)." },
  { id: "f10", category: "fatos", difficulty: "dificil", prompt: "O maior São João do mundo (Campina Grande) fica em qual estado?", options: ["Pernambuco", "Paraíba", "Ceará", "Bahia"], correct: 1, explain: "Campina Grande fica na Paraíba." },
  { id: "f11", category: "fatos", difficulty: "dificil", prompt: "O maracatu é uma manifestação cultural de qual estado?", options: ["Bahia", "Pernambuco", "Alagoas", "Sergipe"], correct: 1, explain: "O maracatu é típico de Pernambuco." },

  // ================= MARCAS =================
  { id: "m1", category: "marcas", difficulty: "facil", prompt: "De qual país é a marca Havaianas?", options: ["Brasil", "Portugal", "EUA", "Argentina"], correct: 0, explain: "As Havaianas são brasileiras, criadas em 1962." },
  { id: "m2", category: "marcas", difficulty: "facil", prompt: "De qual país é a Ferrari?", options: ["Itália", "Alemanha", "França", "Espanha"], correct: 0, explain: "A Ferrari é italiana, de Maranello." },
  { id: "m3", category: "marcas", difficulty: "facil", prompt: "De qual país é o McDonald's?", options: ["Canadá", "EUA", "Reino Unido", "Austrália"], correct: 1, explain: "O McDonald's nasceu nos Estados Unidos." },
  { id: "m4", category: "marcas", difficulty: "facil", prompt: "De qual país é a Samsung?", options: ["Japão", "China", "Coreia do Sul", "Taiwan"], correct: 2, explain: "A Samsung é da Coreia do Sul." },
  { id: "m5", category: "marcas", difficulty: "medio", prompt: "De qual país é a LEGO?", options: ["Alemanha", "Dinamarca", "Suécia", "Holanda"], correct: 1, explain: "A LEGO é dinamarquesa; o nome vem de 'leg godt' (brincar bem)." },
  { id: "m6", category: "marcas", difficulty: "medio", prompt: "De qual país é a IKEA?", options: ["Alemanha", "Noruega", "Suécia", "Finlândia"], correct: 2, explain: "A IKEA é sueca." },
  { id: "m7", category: "marcas", difficulty: "medio", prompt: "De qual país é a Nestlé?", options: ["França", "Suíça", "Alemanha", "Bélgica"], correct: 1, explain: "A Nestlé é suíça." },
  { id: "m8", category: "marcas", difficulty: "medio", prompt: "De qual país é a Lacoste?", options: ["Itália", "França", "EUA", "Reino Unido"], correct: 1, explain: "A Lacoste (do crocodilo) é francesa." },
  { id: "m9", category: "marcas", difficulty: "dificil", prompt: "De qual país é o Spotify?", options: ["EUA", "Suécia", "Reino Unido", "Alemanha"], correct: 1, explain: "O Spotify foi criado na Suécia." },
  { id: "m10", category: "marcas", difficulty: "dificil", prompt: "De qual país é a Red Bull?", options: ["Alemanha", "Suíça", "Áustria", "Holanda"], correct: 2, explain: "A Red Bull é austríaca." },
  { id: "m11", category: "marcas", difficulty: "dificil", prompt: "De qual país é a Nokia?", options: ["Suécia", "Finlândia", "Dinamarca", "Coreia do Sul"], correct: 1, explain: "A Nokia é da Finlândia." },
  { id: "m12", category: "marcas", difficulty: "dificil", prompt: "De qual país é a Zara?", options: ["Itália", "Portugal", "Espanha", "França"], correct: 2, explain: "A Zara é espanhola, do grupo Inditex." },
];

export function questionsByCategory(cat: QuizCategory): QuizQuestion[] {
  return QUESTIONS.filter((q) => q.category === cat);
}

export function pickRound(cat: QuizCategory, diff: Difficulty | "misto", size: number): QuizQuestion[] {
  let pool = QUESTIONS.filter((q) => q.category === cat);
  if (diff !== "misto") pool = pool.filter((q) => q.difficulty === diff);
  // embaralha
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, size);
}
