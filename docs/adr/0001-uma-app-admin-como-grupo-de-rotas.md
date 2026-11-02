# Uma só app; a administração é um grupo de rotas `/admin/*`, e o tipo de conta decide o destino

Cidadão e administração usam o mesmo deployable Next.js: `/admin/*` é um grupo de rotas protegido, sem subdomínio nem app separada. Há um único formulário de login, mas o tipo de conta é uma propriedade da própria conta (admin = conta de trabalho criada fora do self-service; cidadão = self-service com email pessoal) e não uma escolha no login; depois de autenticar, a app encaminha pelo tipo de conta. As sessões são mutuamente exclusivas (uma por browser, sem impersonação), porque o admin opera o backoffice e não precisa de ver a experiência de cidadão.

## Consequences

Papéis de administração por departamento (resíduos, iluminação, trânsito...) entram mais tarde como refinamento do tipo de conta admin, sem mudar esta arquitetura de entrada nem o modelo de sessão.

Decidido em [#2](https://github.com/Rekrl/urvox/issues/2) (2026-07-28), no mapa [#1](https://github.com/Rekrl/urvox/issues/1), entretanto substituído pela abordagem de digital twin; esta decisão mantém-se válida.
