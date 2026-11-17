# Validação de pistas

A tabela `public.pistas` possui a coluna `verificado`. Ela começa como `false`; a política de leitura pública permite consultar somente registros com `verificado = true`. Novos registros também devem permanecer ocultos até a revisão.

## Antes de aprovar uma pista

Para cada local, registrar e conferir:

- Nome oficial e existência atual do espaço.
- Endereço, cidade e estado em fonte confiável, de preferência página oficial do município, parque ou operador.
- Coordenadas conferidas no mapa e colocadas dentro do perímetro da pista, não apenas no centro do bairro ou parque.
- Descrição, tipo de piso, tamanho e nível. Deixar campos sem confirmação vazios em vez de estimar.
- Link da fonte, data da conferência e pessoa responsável pela revisão.
- Funcionamento do marcador e do link externo em desktop e celular.

Se algum item essencial não puder ser confirmado, manter `verificado = false`. Os registros antigos permanecem no banco, mas não aparecem na aplicação até a conferência.

## Google Maps

A chave usada no navegador é necessariamente visível ao visitante. No Google Cloud, conferir antes da beta:

1. Restringir a chave por HTTP referrer aos domínios de produção e de preview que realmente precisam do mapa.
2. Restringir a chave à **Maps JavaScript API**.
3. Confirmar que faturamento está ativo e definir cotas/alertas adequados ao projeto.
4. Confirmar que a chave correspondente está configurada como variável de ambiente do Lovable Cloud e não é uma chave de servidor.
5. Testar carregamento e link externo em produção e celular. Se a API falhar, a aplicação deve mostrar uma mensagem e manter a opção de abrir o Google Maps.

O código não consegue verificar se as restrições, o faturamento ou a cota estão corretos dentro da conta Google Cloud. Essa conferência exige acesso ao projeto e deve ser feita por alguém autorizado.

Referências oficiais: [segurança de chaves do Google Maps](https://developers.google.com/maps/api-security-best-practices) e [carregamento da Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/load-maps-js-api).
