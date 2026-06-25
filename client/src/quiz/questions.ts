// Banco de perguntas do quiz Zen Zone. Conteúdo MISTO: começo curado, fácil de
// adicionar/ajustar. Foco no estilo "de qual lugar/cidade/país" (sem datas).
//
// Para categorias com FOTO (lugares, comidas), o campo `wiki` é o título na
// Wikipedia (pt) — a foto é buscada automaticamente em runtime (ver wiki.ts),
// então não precisa hospedar imagem. `marcas` e `fatos` são de texto.

export type QuizCategory = "lugares" | "fatos" | "comidas" | "marcas";

export interface QuizQuestion {
  id: string;
  category: QuizCategory;
  prompt: string; // a pergunta
  wiki?: string; // título na Wikipedia pt p/ buscar a foto (categorias com imagem)
  image?: string; // foto manual (sobrepõe a da Wikipedia quando ela não serve)
  options: [string, string, string, string];
  correct: number; // índice 0-3 da resposta certa
  explain?: string; // curiosidade mostrada após responder
}

export const CATEGORIES: { id: QuizCategory; name: string; emoji: string; hasPhoto: boolean }[] = [
  { id: "lugares", name: "Lugares", emoji: "🌍", hasPhoto: true },
  { id: "comidas", name: "Comidas", emoji: "🍽️", hasPhoto: true },
  { id: "fatos", name: "Fatos do Brasil", emoji: "🇧🇷", hasPhoto: false },
  { id: "marcas", name: "Marcas", emoji: "🏷️", hasPhoto: false },
];

