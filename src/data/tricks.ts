/* =========================================================
   TIPOS
   ========================================================= */
export type Trick = {
  name: string;
  level: string;
  desc: string;
  steps: string[];
  /** URL de vídeo (mp4/webm) mostrada no popup de hover. Opcional. */
  video?: string;
};

export type Section = {
  id: "ollies" | "variais" | "flips";
  title: string;
  tagline: string;
  tricks: Trick[];
};


export const sections: Section[] = [
  {
    id: "ollies",
    title: "Ollies",
    tagline: "A base de tudo. Aprenda a tirar o skate do chão.",
    tricks: [
      {
        name: "Ollie",
        level: "Fundamento",
        desc: "O pulo base do skate: tail no chão e arraste do pé da frente.",
        steps: ["Pé de trás no tail, pé da frente no meio", "Bata o tail com força", "Arraste o pé da frente até o nose", "Nivele no ar e caia sobre os parafusos"],
      },
      {
        name: "Nollie",
        level: "Iniciante+",
        desc: "O mesmo ollie, mas batendo o nose com o pé da frente.",
        steps: ["Pé da frente no nose", "Bata o nose", "Arraste o pé de trás para trás", "Nivele e aterrisse"],
      },
      {
        name: "Switch Ollie",
        level: "Iniciante+",
        desc: "Ollie com a base invertida — treina os dois lados do corpo.",
        steps: ["Fique na base contrária", "Ollie normal nessa base", "Comece parado", "Depois em movimento"],
      },
      {
        name: "Fakie Ollie",
        level: "Iniciante",
        desc: "Ollie andando de ré, ótimo para transições e mini ramp.",
        steps: ["Ande de fakie devagar", "Bata o tail", "Puxe os joelhos", "Caia centralizado"],
      },
      {
        name: "Ollie North",
        level: "Estilo",
        desc: "Ollie estendendo o pé da frente à frente do nose.",
        steps: ["Ollie bem alto", "Estenda a perna da frente", "Recolha rápido", "Aterrisse nivelado"],
      },
      {
        name: "Boneless",
        level: "Iniciante",
        desc: "Pé no chão, mão no shape e volta pra cima da tábua.",
        steps: ["Tire o pé da frente", "Segure a borda do shape", "Empurre o chão e suba", "Recoloque o pé"],
      },
      {
        name: "Ollie no Meio-fio",
        level: "Obstáculo",
        desc: "Primeiro obstáculo real: subir e descer o meio-fio.",
        steps: ["Chegue reto e com velocidade", "Ollie antes da quina", "Olhe para o pouso", "Absorva com as pernas"],
      },
      {
        name: "Ollie 180 (Frontside)",
        level: "Rotação",
        desc: "Ollie girando 180° com o corpo de frente.",
        steps: ["Enrole os ombros ao contrário", "Ollie e desenrole", "Cabeça guia a rotação", "Complete o giro no ar"],
      },
      {
        name: "Ollie 180 (Backside)",
        level: "Rotação",
        desc: "Ollie 180° girando de costas — o clássico BS 180.",
        steps: ["Ombros pré-carregados", "Bata o tail e gire", "Olhe por cima do ombro", "Caia nos parafusos"],
      },
      {
        name: "Ollie na Escada",
        level: "Avançado do básico",
        desc: "Quando o ollie já é firme, encare 2 ou 3 degraus.",
        steps: ["Comece com 2 degraus", "Velocidade constante", "Ollie forte e nivelado", "Joelhos flexionados no impacto"],
      },
    ],
  },
  {
    id: "variais",
    title: "Variais",
    tagline: "Giros do shape sem flip. Controle e leitura de corpo.",
    tricks: [
      {
        name: "Shove-it",
        level: "Fundamento",
        desc: "O shape gira 180° embaixo dos pés, corpo continua reto.",
        steps: ["Pés nas bordas", "Empurre o tail para o lado", "Pule levemente", "Pise no shape ao completar o giro"],
      },
      {
        name: "Pop Shove-it",
        level: "Iniciante+",
        desc: "Shove-it com pop, o skate sobe girando.",
        steps: ["Bata o tail e empurre juntos", "Deixe o skate girar sozinho", "Espere embaixo", "Pise nos parafusos"],
      },
      {
        name: "Frontside Shove-it",
        level: "Iniciante+",
        desc: "Shove-it girando para o lado do peito.",
        steps: ["Empurre com o calcanhar", "Pop leve", "Acompanhe com o quadril", "Aterrisse centralizado"],
      },
      {
        name: "Fakie Shove-it",
        level: "Iniciante",
        desc: "Shove-it andando de ré — mais fácil de sentir o giro.",
        steps: ["Ande de fakie", "Empurre o tail", "Pule pequeno", "Pise e siga"],
      },
      {
        name: "Nollie Shove-it",
        level: "Intermediário",
        desc: "Giro do shape iniciado pelo nose.",
        steps: ["Peso à frente", "Empurre o nose lateralmente", "Pequeno pop", "Recepção nivelada"],
      },
      {
        name: "Bigspin",
        level: "Intermediário",
        desc: "Shove-it 360 combinado com body varial 180.",
        steps: ["Enrole os ombros", "Empurre o tail em 360", "Gire o corpo 180", "Encontre o shape e pise"],
      },
      {
        name: "360 Shove-it",
        level: "Intermediário",
        desc: "O shape gira uma volta completa embaixo de você.",
        steps: ["Empurrada longa no tail", "Pulo alto e paciente", "Deixe completar 360", "Pise firme"],
      },
      {
        name: "Body Varial",
        level: "Iniciante",
        desc: "Só o corpo gira 180°, o skate segue reto.",
        steps: ["Pop pequeno", "Gire quadril e ombros", "Skate permanece alinhado", "Volte a pisar"],
      },
      {
        name: "No Comply",
        level: "Iniciante",
        desc: "Pé no chão, joelho empurra o shape em 180.",
        steps: ["Deixe o pé da frente cair", "Bata o tail", "Deixe o nose girar no joelho", "Suba de volta"],
      },
      {
        name: "Powerslide",
        level: "Controle",
        desc: "Freio essencial: atravesse o skate e raspe as rodas.",
        steps: ["Boa velocidade", "Peso nos calcanhares", "Gire o skate 90°", "Volte a alinhar"],
      },
    ],
  },
  {
    id: "flips",
    title: "Flip's",
    tagline: "O shape gira no próprio eixo. Aqui começa a mágica.",
    tricks: [
      {
        name: "Kickflip",
        level: "Marco",
        desc: "O flip mais icônico: o shape gira lateralmente com o dedão.",
        steps: ["Pé da frente atrás do parafuso, na diagonal", "Ollie e raspe para a quina", "Deixe girar uma volta", "Pise com os dois pés"],
      },
      {
        name: "Heelflip",
        level: "Marco",
        desc: "Flip para o outro lado, usando o calcanhar.",
        steps: ["Pé da frente com dedos fora do shape", "Ollie e chute com o calcanhar", "Puxe os pés", "Aterrisse nos parafusos"],
      },
      {
        name: "Varial Kickflip",
        level: "Intermediário",
        desc: "Pop shove-it somado a um kickflip.",
        steps: ["Empurre o tail", "Raspe como kickflip", "Deixe girar as duas coisas", "Recepção nivelada"],
      },
      {
        name: "Varial Heelflip",
        level: "Intermediário",
        desc: "Frontside shove-it com heelflip.",
        steps: ["Shove frontside", "Chute com calcanhar", "Espere o flip completar", "Pise firme"],
      },
      {
        name: "Hardflip",
        level: "Avançado",
        desc: "Frontside shove-it com kickflip, o shape passa entre as pernas.",
        steps: ["Pop bem vertical", "Shove frontside", "Kickflip junto", "Abra as pernas e feche"],
      },
      {
        name: "Inward Heelflip",
        level: "Avançado",
        desc: "Backside shove-it combinado com heelflip.",
        steps: ["Shove backside", "Chute de calcanhar", "Rotação simultânea", "Pouso centralizado"],
      },
      {
        name: "Fakie Kickflip",
        level: "Intermediário",
        desc: "Kickflip andando de ré — muitos acham mais fácil.",
        steps: ["Fakie com velocidade leve", "Ollie de fakie", "Raspe o pé", "Caia e siga de frente"],
      },
      {
        name: "Nollie Flip",
        level: "Avançado",
        desc: "Kickflip iniciado no nose, com o pé de trás raspando.",
        steps: ["Pé da frente no nose", "Bata o nose", "Raspe com o pé de trás", "Pise nivelado"],
      },
      {
        name: "360 Flip",
        level: "Avançado",
        desc: "Tre flip: 360 shove-it com kickflip. O troféu do skate.",
        steps: ["Pé de trás no bico do tail", "Chute o tail em diagonal", "Raspe o pé da frente", "Espere as duas rotações"],
      },
      {
        name: "Kickflip no Meio-fio",
        level: "Aplicação",
        desc: "Levar o kickflip para um obstáculo de verdade.",
        steps: ["Domine no plano primeiro", "Velocidade média", "Flip antes da quina", "Olhe o pouso"],
      },
    ],
  },
];

