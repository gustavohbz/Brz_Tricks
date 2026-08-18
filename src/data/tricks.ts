export type Trick = {
  name: string;
  level: string;
  desc: string;
  steps: string[];
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