export const QUESTIONS: QuizQuestion[] = [
  // ---------- LUGARES (foto -> qual cidade/país) ----------
  {
    id: "l1", category: "lugares", prompt: "Que cidade é essa?", wiki: "Cristo Redentor",
    options: ["Rio de Janeiro", "São Paulo", "Salvador", "Recife"], correct: 0,
    explain: "O Cristo Redentor fica no Rio de Janeiro, no topo do Corcovado.",
  },
  {
    id: "l2", category: "lugares", prompt: "Em que país fica esse monumento?", wiki: "Torre Eiffel",
    options: ["Itália", "França", "Espanha", "Bélgica"], correct: 1,
    explain: "A Torre Eiffel fica em Paris, na França.",
  },
  {
    id: "l3", category: "lugares", prompt: "Em que país fica esse lugar?", wiki: "Coliseu",
    options: ["Grécia", "Itália", "Turquia", "Egito"], correct: 1,
    explain: "O Coliseu fica em Roma, na Itália.",
  },
  {
    id: "l4", category: "lugares", prompt: "Em que cidade está essa estátua?", wiki: "Estátua da Liberdade",
    options: ["Los Angeles", "Chicago", "Nova York", "Boston"], correct: 2,
    explain: "A Estátua da Liberdade fica em Nova York, nos EUA.",
  },
  {
    id: "l5", category: "lugares", prompt: "Essas cataratas ficam na divisa de quais países?", wiki: "Cataratas do Iguaçu",
    options: ["Brasil e Argentina", "Brasil e Paraguai", "Argentina e Chile", "Brasil e Bolívia"], correct: 0,
    explain: "As Cataratas do Iguaçu ficam na fronteira Brasil–Argentina.",
  },
  {
    id: "l6", category: "lugares", prompt: "Em que cidade fica esse centro histórico?", wiki: "Pelourinho",
    options: ["Recife", "Salvador", "Olinda", "São Luís"], correct: 1,
    explain: "O Pelourinho é o centro histórico de Salvador, na Bahia.",
  },

  // ---------- COMIDAS (foto do prato -> de qual lugar) ----------
  {
    id: "c1", category: "comidas", prompt: "De qual país é esse prato?", wiki: "Feijoada",
    options: ["Brasil", "Portugal", "Angola", "México"], correct: 0,
    explain: "A feijoada é um dos pratos mais brasileiros que existem.",
  },
  {
    id: "c2", category: "comidas", prompt: "De qual país é esse prato?", wiki: "Sushi",
    options: ["China", "Coreia do Sul", "Japão", "Tailândia"], correct: 2,
    explain: "O sushi é típico do Japão.",
  },
  {
    id: "c3", category: "comidas", prompt: "De qual país é a paella?", wiki: "Paella",
    options: ["Portugal", "Espanha", "Itália", "México"], correct: 1,
    explain: "A paella é um prato típico da Espanha, da região de Valência.",
  },
  {
    id: "c4", category: "comidas", prompt: "De qual estado brasileiro é o pão de queijo?", wiki: "Pão de queijo",
    options: ["São Paulo", "Minas Gerais", "Goiás", "Bahia"], correct: 1,
    explain: "O pão de queijo é símbolo de Minas Gerais.",
  },
  {
    id: "c5", category: "comidas", prompt: "De qual país é o taco?", wiki: "Taco",
    options: ["México", "Espanha", "Argentina", "Peru"], correct: 0,
    explain: "O taco é típico do México.",
  },

  // ---------- FATOS DO BRASIL (texto, qual lugar / qual é) ----------
  {
    id: "f1", category: "fatos", prompt: "O frevo é uma dança típica de qual estado?",
    options: ["Bahia", "Pernambuco", "Ceará", "Maranhão"], correct: 1,
    explain: "O frevo nasceu em Pernambuco, no carnaval do Recife.",
  },
  {
    id: "f2", category: "fatos", prompt: "A música 'Garota de Ipanema' fala de qual cidade?",
    options: ["São Paulo", "Rio de Janeiro", "Santos", "Niterói"], correct: 1,
    explain: "Ipanema é um bairro do Rio de Janeiro.",
  },
  {
    id: "f3", category: "fatos", prompt: "O Festival de Parintins (Boi-Bumbá) acontece em qual estado?",
    options: ["Pará", "Amazonas", "Acre", "Rondônia"], correct: 1,
    explain: "Parintins fica no Amazonas; o festival famoso é dos bois Garantido e Caprichoso.",
  },
  {
    id: "f4", category: "fatos", prompt: "O filme 'Cidade de Deus' se passa em qual cidade?",
    options: ["São Paulo", "Rio de Janeiro", "Brasília", "Belo Horizonte"], correct: 1,
    explain: "Cidade de Deus é um bairro do Rio de Janeiro.",
  },
  {
    id: "f5", category: "fatos", prompt: "O bumba meu boi é tradição forte de qual estado?",
    options: ["Maranhão", "Piauí", "Bahia", "Sergipe"], correct: 0,
    explain: "O bumba meu boi é uma das maiores tradições do Maranhão.",
  },

  // ---------- MARCAS (de qual país é a marca) ----------
  {
    id: "m1", category: "marcas", prompt: "De qual país é a marca Havaianas?",
    options: ["Brasil", "Portugal", "EUA", "Argentina"], correct: 0,
    explain: "As Havaianas são brasileiras, criadas em 1962.",
  },
  {
    id: "m2", category: "marcas", prompt: "De qual país é a LEGO?",
    options: ["Alemanha", "Dinamarca", "Suécia", "Holanda"], correct: 1,
    explain: "A LEGO é dinamarquesa; o nome vem de 'leg godt' (brincar bem).",
  },
  {
    id: "m3", category: "marcas", prompt: "De qual país é a IKEA?",
    options: ["Alemanha", "Noruega", "Suécia", "Finlândia"], correct: 2,
    explain: "A IKEA é sueca.",
  },
  {
    id: "m4", category: "marcas", prompt: "De qual país é a Samsung?",
    options: ["Japão", "China", "Coreia do Sul", "Taiwan"], correct: 2,
    explain: "A Samsung é da Coreia do Sul.",
  },
  {
    id: "m5", category: "marcas", prompt: "De qual país é a Ferrari?",
    options: ["Itália", "Alemanha", "França", "Espanha"], correct: 0,
    explain: "A Ferrari é italiana, de Maranello.",
  },
];

export function questionsByCategory(cat: QuizCategory): QuizQuestion[] {
  return QUESTIONS.filter((q) => q.category === cat);
}
