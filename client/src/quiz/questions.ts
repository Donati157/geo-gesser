// Banco de perguntas do quiz Zen Zone. Foco em "de qual lugar/cidade/país".
// Fotos: `wiki` (Wikipedia pt, ver wiki.ts) ou `image` (URL manual) ou `logo`
// (slug do Simple Icons -> https://cdn.simpleicons.org/{slug}).

export type QuizCategory = "lugares" | "fatos" | "comidas" | "marcas";
export type Difficulty = "facil" | "medio" | "dificil";

export interface QuizQuestion {
  id: string;
  category: QuizCategory;
  difficulty: Difficulty;
  prompt: string;
  wiki?: string;
  image?: string;
  logo?: string; // slug Simple Icons (logo da marca)
  options: [string, string, string, string];
  correct: number;
  explain?: string;
}

export const CATEGORIES: { id: QuizCategory; name: string; emoji: string; sub: string; hasPhoto: boolean }[] = [
  { id: "lugares", name: "Lugares", emoji: "🌍", sub: "fotos pelo mundo", hasPhoto: true },
  { id: "comidas", name: "Comidas", emoji: "🍽️", sub: "pratos típicos", hasPhoto: true },
  { id: "fatos", name: "Fatos do Brasil", emoji: "🇧🇷", sub: "cultura brasileira", hasPhoto: false },
  { id: "marcas", name: "Marcas", emoji: "🏷️", sub: "logos e origem", hasPhoto: true },
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
  { id: "l5", category: "lugares", difficulty: "facil", prompt: "Essas cataratas ficam na divisa de quais países?", wiki: "Cataratas do Iguaçu", options: ["Brasil e Argentina", "Brasil e Paraguai", "Argentina e Chile", "Brasil e Bolívia"], correct: 0, explain: "Ficam na fronteira Brasil–Argentina." },
  { id: "l6", category: "lugares", difficulty: "facil", prompt: "Em que país fica esse relógio?", wiki: "Big Ben", options: ["Estados Unidos", "Reino Unido", "Irlanda", "Canadá"], correct: 1, explain: "O Big Ben fica em Londres, no Reino Unido." },
  { id: "l7", category: "lugares", difficulty: "facil", prompt: "Em que país fica essa torre inclinada?", wiki: "Torre de Pisa", options: ["Itália", "Espanha", "Grécia", "Portugal"], correct: 0, explain: "A Torre de Pisa fica na Itália." },
  { id: "l8", category: "lugares", difficulty: "facil", prompt: "Em que país fica essa muralha?", wiki: "Grande Muralha da China", options: ["Japão", "China", "Coreia do Sul", "Mongólia"], correct: 1, explain: "A Grande Muralha fica na China." },
  { id: "l9", category: "lugares", difficulty: "medio", prompt: "Em que cidade fica esse centro histórico?", wiki: "Pelourinho", options: ["Recife", "Salvador", "Olinda", "São Luís"], correct: 1, explain: "O Pelourinho é o centro histórico de Salvador." },
  { id: "l10", category: "lugares", difficulty: "medio", prompt: "Em que país fica essa cidade antiga?", wiki: "Machu Picchu", options: ["Bolívia", "Peru", "Equador", "Chile"], correct: 1, explain: "Machu Picchu fica no Peru." },
  { id: "l11", category: "lugares", difficulty: "medio", prompt: "Em que país fica esse palácio?", wiki: "Taj Mahal", options: ["Índia", "Paquistão", "Irã", "Turquia"], correct: 0, explain: "O Taj Mahal fica na Índia." },
  { id: "l12", category: "lugares", difficulty: "medio", prompt: "Em que cidade está essa ponte?", wiki: "Golden Gate", options: ["Los Angeles", "Seattle", "São Francisco", "Nova York"], correct: 2, explain: "A Golden Gate fica em São Francisco." },
  { id: "l13", category: "lugares", difficulty: "medio", prompt: "Em que país fica essa igreja?", wiki: "Sagrada Família", options: ["Itália", "Portugal", "Espanha", "França"], correct: 2, explain: "A Sagrada Família fica em Barcelona, na Espanha." },
  { id: "l14", category: "lugares", difficulty: "medio", prompt: "Em que país fica essa pirâmide?", wiki: "Pirâmide de Quéops", options: ["México", "Egito", "Sudão", "Peru"], correct: 1, explain: "As pirâmides de Gizé ficam no Egito." },
  { id: "l15", category: "lugares", difficulty: "medio", prompt: "Em que país fica essa montanha?", wiki: "Monte Fuji", options: ["China", "Coreia do Sul", "Japão", "Nepal"], correct: 2, explain: "O Monte Fuji fica no Japão." },
  { id: "l16", category: "lugares", difficulty: "dificil", prompt: "Em que cidade brasileira fica esse teatro?", wiki: "Teatro Amazonas", options: ["Belém", "Manaus", "Cuiabá", "Porto Velho"], correct: 1, explain: "O Teatro Amazonas fica em Manaus." },
  { id: "l17", category: "lugares", difficulty: "dificil", prompt: "Em que cidade fica esse elevador?", wiki: "Elevador Lacerda", options: ["Salvador", "Recife", "Rio de Janeiro", "São Luís"], correct: 0, explain: "O Elevador Lacerda fica em Salvador." },
  { id: "l18", category: "lugares", difficulty: "dificil", prompt: "Em que país fica essa cidade na rocha?", wiki: "Petra", options: ["Egito", "Jordânia", "Marrocos", "Israel"], correct: 1, explain: "Petra fica na Jordânia." },
  { id: "l19", category: "lugares", difficulty: "dificil", prompt: "Em que país fica esse templo?", wiki: "Angkor Wat", options: ["Tailândia", "Vietnã", "Camboja", "Índia"], correct: 2, explain: "Angkor Wat fica no Camboja." },
  { id: "l20", category: "lugares", difficulty: "dificil", prompt: "Em que cidade fica essa catedral?", wiki: "Catedral de Brasília", options: ["Goiânia", "Brasília", "Belo Horizonte", "Palmas"], correct: 1, explain: "A Catedral de Brasília é de Oscar Niemeyer." },
  { id: "l21", category: "lugares", difficulty: "dificil", prompt: "Em que país ficam essas estátuas (moai)?", wiki: "Moai", options: ["Peru", "Chile", "Polinésia Francesa", "México"], correct: 1, explain: "Os moai ficam na Ilha de Páscoa, no Chile." },
  { id: "l22", category: "lugares", difficulty: "dificil", prompt: "Em que país fica esse castelo?", wiki: "Castelo de Neuschwanstein", options: ["Áustria", "Suíça", "Alemanha", "França"], correct: 2, explain: "O castelo de Neuschwanstein fica na Alemanha." },
  { id: "l23", category: "lugares", difficulty: "dificil", prompt: "Em que país fica esse arranha-céu?", wiki: "Burj Khalifa", options: ["Catar", "Emirados Árabes Unidos", "Arábia Saudita", "Kuwait"], correct: 1, explain: "O Burj Khalifa fica em Dubai, nos Emirados." },

  // ================= COMIDAS =================
  { id: "c1", category: "comidas", difficulty: "facil", prompt: "De qual país é esse prato?", wiki: "Feijoada", options: ["Brasil", "Portugal", "Angola", "México"], correct: 0, explain: "A feijoada é bem brasileira." },
  { id: "c2", category: "comidas", difficulty: "facil", prompt: "De qual país é o sushi?", wiki: "Sushi", options: ["China", "Coreia do Sul", "Japão", "Tailândia"], correct: 2, explain: "O sushi é do Japão." },
  { id: "c3", category: "comidas", difficulty: "facil", prompt: "De qual país é a pizza?", wiki: "Pizza", options: ["Grécia", "Itália", "EUA", "Espanha"], correct: 1, explain: "A pizza nasceu em Nápoles, Itália." },
  { id: "c4", category: "comidas", difficulty: "facil", prompt: "De qual país é o taco?", wiki: "Taco", options: ["México", "Espanha", "Argentina", "Peru"], correct: 0, explain: "O taco é do México." },
  { id: "c5", category: "comidas", difficulty: "facil", prompt: "De qual país é o hambúrguer moderno?", wiki: "Hambúrguer", options: ["Alemanha", "Estados Unidos", "Reino Unido", "Canadá"], correct: 1, explain: "O hambúrguer se popularizou nos EUA." },
  { id: "c6", category: "comidas", difficulty: "medio", prompt: "De qual país é a paella?", wiki: "Paella", options: ["Portugal", "Espanha", "Itália", "México"], correct: 1, explain: "A paella é da Espanha (Valência)." },
  { id: "c7", category: "comidas", difficulty: "medio", prompt: "De qual estado é o pão de queijo?", wiki: "Pão de queijo", options: ["São Paulo", "Minas Gerais", "Goiás", "Bahia"], correct: 1, explain: "O pão de queijo é de Minas Gerais." },
  { id: "c8", category: "comidas", difficulty: "medio", prompt: "De qual país é o croissant?", wiki: "Croissant", options: ["França", "Áustria", "Suíça", "Bélgica"], correct: 0, explain: "O croissant é associado à França." },
  { id: "c9", category: "comidas", difficulty: "medio", prompt: "De qual país é o ceviche?", wiki: "Ceviche", options: ["México", "Peru", "Chile", "Equador"], correct: 1, explain: "O ceviche é prato nacional do Peru." },
  { id: "c10", category: "comidas", difficulty: "medio", prompt: "De qual país é o pastel de nata?", wiki: "Pastel de nata", options: ["Brasil", "Espanha", "Portugal", "França"], correct: 2, explain: "O pastel de nata é de Portugal." },
  { id: "c11", category: "comidas", difficulty: "dificil", prompt: "De qual país é o pad thai?", wiki: "Pad thai", options: ["Vietnã", "Tailândia", "Indonésia", "Malásia"], correct: 1, explain: "O pad thai é da Tailândia." },
  { id: "c12", category: "comidas", difficulty: "dificil", prompt: "De qual país é o goulash?", wiki: "Goulash", options: ["Alemanha", "Polônia", "Hungria", "Áustria"], correct: 2, explain: "O goulash é da Hungria." },
  { id: "c13", category: "comidas", difficulty: "dificil", prompt: "De qual região do Brasil é o tacacá?", wiki: "Tacacá", options: ["Norte", "Nordeste", "Sul", "Centro-Oeste"], correct: 0, explain: "O tacacá é do Norte (Pará/Amazonas)." },
  { id: "c14", category: "comidas", difficulty: "dificil", prompt: "De qual país é o kebab?", wiki: "Kebab", options: ["Grécia", "Turquia", "Líbano", "Egito"], correct: 1, explain: "O kebab é associado à Turquia." },
  { id: "c15", category: "comidas", difficulty: "dificil", prompt: "De qual país é a poutine?", wiki: "Poutine", options: ["Estados Unidos", "Canadá", "França", "Bélgica"], correct: 1, explain: "A poutine é do Canadá (Quebec)." },
  { id: "c16", category: "comidas", difficulty: "dificil", prompt: "De qual país é o pierogi?", wiki: "Pierogi", options: ["Rússia", "Polônia", "Ucrânia", "Hungria"], correct: 1, explain: "O pierogi é típico da Polônia." },

  // ================= FATOS DO BRASIL =================
  { id: "f1", category: "fatos", difficulty: "facil", prompt: "O frevo é uma dança típica de qual estado?", options: ["Bahia", "Pernambuco", "Ceará", "Maranhão"], correct: 1, explain: "O frevo nasceu no Recife, Pernambuco." },
  { id: "f2", category: "fatos", difficulty: "facil", prompt: "A música 'Garota de Ipanema' fala de qual cidade?", options: ["São Paulo", "Rio de Janeiro", "Santos", "Niterói"], correct: 1, explain: "Ipanema é um bairro do Rio." },
  { id: "f3", category: "fatos", difficulty: "facil", prompt: "O filme 'Cidade de Deus' se passa em qual cidade?", options: ["São Paulo", "Rio de Janeiro", "Brasília", "Recife"], correct: 1, explain: "Cidade de Deus é um bairro do Rio." },
  { id: "f4", category: "fatos", difficulty: "facil", prompt: "Qual é a capital do Brasil?", options: ["Rio de Janeiro", "São Paulo", "Brasília", "Salvador"], correct: 2, explain: "Brasília é a capital desde 1960." },
  { id: "f5", category: "fatos", difficulty: "facil", prompt: "Qual é a maior cidade do Brasil?", options: ["Rio de Janeiro", "São Paulo", "Brasília", "Belo Horizonte"], correct: 1, explain: "São Paulo é a maior cidade do país." },
  { id: "f6", category: "fatos", difficulty: "medio", prompt: "O Festival de Parintins acontece em qual estado?", options: ["Pará", "Amazonas", "Acre", "Rondônia"], correct: 1, explain: "Parintins fica no Amazonas." },
  { id: "f7", category: "fatos", difficulty: "medio", prompt: "O bumba meu boi é tradição de qual estado?", options: ["Maranhão", "Piauí", "Bahia", "Sergipe"], correct: 0, explain: "O bumba meu boi é forte no Maranhão." },
  { id: "f8", category: "fatos", difficulty: "medio", prompt: "O Círio de Nazaré é uma festa de qual cidade?", options: ["Recife", "Belém", "Fortaleza", "São Luís"], correct: 1, explain: "O Círio acontece em Belém, no Pará." },
  { id: "f9", category: "fatos", difficulty: "medio", prompt: "O chimarrão é uma bebida típica de qual estado?", options: ["Paraná", "Santa Catarina", "Rio Grande do Sul", "São Paulo"], correct: 2, explain: "O chimarrão é do Rio Grande do Sul." },
  { id: "f10", category: "fatos", difficulty: "medio", prompt: "O açaí é uma fruta típica de qual região?", options: ["Norte", "Nordeste", "Sul", "Sudeste"], correct: 0, explain: "O açaí é típico do Norte, especialmente do Pará." },
  { id: "f11", category: "fatos", difficulty: "dificil", prompt: "A maior Oktoberfest do Brasil acontece em qual cidade?", options: ["Blumenau", "Curitiba", "Caxias do Sul", "Joinville"], correct: 0, explain: "A maior é em Blumenau (SC)." },
  { id: "f12", category: "fatos", difficulty: "dificil", prompt: "O maior São João do mundo (Campina Grande) fica em qual estado?", options: ["Pernambuco", "Paraíba", "Ceará", "Bahia"], correct: 1, explain: "Campina Grande fica na Paraíba." },
  { id: "f13", category: "fatos", difficulty: "dificil", prompt: "O maracatu é de qual estado?", options: ["Bahia", "Pernambuco", "Alagoas", "Sergipe"], correct: 1, explain: "O maracatu é de Pernambuco." },
  { id: "f14", category: "fatos", difficulty: "dificil", prompt: "O mercado Ver-o-Peso fica em qual cidade?", options: ["Manaus", "Belém", "São Luís", "Macapá"], correct: 1, explain: "O Ver-o-Peso fica em Belém, no Pará." },
  { id: "f15", category: "fatos", difficulty: "dificil", prompt: "A Festa do Peão de Barretos acontece em qual estado?", options: ["Goiás", "Minas Gerais", "São Paulo", "Mato Grosso"], correct: 2, explain: "Barretos fica em São Paulo." },

  // ================= MARCAS — LOGO (que marca é essa?) =================
  { id: "ml1", category: "marcas", difficulty: "facil", prompt: "Que marca é essa?", logo: "nike", options: ["Puma", "Nike", "Adidas", "Reebok"], correct: 1, explain: "É o 'swoosh' da Nike." },
  { id: "ml2", category: "marcas", difficulty: "facil", prompt: "Que marca é essa?", logo: "mcdonalds", options: ["Burger King", "Subway", "McDonald's", "KFC"], correct: 2, explain: "Os arcos dourados do McDonald's." },
  { id: "ml3", category: "marcas", difficulty: "facil", prompt: "Que marca é essa?", logo: "apple", options: ["Apple", "Xiaomi", "Samsung", "LG"], correct: 0, explain: "A maçã da Apple." },
  { id: "ml4", category: "marcas", difficulty: "facil", prompt: "Que marca é essa?", logo: "spotify", options: ["Deezer", "Spotify", "SoundCloud", "YouTube Music"], correct: 1, explain: "O Spotify." },
  { id: "ml5", category: "marcas", difficulty: "facil", prompt: "Que marca é essa?", logo: "netflix", options: ["HBO", "Netflix", "Disney+", "Prime Video"], correct: 1, explain: "O 'N' da Netflix." },
  { id: "ml6", category: "marcas", difficulty: "medio", prompt: "Que marca é essa?", logo: "adidas", options: ["Puma", "Fila", "Adidas", "Umbro"], correct: 2, explain: "As três listras da Adidas." },
  { id: "ml7", category: "marcas", difficulty: "medio", prompt: "Que marca é essa?", logo: "starbucks", options: ["Starbucks", "Costa Coffee", "Dunkin'", "Tim Hortons"], correct: 0, explain: "A sereia do Starbucks." },
  { id: "ml8", category: "marcas", difficulty: "medio", prompt: "Que marca é essa?", logo: "whatsapp", options: ["Telegram", "WhatsApp", "Signal", "Messenger"], correct: 1, explain: "O WhatsApp." },
  { id: "ml9", category: "marcas", difficulty: "medio", prompt: "Que marca é essa?", logo: "playstation", options: ["Xbox", "Nintendo", "PlayStation", "Sega"], correct: 2, explain: "PlayStation, da Sony." },
  { id: "ml10", category: "marcas", difficulty: "dificil", prompt: "Que marca é essa?", logo: "ferrari", options: ["Lamborghini", "Ferrari", "Maserati", "Porsche"], correct: 1, explain: "O cavalinho da Ferrari." },
  { id: "ml11", category: "marcas", difficulty: "dificil", prompt: "Que marca é essa?", logo: "puma", options: ["Puma", "Jaguar", "Kappa", "Lacoste"], correct: 0, explain: "O puma saltando." },

  // ================= MARCAS — ORIGEM (de qual país?) =================
  { id: "m1", category: "marcas", difficulty: "facil", prompt: "De qual país é a marca Havaianas?", options: ["Brasil", "Portugal", "EUA", "Argentina"], correct: 0, explain: "As Havaianas são brasileiras." },
  { id: "m2", category: "marcas", difficulty: "facil", prompt: "De qual país é a Ferrari?", options: ["Itália", "Alemanha", "França", "Espanha"], correct: 0, explain: "A Ferrari é italiana." },
  { id: "m3", category: "marcas", difficulty: "facil", prompt: "De qual país é a Samsung?", options: ["Japão", "China", "Coreia do Sul", "Taiwan"], correct: 2, explain: "A Samsung é da Coreia do Sul." },
  { id: "m4", category: "marcas", difficulty: "medio", prompt: "De qual país é a LEGO?", options: ["Alemanha", "Dinamarca", "Suécia", "Holanda"], correct: 1, explain: "A LEGO é dinamarquesa." },
  { id: "m5", category: "marcas", difficulty: "medio", prompt: "De qual país é a IKEA?", options: ["Alemanha", "Noruega", "Suécia", "Finlândia"], correct: 2, explain: "A IKEA é sueca." },
  { id: "m6", category: "marcas", difficulty: "medio", prompt: "De qual país é a Nestlé?", options: ["França", "Suíça", "Alemanha", "Bélgica"], correct: 1, explain: "A Nestlé é suíça." },
  { id: "m7", category: "marcas", difficulty: "medio", prompt: "De qual país é a Lacoste?", options: ["Itália", "França", "EUA", "Reino Unido"], correct: 1, explain: "A Lacoste é francesa." },
  { id: "m8", category: "marcas", difficulty: "dificil", prompt: "De qual país é o Spotify?", options: ["EUA", "Suécia", "Reino Unido", "Alemanha"], correct: 1, explain: "O Spotify é sueco." },
  { id: "m9", category: "marcas", difficulty: "dificil", prompt: "De qual país é a Red Bull?", options: ["Alemanha", "Suíça", "Áustria", "Holanda"], correct: 2, explain: "A Red Bull é austríaca." },
  { id: "m10", category: "marcas", difficulty: "dificil", prompt: "De qual país é a Nokia?", options: ["Suécia", "Finlândia", "Dinamarca", "Coreia do Sul"], correct: 1, explain: "A Nokia é finlandesa." },
  { id: "m11", category: "marcas", difficulty: "dificil", prompt: "De qual país é a Zara?", options: ["Itália", "Portugal", "Espanha", "França"], correct: 2, explain: "A Zara é espanhola." },
];

// Pool de perguntas: por categoria OU "hard" (todas as categorias misturadas).
export function poolFor(mode: QuizCategory | "hard", diff: Difficulty | "misto"): QuizQuestion[] {
  let pool = mode === "hard" ? QUESTIONS.slice() : QUESTIONS.filter((q) => q.category === mode);
  if (diff !== "misto") pool = pool.filter((q) => q.difficulty === diff);
  return pool;
}