/* =========================================================
   ROADMAP — pré-requisitos de cada manobra
   Cada item é um ponto da linha do tempo até a manobra final.
   ========================================================= */
export const roadmaps: Record<string, string[]> = {
  // ---- Ollies ----
  Ollie: ["Equilíbrio parado", "Empurrar e rolar", "Bater o tail (tic-tac)", "Ollie parado", "Ollie em movimento"],
  Nollie: ["Ollie firme", "Peso no nose", "Fakie ollie", "Nollie parado"],
  "Switch Ollie": ["Ollie firme", "Andar de switch", "Manual/equilíbrio switch", "Switch ollie parado"],
  "Fakie Ollie": ["Ollie firme", "Andar de fakie", "Bater o tail de fakie"],
  "Ollie North": ["Ollie alto", "Controle no ar", "Extensão da perna"],
  Boneless: ["Equilíbrio em uma perna", "Pegar o shape com a mão", "Boneless parado"],
  "Ollie no Meio-fio": ["Ollie em movimento", "Ollie por cima de linha no chão", "Ollie sobre obstáculo baixo"],
  "Ollie 180 (Frontside)": ["Ollie em movimento", "Body varial", "180 no chão (pivô)", "FS 180 parado"],
  "Ollie 180 (Backside)": ["Ollie em movimento", "180 no chão (pivô)", "BS 180 parado"],
  "Ollie na Escada": ["Ollie alto e nivelado", "Ollie no meio-fio", "Ollie de 2 degraus"],

  // ---- Variais ----
  "Shove-it": ["Equilíbrio parado", "Pés nas bordas", "Shove-it parado"],
  "Pop Shove-it": ["Ollie firme", "Shove-it", "Pop + empurrada juntos"],
  "Frontside Shove-it": ["Shove-it", "Pop shove-it", "Empurrada com calcanhar"],
  "Fakie Shove-it": ["Shove-it", "Andar de fakie"],
  "Nollie Shove-it": ["Pop shove-it", "Nollie", "Peso no nose"],
  Bigspin: ["Pop shove-it", "360 shove-it", "Body varial 180"],
  "360 Shove-it": ["Pop shove-it", "Empurrada longa", "Pulo alto e paciente"],
  "Body Varial": ["Equilíbrio no ar", "Pop pequeno", "180 do corpo no chão"],
  "No Comply": ["Bater o tail", "Equilíbrio em uma perna", "No comply parado"],
  Powerslide: ["Boa velocidade", "Peso nos calcanhares", "Slide de 45°"],

  // ---- Flip's ----
  Kickflip: ["Ollie firme e nivelado", "Ollie em movimento", "Raspada do pé (sem pular)", "Kickflip com pé no chão", "Kickflip parado", "Kickflip rolando"],
  Heelflip: ["Ollie firme", "Posição de pé para heel", "Chute de calcanhar sem pular", "Heelflip parado"],
  "Varial Kickflip": ["Kickflip", "Pop shove-it", "Combinar pop + raspada"],
  "Varial Heelflip": ["Heelflip", "Frontside shove-it", "Combinar shove + chute"],
  Hardflip: ["Kickflip", "Frontside pop shove-it", "Pop vertical", "Hardflip parado"],
  "Inward Heelflip": ["Heelflip", "Backside pop shove-it", "Rotação simultânea"],
  "Fakie Kickflip": ["Kickflip", "Fakie ollie", "Kickflip de fakie parado"],
  "Nollie Flip": ["Kickflip", "Nollie", "Raspada com pé de trás"],
  "360 Flip": ["Kickflip", "360 shove-it", "Chute diagonal no tail", "Tre flip parado"],
  "Kickflip no Meio-fio": ["Kickflip rolando", "Ollie no meio-fio", "Kickflip sobre linha"],
};

/** Retorna o roadmap da manobra (vazio se não houver). */
export const getRoadmap = (name: string): string[] => roadmaps[name] ?? [];
